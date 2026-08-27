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

  const { Icon, label, borderTone } = {
    idle: canShare
      ? { Icon: Share2, label: 'INVITAR', borderTone: 'border-cyan-800 text-cyan-400 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)]' }
      : { Icon: Link2, label: 'COPIAR ENLACE', borderTone: 'border-cyan-800 text-cyan-400 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)]' },
    copied: { Icon: Check, label: '¡COPIADO!', borderTone: 'border-emerald-600 text-emerald-400 hover:border-emerald-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(52,211,153,0.4)]' },
    failed: { Icon: Link2, label: `DICTA: ${code}`, borderTone: 'border-slate-600 text-slate-400' },
  }[state];

  return (
    <button
      onClick={invite}
      title={canShare ? 'Compartir el enlace de la sala' : 'Copiar el enlace de la sala'}
      className={`flex items-center gap-2 px-5 py-3 bg-slate-900 border-4 font-press-start text-xs cursor-pointer hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all duration-200 ${borderTone}`}
    >
      <Icon size={18} strokeWidth={3} />
      {label}
    </button>
  );
}

/* ── Piezas del panel de ajustes ───────────────────────────────────────── */

/** El marco arcade con esquinas decorativas. */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900 border-4 border-cyan-800 p-4 rounded-none relative ${className}`}>
      <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function PanelLabel({ icon: Icon, children }: { icon: typeof Drama; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest mb-3">
      <Icon size={20} strokeWidth={3} className="text-pink-500" />
      {children}
    </label>
  );
}

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
    <div className="bg-slate-800 border-2 border-cyan-900 p-3 rounded-none">
      <label className="flex items-center justify-center gap-2 text-cyan-400 font-vt323 text-xl uppercase tracking-widest mb-2">
        <Icon size={20} strokeWidth={3} className="text-pink-500" />
        {label}
      </label>
      {children}
      {hint && <p className="text-slate-400 text-base font-vt323 text-center mt-2">{hint}</p>}
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
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            aria-pressed={active}
            className={`flex flex-col items-center justify-center gap-1 py-3 border-2 font-vt323 text-xl uppercase transition-all cursor-pointer ${
              active
                ? 'bg-pink-600 border-pink-400 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-300'
            } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <opt.icon size={24} strokeWidth={3} />
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
        className={`relative w-12 h-6 border-2 transition-all duration-300 rounded-none ${
          checked ? 'bg-pink-600 border-pink-400' : 'bg-slate-800 border-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform duration-300 rounded-none ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="text-white font-vt323 text-xl uppercase">{label}</span>
    </button>
  );
}

const ORDER_OPTIONS = [
  { value: 'lista' as const, label: 'Lista', icon: ListOrdered },
  { value: 'circulo' as const, label: 'En círculo', icon: RotateCw },
];

const ORDER_HINT = {
  lista: 'Un turno numerado para cada quien.',
  circulo: 'Se sortea quién empieza y hacia qué lado sigue.',
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
    <div className="space-y-5">
      <header className="flex flex-col items-center gap-3 pt-2">
        <h2 className="flex items-center justify-center gap-3 text-cyan-400 text-xl md:text-2xl font-press-start tracking-wider">
          <Home size={32} strokeWidth={3} className="text-pink-500" />
          SALA: <span className="text-pink-400">{code}</span>
        </h2>
        <InviteButton code={code} />
        <p className="text-slate-400 text-lg font-vt323 uppercase tracking-widest">
          Esperando jugadores...
        </p>
      </header>

      <main className="flex flex-col md:flex-row gap-4">
        {/* Jugadores */}
        <Panel className="flex-1">
          <PanelLabel icon={Users}>Jugadores ({players.length})</PanelLabel>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {players.length === 0 && (
              <p className="text-slate-400 text-lg font-vt323 animate-pulse text-center uppercase">
                Conectando...
              </p>
            )}
            {players.map((p) => (
              <div
                key={p.id}
                className={`border-2 p-2 flex items-center gap-3 rounded-none ${
                  p.id === myId
                    ? 'border-pink-500 bg-pink-600/20'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 shrink-0 rounded-none bg-pink-600 border-2 border-pink-400 flex items-center justify-center text-white text-lg font-vt323 font-bold">
                  {p.name?.trim()?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-white text-xl font-vt323 uppercase truncate">
                  {p.name}
                </span>
                {p.id === hostId && (
                  <span className="ml-auto text-xs bg-pink-600 border-2 border-pink-400 text-white px-2 py-0.5 rounded-none font-vt323 uppercase tracking-widest">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* Configuración (host manda, el resto mira) */}
        <Panel className="flex-1">
          <PanelLabel icon={Settings}>
            Config {isHost ? '(Host)' : '(Ver)'}
          </PanelLabel>

          <div className="space-y-3">
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
                    className="w-full px-4 py-3 text-2xl font-vt323 cursor-pointer bg-slate-800 text-white border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none focus:bg-slate-700 transition-colors"
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
                            className="bg-slate-800 text-xl"
                          >
                            {cat.nombre}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="De siempre">
                      {builtInCategories().map((cat) => (
                        <option key={cat.key} value={cat.key} className="bg-slate-800 text-xl">
                          {cat.nombre}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    onClick={() => setEditorOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-2 border-2 border-cyan-700 bg-slate-800 text-cyan-400 text-lg font-vt323 uppercase tracking-widest hover:border-cyan-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <BookPlus size={18} strokeWidth={3} />
                    {mine.length ? 'Mis categorías' : 'Crear una categoría'}
                  </button>
                </div>
              ) : (
                <div className="text-white text-2xl font-vt323 text-center uppercase">
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
              <ReadOnlyField label="Impostores" icon={Drama} value={numImpostors} />
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
                  ? 'Quien olvide su carta puede volver a mirarla manteniéndola pulsada.'
                  : 'Una vez repartidas, las cartas no se vuelven a mirar.'
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
                  ? 'De vez en cuando, y sin avisar, una ronda rompe las reglas.'
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
        </Panel>
      </main>

      <footer className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onLeaveRoom}
          disabled={leaving}
          className="group relative flex flex-1 items-center justify-center gap-2 py-4 px-6 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400" />
          <LogOut size={18} strokeWidth={3} />
          {leaving ? 'SALIENDO...' : 'SALIR'}
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="group relative flex flex-[2] items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400" />
            <Play size={18} strokeWidth={3} />
            {canStart ? 'INICIAR' : `FALTAN ${missing}`}
          </button>
        ) : (
          <div className="flex-1 text-slate-400 text-lg font-vt323 text-center animate-pulse uppercase tracking-widest">
            Esperando al anfitrión...
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
    <div className="bg-slate-800 border-2 border-cyan-900 p-3 rounded-none">
      <label className="flex items-center justify-center gap-2 text-cyan-400 font-vt323 text-xl uppercase tracking-widest mb-2">
        <Icon size={20} strokeWidth={3} className="text-pink-500" />
        {label}
      </label>
      <div className="text-white text-3xl font-vt323 text-center">{value}</div>
    </div>
  );
}
