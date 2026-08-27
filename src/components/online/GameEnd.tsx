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
    titulo: '¡TODOS ERAN IMPOSTORES!',
    detalle: 'Nadie conocía la palabra. Estaban improvisando los unos para los otros.',
  },
  ninguno: {
    titulo: 'NO HABÍA IMPOSTOR',
    detalle: 'Todos conocían la palabra. Toda esa desconfianza fue de gratis.',
  },
  mitad: {
    titulo: 'LA MITAD ERAN IMPOSTORES',
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
    <div className="flex flex-col gap-5 flex-1">
      <header className="flex items-center justify-center gap-3 text-2xl font-press-start text-cyan-400 pt-2">
        <Medal size={36} strokeWidth={3} className="text-pink-500" />
        <h2 className="tracking-wider">TERMINADO</h2>
        <Medal size={36} strokeWidth={3} className="text-pink-500" />
      </header>

      <main className="flex flex-col gap-4 flex-1">
        {chaos && (
          <div className="bg-fuchsia-950 border-4 border-fuchsia-500 p-4 rounded-none text-center">
            <p className="flex items-center justify-center gap-2 text-fuchsia-300 font-vt323 text-lg uppercase tracking-widest">
              <Tornado size={20} strokeWidth={3} />
              Ronda caótica
              <Tornado size={20} strokeWidth={3} />
            </p>
            <p className="text-white font-press-start text-base md:text-xl mt-2">{chaos.titulo}</p>
            <p className="text-fuchsia-200 font-vt323 text-lg mt-2">{chaos.detalle}</p>
          </div>
        )}

        {/* Secret word */}
        <div className="bg-slate-900 border-4 border-cyan-800 p-5 rounded-none relative text-center">
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
          <p className="text-cyan-400 font-vt323 text-xl uppercase tracking-widest mb-2">
            La palabra secreta era
          </p>
          <p className="text-white font-press-start text-2xl md:text-3xl">{secretWord}</p>
        </div>

        {/* Impostors */}
        <div className="bg-slate-900 border-4 border-cyan-800 p-5 rounded-none relative text-center">
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
          {variant === 'ninguno' ? (
            <>
              <p className="text-cyan-400 font-vt323 text-xl uppercase tracking-widest mb-3">
                Y esta vez la sabían
              </p>
              <span className="text-pink-500 font-press-start text-xl md:text-2xl drop-shadow-[2px_2px_0_#0f172a]">
                TODOS
              </span>
            </>
          ) : (
            <>
              <p className="text-cyan-400 font-vt323 text-xl uppercase tracking-widest mb-3">
                {many ? `Los impostores eran (${impostors.length})` : 'El impostor era'}
              </p>
              {impostors.length ? (
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                  {impostors.map((i, idx) => (
                    <span key={i.id} className="text-pink-500 font-press-start text-xl md:text-2xl drop-shadow-[2px_2px_0_#0f172a]">
                      {i.name}{idx < impostors.length - 1 ? ' &' : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-pink-500 font-press-start text-xl md:text-2xl">Desconocido</p>
              )}
            </>
          )}
        </div>

        <div className="bg-slate-800 border-2 border-cyan-900 p-4 rounded-none text-center">
          <p className="text-lg font-vt323 text-slate-400 uppercase">
            {variant === 'ninguno'
              ? '¿A cuántos inocentes acusaron? 😅'
              : variant === 'todos'
                ? '¿Alguien llegó a sospecharlo? 🤯'
                : many
                  ? '¿Adivinaron a los impostores? 🤔'
                  : '¿Adivinaron quién era el impostor? 🤔'}
          </p>
        </div>
      </main>

      <footer className="pt-2">
        {canReset ? (
          <button
            onClick={onReset}
            className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 outline-none cursor-pointer"
          >
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400" />
            <RotateCcw size={20} strokeWidth={3} className="text-pink-400 group-hover:text-white" />
            VOLVER AL LOBBY
          </button>
        ) : (
          <p className="text-slate-400 text-lg font-vt323 text-center animate-pulse uppercase tracking-widest">
            Esperando al anfitrión...
          </p>
        )}
      </footer>
    </div>
  );
}
