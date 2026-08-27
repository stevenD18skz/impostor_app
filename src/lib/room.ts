// El protocolo de una sala online.
//
// No hay base de datos. La sala entera vive en un canal de Supabase Realtime
// (Presence + Broadcast): pub/sub puro sobre WebSocket, sin tablas, sin RLS y
// sin un endpoint que consultar. El código de sala ES el nombre del canal.
//
// Quién manda: el host. Es el único que modifica el estado; los demás le mandan
// intenciones y él reparte el resultado ya resuelto. Así no hay dos clientes
// decidiendo cosas distintas al mismo tiempo.
//
// Qué NO es privado: el estado viaja completo a todos los que estén en el canal,
// así que quien abra las herramientas de desarrollo puede ver la palabra y quién
// es el impostor. Taparlo de verdad pide que el reparto lo haga un servidor y
// que cada quien pueda leer solo su propia carta.

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { sanitizeCategoryWords, type CategoryWords } from './categories';

/* ── Identidad ─────────────────────────────────────────────────────────── */

export function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I/O/0/1: se dictan en voz alta

export const CODE_LENGTH = 6;

export function newRoomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

/** El código tal como se usa en la URL y como nombre de canal: mayúsculas, sin espacios. */
export const normalizeCode = (raw: string) => raw.trim().toUpperCase();

const CODE_RE = new RegExp('^[A-Z0-9]{' + CODE_LENGTH + '}$');

export const isValidCode = (raw: string) => CODE_RE.test(normalizeCode(raw));

/* ── Tipos ─────────────────────────────────────────────────────────────── */

export type Phase = 'lobby' | 'reveal' | 'playing' | 'ended';

/**
 * Un jugador tal como lo publica su propio navegador en Presence.
 *
 * Esto es todo lo que se publica, y a propósito: Presence es carísimo. El
 * servidor corta el canal a las pocas actualizaciones (ver `track` en
 * `useOnlineGame`), así que aquí no entra nada que cambie durante la partida.
 */
export type Player = {
  id: string;
  name: string;
  /** Lo declara quien crea la sala. Si se va, ver `resolveHostId`. */
  isHost: boolean;
};

/** Cómo se anuncia el turno: una lista numerada, o quién empieza y hacia dónde. */
export type OrderMode = 'lista' | 'circulo';

/** Hacia dónde va la ronda cuando se juega en círculo. */
export type Direction = 'horario' | 'antihorario';

/**
 * La torcedura de una ronda caótica.
 *
 * `normal` es el juego de siempre. Las otras tres rompen la regla básica —que
 * hay un impostor y solo él ignora la palabra— sin avisar a nadie: cada
 * jugador ve una carta que parece perfectamente corriente.
 */
export type Variant = 'normal' | 'todos' | 'ninguno' | 'mitad';

export type Settings = {
  /** Clave dentro de `categorias`. Se ignora si hay `custom`. */
  category: string;
  /** Categoría inventada por el anfitrión. Viaja entera con el estado. */
  custom: CategoryWords | null;
  numImpostors: number;
  orderMode: OrderMode;
  /** Deja que de vez en cuando salga una ronda torcida. Ver `rollVariant`. */
  chaos: boolean;
  /** Si en partida se puede volver a mirar la propia carta. */
  allowPeek: boolean;
};

export type Card = { id: string; name: string };

export type GameData = {
  secretWord: string;
  /** Ya resuelto a nombre legible: puede venir de una categoría inventada. */
  categoryName: string;
  impostors: Card[];
  /**
   * El orden de turnos, congelado al iniciar. Se guarda con nombre y no solo
   * con id para que la lista siga leyéndose aunque alguien cierre la pestaña
   * a mitad de partida.
   */
  order: Card[];
  readyIds: string[];
  /**
   * Solo en modo círculo: quién abre y hacia qué lado sigue. No es una lista
   * porque la app no sabe cómo están sentados; eso lo resuelven mirándose.
   */
  start: { id: string; name: string; dir: Direction } | null;
  /** Qué clase de ronda tocó. No se enseña hasta el final: ver `GameEnd`. */
  variant: Variant;
};

export type RoomState = {
  code: string;
  phase: Phase;
  settings: Settings;
  game: GameData | null;
  /** Sube con cada cambio; sirve para descartar estados que llegan tarde. */
  v: number;
  /** Para no encadenar dos rondas caóticas seguidas. Ver `rollVariant`. */
  lastWasChaos: boolean;
};

export const MIN_PLAYERS = 3;

export const DEFAULT_SETTINGS: Settings = {
  category: 'comida',
  custom: null,
  numImpostors: 1,
  orderMode: 'lista',
  chaos: false,
  allowPeek: true,
};

/** Cada cuánto, más o menos, el modo caos tuerce una ronda. */
export const CHAOS_CHANCE = 0.15;

/** Nunca todos impostores: tiene que quedar alguien que sepa la palabra. */
export const maxImpostorsFor = (playerCount: number) =>
  Math.max(1, Math.floor(Math.max(playerCount, MIN_PLAYERS) / 2));

