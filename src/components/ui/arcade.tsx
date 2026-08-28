import type { LucideIcon } from 'lucide-react';

/*
  Las piezas del look arcade, en un solo sitio.

  Antes cada pantalla se pintaba sus propios marcos y botones a mano, y por eso
  el online acabó con tarjetas redondeadas de cristal mientras el local iba con
  bordes duros de recreativa: no había nada que obligara a que se parecieran.
  Ahora el estilo vive acá y las pantallas solo lo usan, así que cambiarlo es
  cambiarlo en todas a la vez.
*/

/** El marco con las cuatro esquinas de píxeles que llevan todas las tarjetas. */
export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative bg-slate-900 border-4 border-cyan-800 rounded-none p-4 ${className}`}>
      <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** El título de una tarjeta: cian, en versalitas, con el icono en rosa. */
export function PanelLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest mb-3">
      <Icon size={20} strokeWidth={3} className="text-pink-500 shrink-0" />
      {children}
    </p>
  );
}

/** La línea de texto pequeño que explica un ajuste. */
export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 text-base font-vt323 text-center mt-3">{children}</p>;
}

/* ── Botones ───────────────────────────────────────────────────────────── */

export type Tone = 'cyan' | 'pink' | 'slate' | 'amber';

/*
  Tailwind lee las clases del código fuente tal cual están escritas, así que los
  tonos no se pueden construir con plantillas: hay que nombrarlos enteros.
*/
const TONES: Record<Tone, string> = {
  cyan: 'border-cyan-700 text-cyan-400 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)]',
  pink: 'border-pink-700 text-pink-400 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)]',
  slate: 'border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(148,163,184,0.3)]',
  amber: 'border-amber-700 text-amber-300 hover:border-amber-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(245,158,11,0.4)]',
};

const CORNER: Record<Tone, string> = {
  cyan: 'bg-cyan-800 group-hover:bg-cyan-400',
  pink: 'bg-pink-700 group-hover:bg-pink-400',
  slate: 'bg-slate-600 group-hover:bg-slate-300',
  amber: 'bg-amber-700 group-hover:bg-amber-300',
};

/**
 * El botón de recreativa: se levanta al pasar por encima y se hunde al pulsar.
 * Va en Press Start 2P, que es ancha, así que el texto se mantiene corto.
 */
export function ArcadeButton({
  children,
  onClick,
  tone = 'cyan',
  icon: Icon,
  disabled = false,
  className = '',
  title,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: Tone;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`group relative flex items-center justify-center gap-2 py-4 px-4 bg-slate-900 border-4 font-press-start text-xs sm:text-sm transition-all duration-200 outline-none cursor-pointer active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:text-inherit ${TONES[tone]} ${className}`}
    >
      <span className={`absolute top-1 right-1 w-1.5 h-1.5 ${CORNER[tone]}`} />
      {Icon && <Icon size={18} strokeWidth={3} className="shrink-0" />}
      {children}
    </button>
  );
}

/* ── Controles de ajustes ──────────────────────────────────────────────── */

/** El interruptor cuadrado. Sin curvas: acá no hay nada redondo. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
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
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-center gap-3 w-full py-1 ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <span
        className={`relative block w-12 h-6 border-2 rounded-none transition-colors duration-200 shrink-0 ${
          checked ? 'bg-pink-600 border-pink-400' : 'bg-slate-800 border-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-none transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="text-white font-vt323 text-xl uppercase">{label}</span>
    </button>
  );
}

/** Dos opciones, las dos siempre a la vista. Un desplegable para dos cosas sobra. */
export function Choice<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
}: {
  value: T;
  options: { value: T; label: string; icon: LucideIcon }[];
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
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-2 border-2 rounded-none font-vt323 text-xl uppercase transition-all ${
              active
                ? 'bg-pink-600 border-pink-400 text-white'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            } ${
              disabled
                ? 'cursor-default'
                : 'cursor-pointer hover:border-cyan-500 hover:text-cyan-300'
            }`}
          >
            <opt.icon size={24} strokeWidth={3} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** La caja de texto de siempre: cuadrada, fondo oscuro, borde cian. */
export const INPUT_CLASS =
  'w-full px-4 py-3 text-xl font-vt323 bg-slate-800 text-white border-2 border-cyan-700 rounded-none placeholder:text-slate-600 focus:border-cyan-400 focus:bg-slate-700 focus:outline-none transition-colors';

/** El aviso de error, en rosa porque el rojo puro se sale de la paleta. */
export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-pink-600/20 border-2 border-pink-500 text-pink-100 text-lg font-vt323 p-3 text-center">
      ⚠️ {children}
    </p>
  );
}
