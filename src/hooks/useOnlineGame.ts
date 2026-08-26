'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { categorias } from '@/lib/data';
import {
  EV_HELLO,
  EV_INTENT,
  EV_STATE,
  buildGame,
  channelName,
  clearSession,
  elapsedMs,
  nameTaken,
  newRoomCode,
  newRoomState,
  probeRoom,
  randomId,
  readPresence,
  readSession,
  resolveHostId,
  writeSession,
  type Intent,
  type Phase,
  type Player,
  type RoomState,
  type Session,
  type Settings,
  type StatePayload,
} from '@/lib/room';

const cats = categorias as Record<string, { nombre: string; palabras: string[] }>;

export type LinkStatus = 'idle' | 'connecting' | 'connected' | 'error';

/*
  Toda la sala online, sin una sola consulta a la base de datos.

  El reparto de tareas es el mismo de un juego de mesa: el host tiene el tablero
  y los demás le piden cosas. Nadie modifica el estado por su cuenta, así que no
  hay dos versiones de la verdad que reconciliar después.

  Lo que cuesta cada acción, en peticiones a Supabase: ninguna. Lo que viaja son
  mensajes de broadcast por un WebSocket que ya estaba abierto.
*/

/** Aplica una intención sobre el estado. Devuelve `null` si no venía al caso. */
function reduce(state: RoomState, intent: Intent, players: Player[]): RoomState | null {
  switch (intent.action) {
    case 'settings': {
      if (state.phase !== 'lobby') return null;
      return { ...state, settings: { ...state.settings, ...intent.settings } };
    }

    case 'start': {
      if (state.phase !== 'lobby' || players.length < 3) return null;
      const words = cats[state.settings.category]?.palabras;
      if (!words?.length) return null;
      return { ...state, phase: 'reveal', game: buildGame(players, state.settings, words) };
    }

    case 'ready': {
      if (state.phase !== 'reveal' || !state.game) return null;
      if (state.game.readyIds.includes(intent.playerId)) return null;
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
  // Solo cuentan los que recibieron carta. Alguien que entró después del
  // reparto no tiene rol que confirmar, y esperarlo dejaría la partida
  // congelada para siempre.
  const present = players.filter((p) => game.order.some((o) => o.id === p.id)).map((p) => p.id);
  const pending = present.filter((id) => !game.readyIds.includes(id));
  if (pending.length > 0 || present.length === 0) return state;
  return {
    ...state,
    phase: 'playing',
    game: { ...state.game, startedAt: Date.now() },
  };
}

export function useOnlineGame() {
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [status, setStatus] = useState<LinkStatus>('idle');
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<RoomState | null>(null);
  const playersRef = useRef<Player[]>([]);
  const sessionRef = useRef<Session | null>(null);
  const hostIdRef = useRef<string | null>(null);

  /**
   * Cuándo empezó la cuenta regresiva según el reloj de ESTE aparato. El host
   * manda su propio `startedAt` y el instante en que envió; restando los dos
   * —ambos de su reloj— sale cuánto lleva corriendo, y eso sí se puede anclar
   * localmente. Comparar el `startedAt` del host contra el `Date.now()` de otro
   * teléfono daría un cronómetro corrido por la diferencia entre relojes.
   */
  const [startedAtLocal, setStartedAtLocal] = useState<number | null>(null);

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

  const emit = useCallback(async (event: string, payload: unknown) => {
    const channel = channelRef.current;
    if (!channel) return false;
    try {
      return (await channel.send({ type: 'broadcast', event, payload })) === 'ok';
    } catch {
      return false;
    }
  }, []);

  /** Reparte el estado y lo aplica en casa. Solo lo llama el host. */
  const publish = useCallback(
    (next: RoomState) => {
      const stamped = { ...next, v: next.v + 1 };
      stateRef.current = stamped;
      setRoom(stamped);
      if (stamped.phase === 'playing' && stamped.game?.startedAt) {
        setStartedAtLocal((prev) => prev ?? Date.now());
      } else {
        setStartedAtLocal(null);
      }
      const payload: StatePayload = { state: stamped, now: Date.now() };
      emit(EV_STATE, payload);
    },
    [emit],
  );

  /**
   * El único camino por el que cambia algo. Si soy el host lo resuelvo y lo
   * reparto; si no, se lo paso a quien manda y espero su versión.
   */
  const dispatch = useCallback(
    (intent: Intent) => {
      if (!sessionRef.current) return;
      if (hostIdRef.current === sessionRef.current.playerId) {
        const current = stateRef.current;
        if (!current) return;
        const next = reduce(current, intent, playersRef.current);
        if (next) publish(next);
      } else {
        emit(EV_INTENT, intent);
      }
    },
    [emit, publish],
  );

  /* ── El canal ────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!session) {
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    const { code, playerId, name } = session;

    const channel = supabase.channel(channelName(code), {
      config: {
        // Una ranura de Presence por jugador: volver a hacer `track` reemplaza
        // la propia en vez de duplicarla.
        presence: { key: playerId },
        broadcast: { self: false },
      },
    });
    channelRef.current = channel;

    // Quien crea la sala llega con el tablero puesto; quien se une llega en
    // blanco y lo recibe del host.
    const seeded = stateRef.current;
    if (!seeded || seeded.code !== code) {
      stateRef.current = null;
      setRoom(null);
    }

    const syncPresence = () => {
      const roster = readPresence(channel);
      playersRef.current = roster;
      setPlayers(roster);

      const nextHost = resolveHostId(roster);
      hostIdRef.current = nextHost;
      const iAmHost = nextHost === playerId;

      if (!iAmHost) return;

      // Me tocó mandar. Puede ser porque creé la sala o porque el host anterior
      // cerró la pestaña; en el segundo caso el tablero ya lo tengo, porque
      // todos guardan la última copia que repartió el host.
      const mine = roster.find((p) => p.id === playerId);
      const current = stateRef.current;

      if (mine && !mine.isHost) {
        channel.track({ id: playerId, name, isHost: true, phase: current?.phase ?? 'lobby' });
      }

      if (!current) return;

      // Alguien nuevo entró (o alguien se fue durante el reparto de cartas):
      // se le manda el tablero y, de paso, se revisa si ya no falta nadie por
      // confirmar.
      const advanced = advanceIfAllReady(current, roster);
      if (advanced !== current) {
        publish(advanced);
      } else {
        const payload: StatePayload = { state: current, now: Date.now() };
        emit(EV_STATE, payload);
      }
    };

    channel.on('presence', { event: 'sync' }, syncPresence);
    channel.on('presence', { event: 'join' }, syncPresence);
    channel.on('presence', { event: 'leave' }, syncPresence);

    channel.on('broadcast', { event: EV_STATE }, ({ payload }) => {
      const data = payload as StatePayload;
      const incoming = data?.state;
      if (!incoming || incoming.code !== code) return;
      // Un estado viejo que llega tarde no debe pisar al nuevo.
      if (stateRef.current && incoming.v < stateRef.current.v) return;

      stateRef.current = incoming;
      setRoom(incoming);

      if (incoming.phase === 'playing' && incoming.game?.startedAt) {
        setStartedAtLocal(Date.now() - elapsedMs(data));
      } else {
        setStartedAtLocal(null);
      }
    });

    channel.on('broadcast', { event: EV_HELLO }, () => {
      if (hostIdRef.current !== playerId) return;
      const current = stateRef.current;
      if (!current) return;
      const payload: StatePayload = { state: current, now: Date.now() };
      emit(EV_STATE, payload);
    });

    channel.on('broadcast', { event: EV_INTENT }, ({ payload }) => {
      if (hostIdRef.current !== playerId) return;
      const current = stateRef.current;
      if (!current) return;
      const next = reduce(current, payload as Intent, playersRef.current);
      if (next) publish(next);
    });

    channel.subscribe((state) => {
      if (state === 'SUBSCRIBED') {
        setStatus('connected');
        const current = stateRef.current;
        channel.track({
          id: playerId,
          name,
          isHost: Boolean(current),
          phase: current?.phase ?? 'lobby',
        });
        // Respaldo por si el host no llegó a ver mi entrada en Presence.
        if (!current) emit(EV_HELLO, { playerId });
      } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
        setStatus('error');
      }
    });

    /*
      Red de seguridad para no quedarse mirando "Entrando a la sala...".

      Dos formas de llegar acá sin tablero: que el saludo o la respuesta se
      hayan perdido, o que el anfitrión haya recargado la página estando solo
      —vuelve como jugador cualquiera, nadie declara ser host, y el relevo cae
      sobre él mismo con las manos vacías—. En el primer caso se vuelve a
      saludar; en el segundo se abre una sala nueva, que es lo único razonable
      cuando ya no queda copia del tablero en ningún navegador.

      Va con espera de por medio a propósito: recién suscrito uno puede verse
      como único en la sala antes de que Presence termine de traer a los demás,
      y sembrar un lobby ahí borraría la partida que sí estaba en curso.
    */
    const recover = setInterval(() => {
      if (stateRef.current) return;
      if (hostIdRef.current === playerId) {
        const fresh = newRoomState(code);
        stateRef.current = fresh;
        publish(fresh);
      } else {
        emit(EV_HELLO, { playerId });
      }
    }, 2500);

    return () => {
      clearInterval(recover);
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [session, emit, publish]);

  /** El host mantiene su fase publicada en Presence, para que un sondeo la vea. */
  useEffect(() => {
    if (!isHost || !session || !room) return;
    channelRef.current?.track({
      id: session.playerId,
      name: session.name,
      isHost: true,
      phase: room.phase,
    });
  }, [isHost, room?.phase, session]);

  /* ── Restaurar tras un F5 ────────────────────────────────────────────── */

  useEffect(() => {
    const saved = readSession();
    if (saved) setSession(saved);
    setIsRestoringSession(false);
  }, []);

  /* ── Entrar y salir ──────────────────────────────────────────────────── */

  const createRoom = useCallback(async (name: string) => {
    const playerName = name.trim();
    // Un código libre. Con 32^6 combinaciones y salas que viven un rato, el
    // primer intento sirve casi siempre; el bucle es por si acaso.
    let code = newRoomCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const roster = await probeRoom(code);
      if (roster.length === 0) break;
      code = newRoomCode();
    }

    const playerId = randomId();
    stateRef.current = newRoomState(code);
    setRoom(stateRef.current);

    const next: Session = { code, playerId, name: playerName };
    writeSession(next);
    setSession(next);
  }, []);

  const joinRoom = useCallback(async (rawCode: string, name: string) => {
    const code = rawCode.trim().toUpperCase();
    const playerName = name.trim();

    const roster = await probeRoom(code);
    if (roster.length === 0) throw new Error('Esa sala no existe o ya se cerró');
    if (nameTaken(roster, playerName)) throw new Error('Ese nombre ya está tomado en la sala');

    const phase = roster.find((p) => p.isHost)?.phase;
    if (phase && phase !== 'lobby') throw new Error('La partida ya empezó');

    stateRef.current = null;
    setRoom(null);

    const next: Session = { code, playerId: randomId(), name: playerName };
    writeSession(next);
    setSession(next);
  }, []);

  const leaveRoom = useCallback(async () => {
    setBusy((b) => ({ ...b, leaving: true }));
    try {
      await channelRef.current?.untrack();
    } catch {
      /* el canal ya se estaba cerrando */
    }
    clearSession();
    stateRef.current = null;
    setSession(null);
    setRoom(null);
    setPlayers([]);
    setStartedAtLocal(null);
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
   * Entró cuando el reparto ya estaba hecho. Pasa en la rendija entre sondear
   * la sala (que todavía decía "lobby") y quedar registrado en Presence. No
   * tiene carta, y sobre todo no debe ver la de nadie más: mira desde afuera
   * hasta la siguiente ronda.
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

  const hasReady = Boolean(
    session && room?.game?.readyIds.includes(session.playerId),
  );

  return {
    // conexión
    status,
    isRestoringSession,
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
    startedAtLocal,
    busy,
    // acciones
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    startGame,
    confirmRole,
    endGame,
    resetGame,
  };
}
