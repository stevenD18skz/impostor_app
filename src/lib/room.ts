// El protocolo de una sala online.
//
// No hay base de datos. La sala entera vive en un canal de Supabase Realtime
// (Presence + Broadcast): pub/sub puro sobre WebSocket, sin tablas, sin RLS y
// sin un endpoint que consultar. El código de sala ES el nombre del canal, del
// mismo modo que en el escáner de códigos el identificador de emparejamiento es
// lo único que hace falta para entrar.
//
// Por qué se fue la base de datos: antes cada cambio disparaba un evento de
// postgres_changes y CADA cliente respondía pidiendo la sala completa por HTTP.
// Con 8 jugadores, iniciar la partida costaba ~150 consultas y confirmar los
// roles otras ~160. La cuenta era `1 escritura x N jugadores x 2 consultas`, y
// crecía al cuadrado con la gente en la sala. Acá no hay ninguna: lo que viaja
// es el estado ya armado, y viaja una sola vez.
//
// Quién manda: el host. Es el único que modifica el estado; los demás le mandan
// intenciones y él reparte el resultado ya resuelto. Así no hay dos clientes
// decidiendo cosas distintas al mismo tiempo.
//
// Qué NO es privado: el estado viaja completo a todos los que estén en el canal,
// así que quien abra las herramientas de desarrollo puede ver la palabra y quién
// es el impostor. Es exactamente lo mismo que pasaba con la base de datos —la
// respuesta de /api/game traía `is_impostor` de todos y `secretWord` a cada
// jugador—, así que no se perdió nada por el camino. Taparlo de verdad pide que
// el reparto lo haga un servidor y que cada quien pueda leer solo su propia
// carta; se puede montar después sin tocar nada de esto.

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

/* ── Identidad ─────────────────────────────────────────────────────────── */

export function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I/O/0/1: se dictan en voz alta

export function newRoomCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

/* ── Tipos ─────────────────────────────────────────────────────────────── */

export type Phase = 'lobby' | 'reveal' | 'playing' | 'ended';

/** Un jugador tal como lo publica su propio navegador en Presence. */
export type Player = {
  id: string;
  name: string;
  /** Lo declara quien crea la sala. Si se va, ver `resolveHostId`. */
  isHost: boolean;
  /**
   * Solo tiene sentido en la entrada del host, y existe para que alguien que
   * apenas está sondeando la sala sepa si la partida ya arrancó sin tener que
   * saludar y esperar respuesta.
   */
  phase?: Phase;
};

export type Settings = {
  category: string;
  numImpostors: number;
  timeLimit: number;
};

export type Card = { id: string; name: string };

export type GameData = {
  secretWord: string;
  /** La clave dentro de `categorias`, no el nombre bonito. */
  category: string;
  impostors: Card[];
  /**
   * El orden de turnos, congelado al iniciar. Se guarda con nombre y no solo
   * con id para que la lista siga leyéndose aunque alguien cierre la pestaña
   * a mitad de partida.
   */
  order: Card[];
  readyIds: string[];
  timeLimit: number;
  /**
   * Cuándo empezó la cuenta regresiva, medido con el reloj DEL HOST. No se
   * compara nunca contra el reloj de otro aparato: ver `elapsedMs`.
   */
  startedAt: number | null;
};

export type RoomState = {
  code: string;
  phase: Phase;
  settings: Settings;
  game: GameData | null;
  /** Sube con cada cambio; sirve para descartar estados que llegan tarde. */
  v: number;
};

export const DEFAULT_SETTINGS: Settings = {
  category: 'comida',
  numImpostors: 1,
  timeLimit: 180,
};

export function newRoomState(code: string): RoomState {
  return { code, phase: 'lobby', settings: { ...DEFAULT_SETTINGS }, game: null, v: 0 };
}

/* ── Canal y eventos ───────────────────────────────────────────────────── */

export const channelName = (code: string) => `impostor:${code.toUpperCase()}`;

/** Host → todos: el estado completo. Es idempotente, así que repetirlo no rompe nada. */
export const EV_STATE = 'state';
/** Quien acaba de entrar → host: "mándame el estado". */
export const EV_HELLO = 'hello';
/** Cualquiera → host: "quiero hacer esto". El host decide y reparte el resultado. */
export const EV_INTENT = 'intent';

export type Intent =
  | { action: 'settings'; settings: Partial<Settings> }
  | { action: 'start' }
  | { action: 'ready'; playerId: string }
  | { action: 'end' }
  | { action: 'reset' };

export type StatePayload = {
  state: RoomState;
  /**
   * `Date.now()` del host en el instante del envío. Quien recibe puede sacar
   * cuánto lleva corriendo el reloj restando contra `game.startedAt`, que es
   * del mismo reloj: la diferencia entre relojes de aparatos distintos se
   * cancela sola y nadie ve un cronómetro desfasado.
   */
  now: number;
};