/** Recorta lo que llega por la red a un rango con sentido antes de guardarlo. */
export function sanitizeSettings(
  patch: Partial<Settings>,
  base: Settings,
  playerCount: number,
): Settings {
  const merged = { ...base, ...patch };
  const impostors = Number.isFinite(merged.numImpostors) ? merged.numImpostors : base.numImpostors;
  return {
    category:
      typeof merged.category === 'string' && merged.category ? merged.category : base.category,
    // Puede llegar de otro jugador, así que se recorta antes de guardarla.
    custom: sanitizeCategoryWords(merged.custom),
    numImpostors: Math.min(Math.max(Math.round(impostors), 1), maxImpostorsFor(playerCount)),
    orderMode: merged.orderMode === 'circulo' ? 'circulo' : 'lista',
    chaos: Boolean(merged.chaos),
    allowPeek: Boolean(merged.allowPeek),
  };
}

/**
 * Una copia de los ajustes reducida a valores sueltos que se pueden comparar.
 *
 * El `Record<keyof Settings, ...>` es a propósito: si mañana se añade un ajuste
 * y no se pone aquí, esto deja de compilar. No es paranoia — exactamente ese
 * olvido (comparar solo la categoría y los impostores) hacía que el modo caos y
 * el orden de turnos no llegaran nunca al resto de la sala.
 */
function comparableSettings(s: Settings): Record<keyof Settings, string | number | boolean> {
  return {
    category: s.category,
    numImpostors: s.numImpostors,
    orderMode: s.orderMode,
    chaos: s.chaos,
    allowPeek: s.allowPeek,
    // Serializada: dos listas distintas nunca dan el mismo texto.
    custom: s.custom ? JSON.stringify([s.custom.nombre, ...s.custom.palabras]) : '',
  };
}

/** ¿Estos dos ajustes son el mismo? Mira TODOS los campos, no unos cuantos. */
export function settingsEqual(a: Settings, b: Settings): boolean {
  const left = comparableSettings(a);
  const right = comparableSettings(b);
  return (Object.keys(left) as (keyof Settings)[]).every((key) => left[key] === right[key]);
}

export function newRoomState(code: string): RoomState {
  return {
    code: normalizeCode(code),
    phase: 'lobby',
    settings: { ...DEFAULT_SETTINGS },
    game: null,
    v: 0,
    lastWasChaos: false,
  };
}

/* ── Canal y eventos ───────────────────────────────────────────────────── */

export const channelName = (code: string) => `impostor:${normalizeCode(code)}`;

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
  // `players` ya viene ordenada por id, así que si por un instante dos declaran
  // ser host —el creador volviendo de un F5 justo cuando otro tomó el relevo—
  // todos eligen al mismo.
  const declared = players.filter((p) => p.isHost);
  if (declared.length) return declared[0].id;
  if (!players.length) return null;
  return players[0].id;
}

/* ── Reparto de roles ──────────────────────────────────────────────────── */

/** Fisher-Yates. El `sort(() => Math.random() - 0.5)` de antes no baraja parejo. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Reparte las cartas de impostor.
 *
 * En una ronda normal siempre queda al menos alguien que sabe la palabra: sin
 * eso no hay a quién engañar. `allowEveryone` levanta ese suelo, y es lo único
 * que necesita la ronda caótica en la que todos resultan ser impostores.
 */
export function pickImpostors(
  players: Player[],
  numImpostors: number,
  allowEveryone = false,
): Card[] {
  const cap = allowEveryone ? players.length : Math.max(1, players.length - 1);
  const wanted = Math.max(0, Math.min(Math.round(numImpostors), cap));
  return shuffle(players)
    .slice(0, wanted)
    .map((p) => ({ id: p.id, name: p.name }));
}

/**
 * Decide si esta ronda sale torcida, y de qué manera.
 *
 * La gracia está en que sea rara: si el modo caos saltara a menudo dejaría de
 * sorprender y se volvería el juego normal. Por eso es poco probable y nunca
 * cae dos veces seguidas — una ronda extraña se disfruta más si la anterior
 * fue corriente.
 */
