import { Medal, RotateCcw, Tornado } from 'lucide-react';
import type { Variant } from '@/lib/room';

interface Player {
  isImpostor: boolean;
  name: string;
}

interface EndedStateProps {
  secretWord: string;
  players: Player[];
  /** Qué clase de ronda fue. Es aquí, y solo aquí, donde se destapa. */
  variant: Variant;
  onResetGame: () => void;
}

/*
  Una ronda caótica no se anuncia al empezar: si se supiera, dejaría de
  funcionar. Todas las cartas parecen normales hasta este momento.
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

export default function EndedState({
  secretWord,
  players,
  variant,
  onResetGame
}: EndedStateProps) {
  const impostors = players.filter(p => p.isImpostor);
  const multipleImpostors = impostors.length > 1;
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
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>
          <p className="text-cyan-400 font-vt323 text-xl uppercase tracking-widest mb-2">La palabra secreta era</p>
          <p className="text-white font-press-start text-2xl md:text-3xl">{secretWord}</p>
        </div>

        {/* Impostors */}
        <div className="bg-slate-900 border-4 border-cyan-800 p-5 rounded-none relative text-center mt-2">
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>
          {impostors.length === 0 ? (
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
                {multipleImpostors ? `Los impostores eran (${impostors.length})` : 'El impostor era'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                {impostors.map((p, i) => (
                  <span key={i} className="text-pink-500 font-press-start text-xl md:text-2xl drop-shadow-[2px_2px_0_#0f172a]">
                    {p.name}{i < impostors.length - 1 ? ' &' : ''}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-800 border-2 border-cyan-900 p-4 rounded-none text-center mt-2">
          <p className="text-lg font-vt323 text-slate-400 uppercase">
            {variant === 'ninguno'
              ? '¿A cuántos inocentes acusaron? 😅'
              : variant === 'todos'
                ? '¿Alguien llegó a sospecharlo? 🤯'
                : `¿Adivinaron ${multipleImpostors ? 'a los impostores' : 'quién era el impostor'}? 🤔`}
          </p>
        </div>
      </main>

      <footer className="pt-2">
        <button
          onClick={onResetGame}
          className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 border-4 border-cyan-700 text-cyan-400 font-press-start text-xs sm:text-sm hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:shadow-none transition-all duration-200 outline-none"
        >
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400"></div>
          <RotateCcw size={20} strokeWidth={3} className="text-pink-500" />
          NUEVA PARTIDA
        </button>
      </footer>
    </div>
  );
}
