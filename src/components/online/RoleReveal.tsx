import { useState } from 'react';
import { Eye, Lightbulb, Play } from 'lucide-react';

interface RoleRevealProps {
  playerName: string;
  card: {
    isImpostor: boolean;
    /** `null` para el impostor: la palabra no viaja a su pantalla ni escondida. */
    secretWord: string | null;
    categoryName: string;
  };
  onReady: () => void;
  hasReady: boolean;
  readyCount: number;
  totalCount: number;
}

export default function RoleReveal({
  playerName,
  card,
  onReady,
  hasReady,
  readyCount,
  totalCount,
}: RoleRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const headerBorder = isRevealed
    ? card.isImpostor
      ? 'border-red-500 bg-red-950'
      : 'border-emerald-500 bg-emerald-950'
    : 'border-amber-500 bg-amber-950';

  return (
    <div className="space-y-5">
      <header className={`border-4 p-5 rounded-none relative ${headerBorder}`}>
        <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
        <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
        <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
        <h2 className="text-xl sm:text-2xl font-press-start text-white text-center relative z-10">
          {isRevealed ? (card.isImpostor ? '🎭' : '🃏') : '🔒'} {playerName}
        </h2>
      </header>

      {!isRevealed ? (
        <div className="flex flex-col items-center justify-center space-y-5">
          <div className="bg-slate-900 border-4 border-amber-500 p-5 rounded-none relative text-center">
            <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
            <div className="relative z-10">
              <p className="text-white text-xl font-vt323 uppercase tracking-widest mb-2">
                ⚠️ {playerName}, asegúrate de que solo tú puedas ver la pantalla
              </p>
              <p className="text-slate-400 text-lg font-vt323 uppercase">
                Los demás jugadores deben mirar hacia otro lado
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRevealed(true)}
            className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 cursor-pointer"
          >
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400" />
            <Eye size={18} strokeWidth={3} />
            VER MI ROL
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-5">
          <div
            className={`border-4 p-5 rounded-none relative w-full text-center ${
              card.isImpostor
                ? 'border-red-500 bg-red-950'
                : 'border-emerald-500 bg-emerald-950'
            }`}
          >
            <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />

            <div className="relative z-10 space-y-4">
              <h3 className={`text-xl sm:text-2xl font-press-start ${
                card.isImpostor ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {card.isImpostor ? '🎭 IMPOSTOR' : '✅ INOCENTE'}
              </h3>

              {!card.isImpostor && (
                <div className="bg-slate-800 border-2 border-cyan-900 p-4 rounded-none">
                  <p className="text-cyan-400 font-vt323 text-lg uppercase tracking-widest mb-2">
                    Tu palabra secreta es
                  </p>
                  <p className="text-white font-press-start text-base md:text-xl uppercase break-words">
                    {card.secretWord}
                  </p>
                </div>
              )}

              {card.isImpostor && (
                <div className="bg-slate-800 border-2 border-cyan-900 p-4 rounded-none space-y-3">
                  <p className="flex items-center justify-center gap-2 text-cyan-400 font-vt323 text-lg uppercase tracking-widest">
                    <Lightbulb size={22} strokeWidth={3} className="text-amber-400" />
                    La categoría es
                  </p>
                  <p className="text-pink-500 font-press-start text-base md:text-xl uppercase break-words">
                    {card.categoryName}
                  </p>
                  <p className="text-slate-400 font-vt323 text-base">
                    No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te
                    descubran.
                  </p>
                </div>
              )}
            </div>
          </div>

          {!hasReady ? (
            <button
              onClick={onReady}
              className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 cursor-pointer"
            >
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400" />
              <Play size={18} strokeWidth={3} />
              ENTENDIDO, AL JUEGO
            </button>
          ) : (
            <div className="text-center space-y-1">
              <span className="text-cyan-400 font-vt323 text-xl uppercase tracking-widest animate-pulse">
                Esperando a que todos estén listos...
              </span>
              <p className="text-slate-400 font-vt323 text-lg">
                {readyCount} de {totalCount} listos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
