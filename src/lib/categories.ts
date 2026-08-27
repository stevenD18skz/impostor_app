// Categorías: las que vienen de fábrica y las que se inventa cada quien.
//
// Las propias viven en el navegador de quien las creó, no en un servidor. Para
// jugar online no hace falta que las tengan los demás: las palabras viajan
// dentro del estado de la sala, en el mismo mensaje que ya se reparte. Una
// categoría de 50 palabras pesa ~1.2 KB y un broadcast lleva 120 KB sin
// despeinarse, así que sobra sitio. Ver `REALTIME_SETUP.md`.

import { categorias } from './data';

const cats = categorias as Record<string, { nombre: string; palabras: string[] }>;

/** Un par de listas de palabras, sin importar de dónde salió. */
export type CategoryWords = {
  nombre: string;
  palabras: string[];
};

/** Una categoría propia, ya guardada en este navegador. */
export type CustomCategory = CategoryWords & { id: string };

/*
  Los topes existen por dos motivos distintos. Hacia adentro, para que un
  formulario no genere una lista absurda. Y hacia la red: los ajustes pueden
  llegar de otro jugador, así que lo que entra se recorta antes de guardarlo,
  igual que `sanitizeSettings` hace con el resto.
*/
export const CATEGORY_LIMITS = {
  nombreMin: 2,
  nombreMax: 24,
  minPalabras: 5,
  maxPalabras: 200,
  palabraMax: 40,
} as const;

/** La lista de las de fábrica, para pintar el selector. */
export const builtInCategories = (): { key: string; nombre: string }[] =>
  Object.entries(cats).map(([key, cat]) => ({ key, nombre: cat.nombre }));

export const isBuiltIn = (key: string) => Object.hasOwn(cats, key);

/**
 * Convierte lo que se escribe a mano en una lista de palabras.
 *
 * Se acepta tanto una palabra por línea como separadas por comas, porque la
 * gente pega listas de los dos modos y corregirle la mano al usuario es peor
 * que aceptarle las dos.
 */
export function parseWords(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const chunk of raw.split(/[\n,;]+/)) {
    const word = chunk.trim().replace(/\s+/g, ' ').slice(0, CATEGORY_LIMITS.palabraMax);
    if (!word) continue;
    // Repetir una palabra solo la haría salir el doble de veces.
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(word);
    if (out.length >= CATEGORY_LIMITS.maxPalabras) break;
  }
  return out;
}

/** Qué le falta a una categoría para poder usarse. `null` si está lista. */
export function categoryProblem(nombre: string, palabras: string[]): string | null {
  const name = nombre.trim();
  if (name.length < CATEGORY_LIMITS.nombreMin) return 'Ponle un nombre de al menos 2 letras.';
  if (name.length > CATEGORY_LIMITS.nombreMax)
    return `El nombre no puede pasar de ${CATEGORY_LIMITS.nombreMax} caracteres.`;
  if (palabras.length < CATEGORY_LIMITS.minPalabras)
    return `Necesitas al menos ${CATEGORY_LIMITS.minPalabras} palabras.`;
  return null;
}

/**
 * Recorta a lo razonable algo que dice ser una categoría. Devuelve `null` si no
 * hay nada aprovechable.
 *
 * Esto corre sobre lo que llega por la red, así que no se fía de nada: ni de que
 * sea un objeto, ni de que las palabras sean textos, ni del tamaño.
 */
export function sanitizeCategoryWords(input: unknown): CategoryWords | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as { nombre?: unknown; palabras?: unknown };
  if (typeof raw.nombre !== 'string' || !Array.isArray(raw.palabras)) return null;

  const nombre = raw.nombre.trim().replace(/\s+/g, ' ').slice(0, CATEGORY_LIMITS.nombreMax);
  const palabras = parseWords(raw.palabras.filter((w) => typeof w === 'string').join('\n'));

  if (nombre.length < CATEGORY_LIMITS.nombreMin) return null;
  if (palabras.length < CATEGORY_LIMITS.minPalabras) return null;
  return { nombre, palabras };
}

/* ── Guardadas en este navegador ───────────────────────────────────────── */

const STORE_KEY = 'impostor.categories';

export function readCustomCategories(): CustomCategory[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        const words = sanitizeCategoryWords(entry);
        const id = (entry as { id?: unknown })?.id;
        return words && typeof id === 'string' ? { id, ...words } : null;
      })
      .filter((c): c is CustomCategory => c !== null);
  } catch {
    // Sin almacenamiento (modo privado, permiso denegado) se juega igual, solo
    // que sin categorías guardadas.
    return [];
  }
}

function writeCustomCategories(list: CustomCategory[]): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* sin memoria: la categoría vale para esta partida y ya */
  }
  // `storage` solo avisa a las OTRAS pestañas. Esta se avisa sola.
  for (const listener of listeners) listener();
}

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `c${Date.now().toString(36)}`;

/** Guarda (o reemplaza, si viene con `id`) y devuelve la lista completa ya al día. */
export function saveCustomCategory(draft: {
  id?: string;
  nombre: string;
  palabras: string[];
}): { saved: CustomCategory; list: CustomCategory[] } {
  const words = sanitizeCategoryWords(draft);
  if (!words) throw new Error('Esa categoría no está completa.');

  const saved: CustomCategory = { id: draft.id ?? newId(), ...words };
  const list = readCustomCategories();
  const at = list.findIndex((c) => c.id === saved.id);
  if (at >= 0) list[at] = saved;
  else list.push(saved);
  writeCustomCategories(list);
  return { saved, list };
}

export function deleteCustomCategory(id: string): CustomCategory[] {
  const list = readCustomCategories().filter((c) => c.id !== id);
  writeCustomCategories(list);
  return list;
}

/* ── Resolver a palabras ───────────────────────────────────────────────── */

/**
 * Las palabras con las que se va a jugar.
 *
 * `custom` manda sobre `category`: si la sala trae una categoría propia, esa es
 * la que se usa, y no hace falta que quien recibe la tenga guardada.
 */
export function resolveCategory(settings: {
  category: string;
  custom: CategoryWords | null;
}): CategoryWords | null {
  if (settings.custom) return settings.custom;
  const built = cats[settings.category];
  return built?.palabras?.length ? { nombre: built.nombre, palabras: built.palabras } : null;
}

/** El nombre bonito de lo que sea que esté seleccionado. */
export const categoryLabel = (settings: { category: string; custom: CategoryWords | null }) =>
  settings.custom?.nombre ?? cats[settings.category]?.nombre ?? settings.category;

/* Lectura reactiva, pensada para `useSyncExternalStore`: leer localStorage es
   leer un sistema externo, no derivar estado de React. Es el mismo patrón que
   usa la sesión guardada en `room.ts`. */

const listeners = new Set<() => void>();

export function subscribeCategories(onChange: () => void): () => void {
  listeners.add(onChange);
  // Crear una categoría en otra pestaña también cuenta.
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

let snapshotRaw: string | null = null;
let snapshot: CustomCategory[] = [];

export function getCategoriesSnapshot(): CustomCategory[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORE_KEY);
  } catch {
    raw = null;
  }
  // La identidad del array tiene que ser estable mientras el contenido no
  // cambie, o el render entra en bucle.
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = readCustomCategories();
  }
  return snapshot;
}

const NONE: CustomCategory[] = [];

/** En el servidor no hay localStorage: nunca hay categorías guardadas. */
export const getCategoriesServerSnapshot = (): CustomCategory[] => NONE;