export function rollVariant(
  playerCount: number,
  settings: { chaos: boolean; numImpostors: number },
  lastWasChaos: boolean,
): Variant {
  if (!settings.chaos || lastWasChaos) return 'normal';
  if (Math.random() >= CHAOS_CHANCE) return 'normal';

  const candidates: Variant[] = ['todos', 'ninguno'];
  // Con pocos jugadores «la mitad» puede coincidir con lo que ya estaba
  // configurado, y entonces no sorprende a nadie.
  const half = Math.floor(playerCount / 2);
  if (half >= 1 && half !== settings.numImpostors) candidates.push('mitad');

  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Cuántos impostores toca repartir según la torcedura de la ronda. */
export function impostorsFor(
  variant: Variant,
  playerCount: number,
  settings: { numImpostors: number },
): number {
  switch (variant) {
    case 'todos':
      return playerCount;
    case 'ninguno':
      return 0;
    case 'mitad':
      return Math.floor(playerCount / 2);
    default:
      return settings.numImpostors;
  }
}

export function buildGame(
  players: Player[],
  settings: Settings,
  category: CategoryWords,
  variant: Variant = 'normal',
): GameData {
  const wanted = impostorsFor(variant, players.length, settings);
  const order = shuffle(players).map((p) => ({ id: p.id, name: p.name }));

  return {
    secretWord: category.palabras[Math.floor(Math.random() * category.palabras.length)],
    categoryName: category.nombre,
    impostors: pickImpostors(players, wanted, variant === 'todos'),
    order,
    readyIds: [],
    start:
      settings.orderMode === 'circulo'
        ? {
            ...order[Math.floor(Math.random() * order.length)],
            dir: Math.random() < 0.5 ? 'horario' : 'antihorario',
          }
        : null,
    variant,
  };
}

/* ── Presence ──────────────────────────────────────────────────────────── */

/** La lista de Presence aplanada a jugadores, en orden estable por id. */
export function readPresence(channel: RealtimeChannel): Player[] {
  const state = channel.presenceState<Player & { presence_ref: string }>();
  const byId = new Map<string, Player>();
  for (const entries of Object.values(state)) {
    for (const entry of entries) {
      // Si alguien abre dos pestañas con el mismo id, se queda una sola.
      if (entry?.id && typeof entry.name === 'string' && !byId.has(entry.id)) {
        byId.set(entry.id, {
          id: entry.id,
          name: entry.name,
          isHost: Boolean(entry.isHost),
        });
      }
    }
  }
  return [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
}

/** ¿Ese nombre ya lo usa OTRO? El propio id se ignora: volver tras un F5 es legítimo. */
export const nameTaken = (players: Player[], name: string, selfId?: string) =>
  players.some((p) => p.id !== selfId && p.name.trim().toLowerCase() === name.trim().toLowerCase());

/* ── Higiene de canales ────────────────────────────────────────────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Deja el topic libre antes de volver a abrirlo. Esto no es opcional.
 *
 * `supabase.channel(topic)` NO crea un canal nuevo si ya hay uno registrado con
 * ese mismo topic: devuelve el que estaba, ignorando la configuración que se le
 * pase. Y `removeChannel()` no lo saca de la lista al momento — lo hace recién
 * cuando el servidor confirma la salida. En el medio queda un canal en estado
 * `leaving`, y `subscribe()` sobre un canal que no está `closed` no hace
 * absolutamente nada: ni se une, ni llama al callback, ni devuelve error.
 *
 * Así se moría la sala: React monta el efecto, lo desmonta y lo vuelve a montar
 * (StrictMode en desarrollo), o se venía de sondear ese mismo código antes de
 * entrar. El segundo `supabase.channel()` devolvía el cadáver del primero y la
 * pantalla se quedaba en "Entrando a la sala..." para siempre, sin Presence y
 * por lo tanto sin nadie declarado anfitrión.
 */
export async function releaseTopic(topic: string): Promise<void> {
  const full = `realtime:${topic}`;
  for (let attempt = 0; attempt < 40; attempt++) {
    const stale = supabase.getChannels().filter((c) => c.topic === full);
    if (!stale.length) return;
    await Promise.all(stale.map((c) => supabase.removeChannel(c).catch(() => undefined)));
    await sleep(25);
  }
}

/* ── Sesión guardada en el navegador ───────────────────────────────────── */

// Para que un F5 a mitad de partida vuelva a la sala en vez de al menú. El id
// se conserva: es lo que hace que el jugador recupere SU carta y no otra.

const SESSION_KEY = 'impostor.session';

export type Session = {
  code: string;
  playerId: string;
  name: string;
  /** Lo puso quien creó la sala. Es lo que lo hace anfitrión desde el primer instante. */
  isHost: boolean;
};

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.code || !parsed?.playerId || !parsed?.name) return null;
    return {
      code: normalizeCode(String(parsed.code)),
      playerId: String(parsed.playerId),
      name: String(parsed.name),
      isHost: Boolean(parsed.isHost),
    };
  } catch {
    return null;
  }
}

/** La sesión de ESTA sala, o `null` si la guardada es de otra. */
export function readSessionFor(code: string): Session | null {
  const saved = readSession();
  return saved && saved.code === normalizeCode(code) ? saved : null;
}

export function writeSession(session: Session): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* sin memoria: un F5 devuelve al menú, nada más */
  }
}

/* Lectura reactiva de la sesión, pensada para `useSyncExternalStore`: leer
   localStorage es leer un sistema externo, no derivar estado de React. */

let snapshotRaw: string | null = null;
let snapshot: Session | null = null;

export function getSessionSnapshot(): Session | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SESSION_KEY);
  } catch {
    raw = null;
  }
  // La identidad del objeto tiene que ser estable mientras el contenido no
  // cambie, o el render entra en bucle.
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = readSession();
  }
  return snapshot;
}

/** En el servidor no hay localStorage: nunca hay sesión guardada. */
export const getServerSessionSnapshot = (): Session | null => null;

export function subscribeSession(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nada que limpiar */
  }
}
