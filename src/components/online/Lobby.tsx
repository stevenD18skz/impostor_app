'use client';

import {
  Users, Play, Settings, Home, Book, Drama, LogOut, Check, Link2, Share2,
  ListOrdered, RotateCw, Tornado, BookPlus, Eye,
} from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

import NumberInput from '@/components/ui/NumberInput';
import CategoryEditor from '@/components/CategoryEditor';
import {
  builtInCategories,
  categoryLabel,
  getCategoriesServerSnapshot,
  getCategoriesSnapshot,
  resolveCategory,
  subscribeCategories,
  type CategoryWords,
} from '@/lib/categories';
import {
  MIN_PLAYERS,
  maxImpostorsFor,
  type Player,
  type Settings as RoomSettings,
} from '@/lib/room';

interface LobbyProps {
  code: string;
  /** Sale de Presence, no de una tabla: quien cierra la pestaña desaparece solo. */
  players: Player[];
  myId: string;
  hostId: string | null;
  isHost: boolean;
  settings: RoomSettings;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  leaving: boolean;
}

/*
  Invitar a la sala. En el móvil abre la hoja de compartir del sistema, que es
  de donde sale WhatsApp: el amigo recibe el mensaje y el enlace juntos, sin
  tener que pegar nada. Donde no existe esa hoja —casi todo el escritorio— se
  copia el enlace al portapapeles, que es lo que se podía hacer antes.
*/
type InviteState = 'idle' | 'copied' | 'failed';

/*
  Si el aparato sabe compartir es un dato del navegador, no del estado de React:
  se lee con `useSyncExternalStore`, igual que la sesión guardada. El servidor
  devuelve `false`, así que el HTML dice «Copiar enlace» y, ya en el cliente,
  React cambia el texto a «Invitar» sin que la hidratación se queje.

  La suscripción no hace nada a propósito: esto no cambia mientras la pantalla
  está abierta, así que no hay nada a lo que apuntarse.
*/
const subscribeNever = () => () => {};
const canShareNow = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';
const canShareOnServer = () => false;

function InviteButton({ code }: { code: string }) {
  const [state, setState] = useState<InviteState>('idle');
  const canShare = useSyncExternalStore(subscribeNever, canShareNow, canShareOnServer);

  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 2500);
    return () => clearTimeout(t);
  }, [state]);

  const invite = async () => {
    const link = window.location.href;

    if (canShare) {
      try {
        await navigator.share({
          title: 'El Impostor',
          text: `¡Únete a mi sala para jugar al Impostor! Código: ${code}`,
          url: link,
        });
        // La hoja del sistema ya da su propio acuse; repetirlo aquí sobra.
        return;
      } catch (err) {
        // Cerrar la hoja sin elegir a nadie no es un fallo: no hay que avisar.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Cualquier otro fallo cae al portapapeles, que aguanta más.
      }
    }

    try {
      await navigator.clipboard.writeText(link);
      setState('copied');
    } catch {
      // Sin portapapeles (http sin TLS, permiso denegado). El código está en
      // pantalla justo encima, así que se invita a dictarlo en vez de callar.
      setState('failed');
    }
  };

  const { Icon, label, tone } = {
    idle: canShare
      ? { Icon: Share2, label: 'Invitar amigos', tone: 'bg-cyan-600 hover:bg-cyan-700' }
      : { Icon: Link2, label: 'Copiar enlace', tone: 'bg-cyan-600 hover:bg-cyan-700' },
    copied: { Icon: Check, label: '¡Enlace copiado!', tone: 'bg-emerald-600 hover:bg-emerald-700' },
    failed: { Icon: Link2, label: `Dicta el código: ${code}`, tone: 'bg-slate-600 hover:bg-slate-700' },
  }[state];

  return (
    <button
      onClick={invite}
      title={canShare ? 'Compartir el enlace de la sala' : 'Copiar el enlace de la sala'}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer text-xl font-bold text-(--color-secondary) shadow-lg transition-all duration-300 ${tone}`}
    >
      <Icon size={24} strokeWidth={3} />
      {label}
    </button>
  );
}

/* ── Piezas del panel de ajustes ───────────────────────────────────────── */

function Field({
  label,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  icon: typeof Drama;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
      <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
        <Icon size={24} strokeWidth={3} />
        {label}
      </label>
      {children}
      {hint && <p className="text-(--color-detail) text-base mt-2 text-center">{hint}</p>}
    </div>
  );
}

/** Dos opciones, las dos siempre a la vista. Un desplegable para dos cosas sobra. */
function Choice<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { value: T; label: string; icon: typeof Drama }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            aria-pressed={active}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl text-lg font-bold transition-all duration-300 ${
              active
                ? 'bg-cyan-600 text-(--color-secondary) shadow-lg'
                : 'bg-white/10 text-(--color-detail) hover:bg-white/20'
            } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <opt.icon size={26} strokeWidth={3} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center justify-center gap-3 w-full py-2 ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <span
        className={`relative w-14 h-8 rounded-full transition-colors duration-300 shrink-0 ${
          checked ? 'bg-pink-600' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="text-(--color-secondary) text-xl font-bold">{label}</span>
    </button>
  );
}

