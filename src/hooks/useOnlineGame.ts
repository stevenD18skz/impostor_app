'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { categorias } from '@/lib/data';
import {
  EV_HELLO,
  EV_INTENT,
  EV_STATE,
  MIN_PLAYERS,
  buildGame,
  channelName,
  clearSession,
  nameTaken,
  newRoomState,
  normalizeCode,
  randomId,
  readPresence,
  readSessionFor,
  releaseTopic,
  resolveHostId,
  sanitizeSettings,
  writeSession,
  type Intent,
  type Phase,
  type Player,
  type RoomState,
  type Session,
  type Settings,
} from '@/lib/room';

const cats = categorias as Record<string, { nombre: string; palabras: string[] }>;

export type LinkStatus = 'idle' | 'connecting' | 'connected' | 'error';

/*
  Toda la sala online, sin una sola consulta a la base de datos.

  El reparto de tareas es el mismo de un juego de mesa: el host tiene el tablero
  y los demás le piden cosas. Nadie modifica el estado por su cuenta, así que no
  hay dos versiones de la verdad que reconciliar después.

  El código de sala viene de la URL (`/room/ABC123`), no de un estado interno:
  compartir el enlace es compartir la sala, y un F5 cae exactamente donde estaba.
*/

/** Aplica una intención sobre el estado. Devuelve `null` si no venía al caso. */
function reduce(state: RoomState, intent: Intent, players: Player[]): RoomState | null {
  switch (intent.action) {
    case 'settings': {
      if (state.phase !== 'lobby') return null;
      const settings = sanitizeSettings(intent.settings, state.settings, players.length);
      const same =
        settings.category === state.settings.category &&
        settings.numImpostors === state.settings.numImpostors;
      return same ? null : { ...state, settings };
    }

    case 'start': {
      if (state.phase !== 'lobby' || players.length < MIN_PLAYERS) return null;
      const settings = sanitizeSettings({}, state.settings, players.length);
      const words = cats[settings.category]?.palabras;
      if (!words?.length) return null;
      return { ...state, phase: 'reveal', settings, game: buildGame(players, settings, words) };
    }

    case 'ready': {
      if (state.phase !== 'reveal' || !state.game) return null;
      if (state.game.readyIds.includes(intent.playerId)) return null;
      // Quien no recibió carta no tiene nada que confirmar.
      if (!state.game.order.some((o) => o.id === intent.playerId)) return null;
      const readyIds = [...state.game.readyIds, intent.playerId];
      return advanceIfAllReady({ ...state, game: { ...state.game, readyIds } }, players);
    }

    case 'end': {
      if (state.phase !== 'playing' && state.phase !== 'reveal') return null;
      return { ...state, phase: 'ended' };
    }

    case 'reset': {
      if (state.phase === 'lobby') return null;
      // Los ajustes sobreviven: lo normal es volver a jugar con lo mismo.
      return { ...state, phase: 'lobby', game: null };
    }

    default:
      return null;
  }
}

/**
 * Arranca la partida cuando ya no queda nadie por confirmar.
 *
 * Se mide contra quién está en Presence AHORA y no contra quiénes empezaron: si
 * alguien cierra la pestaña durante el reparto de cartas, los demás no se
 * quedan esperando para siempre a un jugador que ya no está.
 */
function advanceIfAllReady(state: RoomState, players: Player[]): RoomState {
  if (state.phase !== 'reveal' || !state.game) return state;
  const game = state.game;
  const present = players.filter((p) => game.order.some((o) => o.id === p.id)).map((p) => p.id);
  const pending = present.filter((id) => !game.readyIds.includes(id));
  if (pending.length > 0 || present.length === 0) return state;
  return { ...state, phase: 'playing' };
}

/** Cuánto tarda en darse por vacía una sala que nadie contesta. */
const EMPTY_ROOM_GRACE_MS = 2500;

/** Cuántas veces seguidas se intenta rehacer el canal antes de rendirse. */
const MAX_RELINKS = 8;

/** Un canal que aguanta este rato se da por sano y borra los intentos fallidos. */
const HEALTHY_AFTER_MS = 20000;