/** Cuánto lleva corriendo la partida, con la resta hecha siempre en el reloj del host. */
export function elapsedMs(payload: StatePayload): number {
  const startedAt = payload.state.game?.startedAt;
  if (!startedAt) return 0;
  return Math.max(0, payload.now - startedAt);
}

/* ── Quién es el host ──────────────────────────────────────────────────── */

/**
 * El host sale de la lista de Presence, no de un campo guardado en ningún lado.
 * Como todos ven exactamente la misma lista, todos llegan al mismo nombre sin
 * negociar nada entre ellos.
 *
 * Si el que creó la sala cierra la pestaña, su entrada desaparece y el relevo
 * lo toma el id más bajo de los que quedan. Se usa el id y no "el que lleva más
 * tiempo" a propósito: la hora de llegada la pone cada teléfono con su propio
 * reloj, y dos relojes desfasados harían que cada quien coronara a un host
 * distinto. El id es el mismo string para todos.
 */
export function resolveHostId(players: Player[]): string | null {
  const declared = players.find((p) => p.isHost);
  if (declared) return declared.id;
  if (!players.length) return null;
  return [...players].sort((a, b) => (a.id < b.id ? -1 : 1))[0].id;
}

/* ── Reparto de roles ──────────────────────────────────────────────────── */

/** Fisher-Yates. El `sort(() => Math.random() - 0.5)` de antes no baraja parejo. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickImpostors(players: Player[], numImpostors: number): Card[] {
  // Nunca todos: si no queda ningún inocente no hay palabra que descubrir.
  const wanted = Math.max(1, Math.min(numImpostors, Math.max(1, players.length - 1)));
  return shuffle(players)
    .slice(0, wanted)
    .map((p) => ({ id: p.id, name: p.name }));
}

export function buildGame(players: Player[], settings: Settings, words: string[]): GameData {
  return {
    secretWord: words[Math.floor(Math.random() * words.length)],
    category: settings.category,
    impostors: pickImpostors(players, settings.numImpostors),
    order: shuffle(players).map((p) => ({ id: p.id, name: p.name })),
    readyIds: [],
    timeLimit: settings.timeLimit,
    startedAt: null,
  };
}

/* ── Sondeo ────────────────────────────────────────────────────────────── */

/**
 * Quién hay ahora mismo en una sala, sin entrar a ella.
 *
 * Es el reemplazo de "buscar la fila en la tabla `rooms`": una sala existe si
 * hay alguien dentro, igual que en el escáner. Se suscribe, espera el primer
 * `sync` de Presence —que llega también cuando la sala está vacía—, y se va.
 * Cero consultas.
 */
export function probeRoom(code: string, timeoutMs = 6000): Promise<Player[]> {
  return new Promise((resolve, reject) => {
    let channel: RealtimeChannel | null = null;
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (channel) supabase.removeChannel(channel);
      fn();
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error('No se pudo contactar el servidor. Revisa tu conexión.'))),
      timeoutMs,
    );

    channel = supabase.channel(channelName(code), {
      // Sin `key` propia: acá no se hace `track`, solo se mira.
      config: { broadcast: { self: false } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const ch = channel;
      if (ch) finish(() => resolve(readPresence(ch)));
    });

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        finish(() => reject(new Error('No se pudo contactar el servidor. Revisa tu conexión.')));
      }
    });
  });
}

/** La lista de Presence aplanada a jugadores, en orden estable por id. */
export function readPresence(channel: RealtimeChannel): Player[] {
  const state = channel.presenceState<Player & { presence_ref: string }>();
  const byId = new Map<string, Player>();
  for (const entries of Object.values(state)) {
    for (const entry of entries) {
      // Si alguien abre dos pestañas con el mismo id, se queda una sola.
      if (entry?.id && !byId.has(entry.id)) {
        byId.set(entry.id, {
          id: entry.id,
          name: entry.name,
          isHost: Boolean(entry.isHost),
          phase: entry.phase,
        });
      }
    }
  }
  return [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
}

export const nameTaken = (players: Player[], name: string) =>
  players.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());

/* ── Sesión guardada en el navegador ───────────────────────────────────── */

// Para que un F5 a mitad de partida vuelva a la sala en vez de al menú. El id
// se conserva: es lo que hace que el jugador recupere SU carta y no otra.

const SESSION_KEY = 'impostor.session';

export type Session = { code: string; playerId: string; name: string };

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.code && parsed?.playerId && parsed?.name) return parsed as Session;
    return null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* sin memoria: un F5 devuelve al menú, nada más */
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nada que limpiar */
  }
}