const ORDER_OPTIONS = [
  { value: 'lista' as const, label: 'Lista', icon: ListOrdered },
  { value: 'circulo' as const, label: 'En círculo', icon: RotateCw },
];

const ORDER_HINT = {
  lista: 'Se reparte un turno numerado a cada jugador.',
  circulo: 'Se sortea quién empieza y hacia qué lado sigue la ronda.',
};

/** El valor del `<select>`: las propias se distinguen por prefijo. */
const CUSTOM_PREFIX = 'custom:';

export default function Lobby({
  code,
  players,
  myId,
  hostId,
  isHost,
  settings,
  updateSettings,
  onStartGame,
  onLeaveRoom,
  leaving,
}: LobbyProps) {
  // Copia local para que los botones respondan al instante. El host aplica su
  // propio cambio de una vez, así que este eco solo cubre el parpadeo entre
  // tocar y recibir el estado repartido.
  const [form, setForm] = useState<RoomSettings>(settings);
  const [editorOpen, setEditorOpen] = useState(false);
  /** Las propias viven en localStorage; guardarlas avisa a esta lista sola. */
  const mine = useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    getCategoriesServerSnapshot,
  );

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const maxImpostors = maxImpostorsFor(players.length);
  // Si alguien se fue, el número guardado puede haber quedado por encima del
  // tope. Se muestra ya recortado para que no se lea un valor imposible.
  const numImpostors = Math.min(form.numImpostors, maxImpostors);

  const change = (patch: Partial<RoomSettings>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    updateSettings(patch);
  };

  const useCategory = (words: CategoryWords) => change({ custom: words });

  const wordCount = resolveCategory(form)?.palabras.length ?? 0;
  // Si la categoría de la sala coincide con una guardada, el desplegable la
  // marca ahí en vez de duplicarla en una entrada aparte.
  const mineInPlay = form.custom ? mine.find((c) => c.nombre === form.custom?.nombre) : undefined;
  const selectValue = form.custom
    ? `${CUSTOM_PREFIX}${mineInPlay?.id ?? ''}`
    : form.category;

  const pickFromSelect = (value: string) => {
    if (!value.startsWith(CUSTOM_PREFIX)) {
      change({ category: value, custom: null });
      return;
    }
    const chosen = mine.find((c) => c.id === value.slice(CUSTOM_PREFIX.length));
    if (chosen) change({ custom: { nombre: chosen.nombre, palabras: chosen.palabras } });
  };

  const missing = MIN_PLAYERS - players.length;
  const canStart = missing <= 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center gap-2">
        <h2 className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
          <Home size={42} strokeWidth={3} />
          Sala: <span className="tracking-widest text-cyan-400">{code}</span>
        </h2>
        <InviteButton code={code} />
        <p className="text-(--color-detail) text-lg">Esperando jugadores...</p>
      </header>

      <main className="flex flex-col md:flex-row gap-4">
        {/* Jugadores */}
        <div className="flex-1 rounded-2xl p-6 bg-white/10 backdrop-blur">
          <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-(--color-primary) mb-4">
            <Users size={24} strokeWidth={3} />
            Jugadores ({players.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {players.length === 0 && (
              <p className="text-(--color-detail) text-lg animate-pulse">Conectando...</p>
            )}
            {players.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl p-3 flex items-center gap-3 ${p.id === myId ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className="w-10 h-10 shrink-0 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-(--color-secondary) text-xl font-bold">
                  {p.name?.trim()?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-(--color-secondary) text-xl font-medium truncate">
                  {p.name}
                </span>
                {p.id === hostId && (
                  <span className="ml-auto text-sm bg-amber-500 text-black px-2 py-1 rounded-full font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuración (host manda, el resto mira) */}
        <div className="flex-1 rounded-2xl p-6 bg-white/10 backdrop-blur">
          <h3 className="flex items-center justify-center gap-2 text-2xl font-bold text-(--color-primary) mb-4">
            <Settings size={24} strokeWidth={3} />
            Configuración {isHost ? '(Host)' : '(Ver)'}
          </h3>

          <div className="space-y-4">
            {/* Categoría */}
            <Field
              label="Categoría"
              icon={Book}
              hint={wordCount ? `${wordCount} palabras` : undefined}
            >
              {isHost ? (
                <div className="space-y-2">
                  <select
                    value={selectValue}
                    onChange={(e) => pickFromSelect(e.target.value)}
                    className="w-full px-4 py-3 text-xl cursor-pointer hover:bg-white/30 bg-white/20 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:outline-none"
                  >
                    {/* La de la sala, cuando el anfitrión no la tiene guardada
                        (le llegó de otro que sí la había creado). */}
                    {form.custom && !mineInPlay && (
                      <option value={CUSTOM_PREFIX} className="bg-slate-800">
                        {form.custom.nombre} (de la sala)
                      </option>
                    )}
                    {mine.length > 0 && (
                      <optgroup label="Mías">
                        {mine.map((cat) => (
                          <option
                            key={cat.id}
                            value={`${CUSTOM_PREFIX}${cat.id}`}
                            className="bg-slate-800"
                          >
                            {cat.nombre}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="De siempre">
                      {builtInCategories().map((cat) => (
                        <option key={cat.key} value={cat.key} className="bg-slate-800">
                          {cat.nombre}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    onClick={() => setEditorOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl cursor-pointer text-lg font-bold text-cyan-300 bg-white/5 hover:bg-white/15 transition-colors"
                  >
                    <BookPlus size={20} strokeWidth={3} />
                    {mine.length ? 'Mis categorías' : 'Crear una categoría'}
                  </button>
                </div>
              ) : (
                <div className="text-(--color-secondary) text-xl font-medium text-center">
                  {categoryLabel(form)}
                </div>
              )}
            </Field>

            {/* Número de impostores */}
            {isHost ? (
              <NumberInput
                label="Número de Impostores"
                icon={Drama}
                readOnly
                name="numImpostors"
                value={numImpostors}
                min={1}
                max={maxImpostors}
                onChange={(e) => change({ numImpostors: parseInt(e.target.value, 10) })}
                onIncrement={() =>
                  numImpostors < maxImpostors && change({ numImpostors: numImpostors + 1 })
                }
                onDecrement={() => numImpostors > 1 && change({ numImpostors: numImpostors - 1 })}
              />
            ) : (
              <ReadOnlyField label="Número de Impostores" icon={Drama} value={numImpostors} />
            )}

            {/* Orden de turnos */}
            <Field label="Orden de turnos" icon={ListOrdered} hint={ORDER_HINT[form.orderMode]}>
              <Choice
                value={form.orderMode}
                options={ORDER_OPTIONS}
                onChange={(orderMode) => change({ orderMode })}
                disabled={!isHost}
              />
            </Field>

            {/* Ver la carta en partida */}
            <Field
              label="Ver la carta en partida"
              icon={Eye}
              hint={
                form.allowPeek
                  ? 'Cada quien puede volver a mirar su propia carta durante la ronda, manteniéndola pulsada.'
                  : 'Una vez repartidas, las cartas no se vuelven a mirar. Hay que acordarse.'
              }
            >
              <Switch
                checked={form.allowPeek}
                onChange={(allowPeek) => change({ allowPeek })}
                label={form.allowPeek ? 'Permitido' : 'No se puede'}
                disabled={!isHost}
              />
            </Field>

            {/* Modo caos */}
            <Field
              label="Modo caos"
              icon={Tornado}
              hint={
                form.chaos
                  ? 'De vez en cuando, y sin avisar, una ronda rompe las reglas: puede que todos sean impostores, que no haya ninguno, o que sean la mitad.'
                  : 'Todas las rondas se juegan igual.'
              }
            >
              <Switch
                checked={form.chaos}
                onChange={(chaos) => change({ chaos })}
                label={form.chaos ? 'Activado' : 'Desactivado'}
                disabled={!isHost}
              />
            </Field>
          </div>
        </div>
      </main>

      <footer className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onLeaveRoom}
          disabled={leaving}
          className="flex flex-1 w-full items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300 disabled:opacity-50"
        >
          <LogOut size={32} strokeWidth={3} />
          {leaving ? 'Saliendo...' : 'Salir de la sala'}
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="flex flex-1 w-full items-center justify-center gap-1 py-4 px-8 rounded-xl cursor-pointer text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={32} strokeWidth={3} />
            {canStart ? 'Iniciar Partida' : `Faltan ${missing} jugador(es)`}
          </button>
        ) : (
          <div className="flex-1 text-(--color-detail) text-xl text-center animate-pulse">
            Esperando a que el anfitrión inicie la partida...
          </div>
        )}
      </footer>

      {editorOpen && (
        <CategoryEditor
          onClose={() => setEditorOpen(false)}
          onUse={useCategory}
          current={form.custom}
        />
      )}
    </div>
  );
}

function ReadOnlyField({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: typeof Drama;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white/10 backdrop-blur">
      <label className="flex items-center justify-center gap-1 text-(--color-primary) text-xl font-semibold mb-2">
        <Icon size={24} strokeWidth={3} />
        {label}
      </label>
      <div className="text-(--color-secondary) text-2xl font-medium text-center">{value}</div>
    </div>
  );
}
