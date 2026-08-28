'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import RoleCard from '@/components/ui/RoleCard';

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
  // isPeeking: la carta está volteada sólo mientras se mantiene pulsada.
  // hasRevealed: ya la vio una vez, así que puede marcarse como listo.
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  const startPeek = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPeeking(true);
    if (!hasRevealed) setHasRevealed(true);
  };

  const endPeek = () => setIsPeeking(false);

  const headerBorder = hasRevealed
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
          {hasRevealed ? (card.isImpostor ? '🎭' : '🃏') : '🔒'} {playerName}
        </h2>
      </header>

      <div className="flex flex-col items-center justify-center gap-6">

        {/* Instrucciones: cambian según si la carta está boca abajo, abierta o ya vista */}
        <div className="text-center min-h-[5.5rem] flex flex-col justify-center gap-1.5">
          {!hasRevealed && !isPeeking && (
            <div className="flex flex-col gap-1.5 items-center animate-in fade-in zoom-in duration-300">
              <p className="text-cyan-400 font-vt323 text-lg uppercase tracking-widest">
                ¡Asegúrate de que nadie mire tu pantalla! 🤫
              </p>
              <p className="font-vt323 text-xl text-slate-300">
                {typeof window !== 'undefined' && 'ontouchstart' in window
                  ? '👇 Mantén presionada la carta'
                  : '🖱️ Mantén presionado para ver'}
              </p>
            </div>
          )}

          {isPeeking && (
            <div className="flex flex-col gap-1.5 items-center animate-in fade-in zoom-in duration-300">
              <p className="text-pink-500 font-vt323 text-xl uppercase tracking-widest">
                Memorízalo bien... 🧠
              </p>
              <p className="font-vt323 text-lg text-cyan-300">
                ✋ Suelta la pantalla para ocultarlo
              </p>
            </div>
          )}

          {hasRevealed && !isPeeking && (
            <div className="flex flex-col gap-1 items-center animate-in fade-in zoom-in duration-300">
              <p className="font-vt323 text-xl text-cyan-400">✅ ¿Ya sabes tu rol?</p>
              <p className="text-slate-400 text-lg font-vt323 px-4 text-center uppercase">
                {card.isImpostor
                  ? 'No conoces la palabra: descúbrela escuchando sin que te atrapen.'
                  : 'Vuelve a pulsar la carta si necesitas repasarla.'}
              </p>
            </div>
          )}
        </div>

        <RoleCard
          isImpostor={card.isImpostor}
          secretWord={card.secretWord}
          categoryName={card.categoryName}
          isPeeking={isPeeking}
          hasRevealed={hasRevealed}
          onPeekStart={startPeek}
          onPeekEnd={endPeek}
        />

        {!hasReady ? (
          <button
            onClick={onReady}
            disabled={!hasRevealed}
            className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:shadow-none transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-pink-400 disabled:hover:border-pink-700 disabled:hover:shadow-none"
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
    </div>
  );
}