export function useOnlineGame(rawCode: string) {
  const code = normalizeCode(rawCode);

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [status, setStatus] = useState<LinkStatus>('idle');
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  /** Por qué no se pudo entrar: sala inexistente, nombre repetido, sin conexión. */
  const [joinError, setJoinError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  /** Sube para rehacer el canal desde cero. Ver `relink`. */
  const [link, setLink] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<RoomState | null>(null);
  const playersRef = useRef<Player[]>([]);
  const sessionRef = useRef<Session | null>(null);
  const hostIdRef = useRef<string | null>(null);
  const subscribedRef = useRef(false);
  /** Este canal no es la primera entrada, sino la vuelta de una caída. */
  const rejoinRef = useRef(false);
  /** Si alguna vez llegamos a estar dentro de la sala con este nombre. */
  const admittedOnceRef = useRef(false);
  const relinkAttemptsRef = useRef(0);

  sessionRef.current = session;
  playersRef.current = players;

  const hostId = useMemo(() => resolveHostId(players), [players]);
  hostIdRef.current = hostId;

  const me = useMemo(
    () => players.find((p) => p.id === session?.playerId) ?? null,
    [players, session?.playerId],
  );
  const isHost = Boolean(session && hostId === session.playerId);

  /* ── Envío ───────────────────────────────────────────────────────────── */

  const emit = useCallback((event: string, payload: unknown) => {
    const channel = channelRef.current;
    if (!channel || !subscribedRef.current) return;
    void channel.send({ type: 'broadcast', event, payload }).catch(() => undefined);
  }, []);

  const adopt = useCallback((state: RoomState) => {
    stateRef.current = state;
    setRoom(state);
  }, []);

  /** Reparte el estado y lo aplica en casa. Solo lo llama el host. */
  const publish = useCallback(
    (next: RoomState) => {
      const stamped = { ...next, v: next.v + 1 };
      adopt(stamped);
      emit(EV_STATE, stamped);
    },
    [adopt, emit],
  );

  /**
   * El único camino por el que cambia algo. Si soy el host lo resuelvo y lo
   * reparto; si no, se lo paso a quien manda y espero su versión.
   */
  const dispatch = useCallback(
    (intent: Intent) => {
      const current = sessionRef.current;
      if (!current) return;
      if (hostIdRef.current === current.playerId) {
        const state = stateRef.current;
        if (!state) return;
        const next = reduce(state, intent, playersRef.current);
        if (next) publish(next);
      } else {
        emit(EV_INTENT, intent);
      }
    },
    [emit, publish],
  );

  /* ── Restaurar la sesión de ESTA sala ────────────────────────────────── */

  useEffect(() => {
    setSession(readSessionFor(code));
    setIsRestoringSession(false);
  }, [code]);

  /* ── El canal ────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!session || session.code !== code) {
      setStatus('idle');
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus('error');
      return;
    }

    setStatus('connecting');
    const { playerId, name } = session;

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let recover: ReturnType<typeof setInterval> | null = null;
    let graceTimer: ReturnType<typeof setTimeout> | null = null;
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    let healthTimer: ReturnType<typeof setTimeout> | null = null;
    let relinkTimer: ReturnType<typeof setTimeout> | null = null;
    /** Hasta no estar admitido no se publica presencia: primero se mira la sala. */
    let admitted = false;
    /** Lo último publicado en Presence, para no repetirlo. Ver `track`. */
    let tracked: string | null = null;
    /** Firma del último roster visto, para no repartir el estado por triplicado. */
    let lastRoster: string | null = null;

    const reject = (message: string) => {
      if (cancelled) return;
      cancelled = true;
      clearSession();
      stateRef.current = null;
      setRoom(null);
      setPlayers([]);
      setStatus('idle');
      setJoinError(message);
      setSession(null);
    };

    /**
     * Rehace el canal desde cero.
     *
     * Es el único camino de vuelta cuando el servidor nos echa. `realtime-js`
     * marca el canal como `closed`, lo saca del socket y no lo reintenta nunca;
     * y aunque lo reintentara, no vuelve a mandar el `track()`, así que
     * quedaríamos dentro del canal pero invisibles en Presence para los demás.
     */
    const relink = () => {
      if (cancelled || relinkTimer) return;
      const attempt = relinkAttemptsRef.current++;
      if (attempt >= MAX_RELINKS) {
        setStatus('error');
        return;
      }
      // Solo se salta la puerta quien ya estaba dentro. Si el canal se cayó
      // antes de entrar, el reintento vuelve a pasar por las comprobaciones:
      // que la sala exista y que el nombre esté libre.
      rejoinRef.current = admittedOnceRef.current;
      subscribedRef.current = false;
      setStatus('connecting');
      relinkTimer = setTimeout(
        () => {
          if (!cancelled) setLink((n) => n + 1);
        },
        Math.min(600 * 2 ** attempt, 8000),
      );
    };

    const start = async () => {
      // Sin esto la sala no abre: ver `releaseTopic`.
      await releaseTopic(channelName(code));
      if (cancelled) return;

      channel = supabase.channel(channelName(code), {
        config: {
          // Una ranura de Presence por jugador: volver a hacer `track`
          // reemplaza la propia en vez de duplicarla.
          presence: { key: playerId, enabled: true },
          broadcast: { self: false },
        },
      });
      channelRef.current = channel;
      subscribedRef.current = false;

      /**
       * Anunciarse en Presence, pero solo si de verdad cambió algo.
       *
       * Presence NO se parece a Broadcast. El servidor deja pasar decenas de
       * mensajes de broadcast por segundo sin inmutarse, pero corta el canal a
       * las pocas actualizaciones de Presence: contesta
       * «Client presence rate limit exceeded» y cierra. Medido contra el
       * proyecto real, cinco `track()` bastan para que te eche, aunque vayan
       * separados por segundos.
       *
       * Por eso aquí solo se publica la identidad —id, nombre y si manda—, nada
       * que cambie durante la partida, y por eso se compara antes de mandar:
       * repetir lo mismo no dice nada nuevo y cuesta el canal.
       */
      const track = (asHost: boolean) => {
        const payload: Player = { id: playerId, name, isHost: asHost };
        const key = JSON.stringify(payload);
        if (tracked === key) return;
        tracked = key;
        void channel
          ?.track(payload)
          .then((res) => {
            // Si no llegó, que el siguiente intento pueda reintentarlo.
            if (res !== 'ok' && tracked === key) tracked = null;
          })
          .catch(() => {
            if (tracked === key) tracked = null;
          });
      };

      /** Decide si este navegador puede entrar, mirando quién había ANTES de anunciarse. */
      const admit = (roster: Player[]) => {
        if (rejoinRef.current) {
          // Volvemos de una caída del canal: ya estábamos dentro, no hay nada
          // que validar y la sala no puede darse por muerta.
          admitted = true;
          if (graceTimer) {
            clearTimeout(graceTimer);
            graceTimer = null;
          }
          track(hostIdRef.current === playerId);
          emit(EV_HELLO, { playerId });
          return true;
        }

        if (session.isHost) {
          // El que creó la sala llega con el tablero puesto.
          if (!stateRef.current || stateRef.current.code !== code) {
            stateRef.current = newRoomState(code);
          }
          admitted = true;
          track(true);
          publish(stateRef.current);
          return true;
        }

        if (nameTaken(roster, name, playerId)) {
          reject('Ese nombre ya está tomado en la sala. Elige otro.');
          return false;
        }

        if (roster.length === 0) {
          // Puede ser que Presence todavía no traiga a nadie. Se le da un
          // respiro antes de dar la sala por muerta.
          if (!graceTimer) {
            graceTimer = setTimeout(() => {
              if (cancelled || admitted) return;
              if (channel && readPresence(channel).length === 0) {
                reject('Esa sala no existe o ya se cerró.');
              }
            }, EMPTY_ROOM_GRACE_MS);
          }
          return false;
        }

        admitted = true;
        if (graceTimer) clearTimeout(graceTimer);
        track(false);
        emit(EV_HELLO, { playerId });
        return true;
      };

      const syncPresence = () => {
        if (cancelled || !channel) return;
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        const roster = readPresence(channel);

        if (!admitted && !admit(roster)) return;
        admittedOnceRef.current = true;

        // Un solo cambio de Presence llega por triplicado: el `leave`, el `join`
        // y el `sync` del mismo movimiento. Sin esta firma, cada uno volvería a
        // repartir el estado y a redibujar la lista sin que nada hubiera
        // cambiado.
        const signature = roster.map((p) => `${p.id}${p.isHost ? '*' : ''}`).join(',');
        const rosterChanged = signature !== lastRoster;
        lastRoster = signature;

        if (rosterChanged) {
          playersRef.current = roster;
          setPlayers(roster);
        }

        const nextHost = resolveHostId(roster);
        hostIdRef.current = nextHost;
        const mine = roster.find((p) => p.id === playerId);

        if (nextHost !== playerId) {
          // Decía ser anfitrión y no lo es: pasa cuando el creador vuelve de un
          // F5 y otro ya había tomado el relevo. Se baja la bandera para que no
          // queden dos declarados.
          if (mine?.isHost) track(false);
          return;
        }

        // Me tocó mandar. Puede ser porque creé la sala o porque el host
        // anterior cerró la pestaña; en el segundo caso el tablero ya lo tengo,
        // porque todos guardan la última copia que repartió el host.
        if (mine && !mine.isHost) track(true);

        const current = stateRef.current;
        if (!current) return;

        // Alguien nuevo entró (o alguien se fue durante el reparto de cartas):
        // se le manda el tablero y, de paso, se revisa si ya no falta nadie por
        // confirmar.
        const advanced = advanceIfAllReady(current, roster);
        if (advanced !== current) publish(advanced);
        else if (rosterChanged) emit(EV_STATE, current);
      };

      channel.on('presence', { event: 'sync' }, syncPresence);
      channel.on('presence', { event: 'join' }, syncPresence);
      channel.on('presence', { event: 'leave' }, syncPresence);

      channel.on('broadcast', { event: EV_STATE }, ({ payload }) => {
        const incoming = payload as RoomState | undefined;
        if (!incoming || incoming.code !== code) return;
        // Un estado viejo que llega tarde no debe pisar al nuevo.
        if (stateRef.current && incoming.v < stateRef.current.v) return;
        adopt(incoming);
      });

      channel.on('broadcast', { event: EV_HELLO }, ({ payload }) => {
        const current = stateRef.current;
        if (!current) return;
        const asker = (payload as { playerId?: string })?.playerId;
        // Contesta el host. Y también contesta cualquiera cuando el que
        // pregunta ES el host: es el caso del anfitrión que recargó la página y
        // volvió con las manos vacías mientras la partida seguía.
        const iAmHost = hostIdRef.current === playerId;
        if (!iAmHost && asker !== hostIdRef.current) return;
        emit(EV_STATE, current);
      });

      channel.on('broadcast', { event: EV_INTENT }, ({ payload }) => {
        if (hostIdRef.current !== playerId) return;
        const current = stateRef.current;
        if (!current) return;
        const next = reduce(current, payload as Intent, playersRef.current);
        if (next) publish(next);
      });

      channel.subscribe((state) => {
        if (cancelled) return;
        if (state === 'SUBSCRIBED') {
          subscribedRef.current = true;
          setStatus('connected');
          setJoinError(null);
          // Un canal que aguanta un rato borra los intentos fallidos: así una
          // caída de ahora no gasta el cupo de reintentos de dentro de una hora.
          healthTimer = setTimeout(() => {
            relinkAttemptsRef.current = 0;
          }, HEALTHY_AFTER_MS);
          // Unido pero sin noticias de Presence: no hay forma de saber quién
          // está ni de entrar. Mejor decirlo que dejar la pantalla girando.
          silenceTimer = setTimeout(() => {
            if (!cancelled && !admitted) setStatus('error');
          }, 8000);
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
          subscribedRef.current = false;
          // `CLOSED` no es benigno: es como avisa el servidor de que nos echó
          // del canal —pasarse con Presence es la forma más fácil de que pase—.
          // Antes se ignoraba, y quien lo recibía se quedaba con la lista de
          // jugadores congelada, dentro de una sala donde ya nadie lo veía.
          relink();
        }
      });

      /*
        Red de seguridad para no quedarse mirando "Entrando a la sala...".

        Si el saludo o la respuesta se perdieron, se vuelve a saludar. Y si me
        tocó mandar sin tablero y no queda nadie más a quien pedírselo, se abre
        un lobby nuevo: es lo único razonable cuando ya no hay copia del estado
        en ningún navegador.
      */
      recover = setInterval(() => {
        if (cancelled || !admitted || stateRef.current) return;
        emit(EV_HELLO, { playerId });
        if (hostIdRef.current === playerId && playersRef.current.length <= 1) {
          publish(newRoomState(code));
        }
      }, 2500);
    };

    void start();

    return () => {
      cancelled = true;
      if (recover) clearInterval(recover);
      if (graceTimer) clearTimeout(graceTimer);
      if (silenceTimer) clearTimeout(silenceTimer);
      if (healthTimer) clearTimeout(healthTimer);
      if (relinkTimer) clearTimeout(relinkTimer);
      subscribedRef.current = false;
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
    // `code`, la identidad y `link` —rehacer el canal— son lo único que debe
    // reabrirlo. Nada del estado de la partida entra aquí: reabrir el canal por
    // un cambio de ajustes es justo lo que tumbaba la sala.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, link, session?.playerId, session?.name, session?.isHost, session?.code]);

  /* ── Entrar y salir ──────────────────────────────────────────────────── */

  /** Entra a esta sala con un nombre. La comprobación real la hace el canal. */
  const enter = useCallback(
    (name: string, asHost = false) => {
      const next: Session = { code, playerId: randomId(), name: name.trim(), isHost: asHost };
      setJoinError(null);
      stateRef.current = null;
      rejoinRef.current = false;
      admittedOnceRef.current = false;
      relinkAttemptsRef.current = 0;
      setRoom(null);
      setPlayers([]);
      writeSession(next);
      setSession(next);
    },
    [code],
  );

  const leaveRoom = useCallback(async () => {
    setBusy((b) => ({ ...b, leaving: true }));
    try {
      await channelRef.current?.untrack();
    } catch {
      /* el canal ya se estaba cerrando */
    }
    clearSession();
    stateRef.current = null;
    rejoinRef.current = false;
    admittedOnceRef.current = false;
    relinkAttemptsRef.current = 0;
    setSession(null);
    setRoom(null);
    setPlayers([]);
    setJoinError(null);
    setBusy({});
  }, []);

  /* ── Acciones ────────────────────────────────────────────────────────── */

  const updateSettings = useCallback(
    (settings: Partial<Settings>) => dispatch({ action: 'settings', settings }),
    [dispatch],
  );
  const startGame = useCallback(() => dispatch({ action: 'start' }), [dispatch]);
  const endGame = useCallback(() => dispatch({ action: 'end' }), [dispatch]);
  const resetGame = useCallback(() => dispatch({ action: 'reset' }), [dispatch]);
  const confirmRole = useCallback(() => {
    if (!sessionRef.current) return;
    dispatch({ action: 'ready', playerId: sessionRef.current.playerId });
  }, [dispatch]);

  /* ── Lo que ve mi pantalla ───────────────────────────────────────────── */

  /**
   * Entró cuando el reparto ya estaba hecho. No tiene carta, y sobre todo no
   * debe ver la de nadie más: mira desde afuera hasta la siguiente ronda.
   */
  const isSpectator = Boolean(
    session && room?.game && !room.game.order.some((o) => o.id === session.playerId),
  );

  const myCard = useMemo(() => {
    if (!room?.game || !session) return null;
    if (!room.game.order.some((o) => o.id === session.playerId)) return null;
    const isImpostor = room.game.impostors.some((i) => i.id === session.playerId);
    return {
      isImpostor,
      // Al impostor no se le manda la palabra a la pantalla, ni siquiera oculta.
      secretWord: isImpostor ? null : room.game.secretWord,
      categoryName: cats[room.game.category]?.nombre ?? room.game.category,
    };
  }, [room?.game, session]);

  const hasReady = Boolean(session && room?.game?.readyIds.includes(session.playerId));

  /** Cuántos tienen que confirmar el rol: los que recibieron carta y siguen conectados. */
  const revealTotal = useMemo(() => {
    if (!room?.game) return players.length;
    const present = room.game.order.filter((o) => players.some((p) => p.id === o.id));
    return present.length || room.game.order.length;
  }, [room?.game, players]);

  return {
    // conexión
    code,
    status,
    isConfigured: isSupabaseConfigured,
    isRestoringSession,
    joinError,
    // identidad
    session,
    me,
    isHost,
    hostId,
    // sala
    room,
    players,
    phase: (room?.phase ?? 'lobby') as Phase,
    myCard,
    isSpectator,
    hasReady,
    revealTotal,
    busy,
    // acciones
    enter,
    leaveRoom,
    updateSettings,
    startGame,
    confirmRole,
    endGame,
    resetGame,
  };
}
