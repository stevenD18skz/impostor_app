import { Medal, RotateCcw, Tornado } from 'lucide-react';
import type { Card, Variant } from '@/lib/room';

interface GameEndProps {
  secretWord: string;
  /** Pueden ser varios: la configuración deja subir el número de impostores. */
  impostors: Card[];
  /** Qué clase de ronda fue. Es aquí, y solo aquí, donde se destapa. */
  variant: Variant;
  onReset: () => void;
  /** Volver al lobby lo decide el anfitrión; los demás esperan. */
  canReset: boolean;
}

/*
  Una ronda caótica no se anuncia al empezar: si se supiera, dejaría de
  funcionar. Durante toda la partida cada carta parece de lo más normal, y la
  trampa se destapa justo aquí, cuando ya no hay nada que hacer al respecto.
*/
const CHAOS_COPY: Record<Exclude<Variant, 'normal'>, { titulo: string; detalle: string }> = {
  todos: {
    titulo: '¡Todos eran impostores!',
    detalle: 'Nadie conocía la palabra. Estaban improvisando los unos para los otros.',
  },
  ninguno: {
    titulo: 'No había ningún impostor',
    detalle: 'Todos conocían la palabra. Toda esa desconfianza fue de gratis.',
  },
  mitad: {
    titulo: 'La mitad de la sala era impostora',
    detalle: 'El doble de mentiras de lo que nadie esperaba.',
  },
};

export default function GameEnd({
  secretWord,
  impostors,
  variant,
  onReset,
  canReset,
}: GameEndProps) {
  const many = impostors.length > 1;
  const chaos = variant === 'normal' ? null : CHAOS_COPY[variant];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
        <Medal size={48} strokeWidth={2} />
        <h2>¡Juego Terminado!</h2>
        <Medal size={48} strokeWidth={2} />
      </header>

      {chaos && (
        <section className="rounded-2xl p-6 border-2 border-fuchsia-400 bg-linear-to-br from-fuchsia-500/40 to-purple-900/40 space-y-2">
          <p className="flex items-center justify-center gap-2 text-fuchsia-200 text-lg font-bold uppercase tracking-widest">
            <Tornado size={24} strokeWidth={3} />
            Ronda caótica
            <Tornado size={24} strokeWidth={3} />
          </p>
          <p className="text-(--color-secondary) text-4xl font-bold">{chaos.titulo}</p>
          <p className="text-fuchsia-100 text-lg">{chaos.detalle}</p>
        </section>
      )}

      <main className="rounded-2xl p-8 space-y-6 bg-white/10">
        <p className="mb-0 text-(--color-secondary) text-2xl">La palabra secreta era</p>
        <p className="text-amber-500 text-5xl font-bold">{secretWord}</p>

        {variant === 'ninguno' ? (
          <p className="mb-0 text-(--color-secondary) text-2xl">
            Y esta vez <strong className="text-pink-500">la sabían todos</strong>.
          </p>
        ) : (
          <>
            <p className="mb-0 text-(--color-secondary) text-2xl">
              {many ? 'Los impostores eran' : 'El impostor era'}
            </p>
            {impostors.length ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {impostors.map((i) => (
                  <span key={i.id} className="text-pink-500 text-5xl font-bold">
                    {i.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-pink-500 text-5xl font-bold">Desconocido</p>
            )}
          </>
        )}

        <div className="pt-2 border-t border-white/20">
          <p className="text-lg text-(--color-detail)">
            {variant === 'ninguno'
              ? '¿A cuántos inocentes acusaron? 😅'
              : variant === 'todos'
                ? '¿Alguien llegó a sospecharlo? 🤯'
                : many
                  ? '¿Adivinaron quiénes eran los impostores? 🤔'
                  : '¿Adivinaron quién era el impostor? 🤔'}
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-2">
        {canReset ? (
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
          >
            <RotateCcw size={32} strokeWidth={3} />
            Volver al Lobby
          </button>
        ) : (
          <p className="text-(--color-detail) text-xl animate-pulse">
            Esperando a que el anfitrión vuelva al lobby...
          </p>
        )}
      </footer>
    </div>
  );
}
