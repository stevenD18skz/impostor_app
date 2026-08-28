'use client';

import { useState, useRef } from 'react';
import { Player, GameData } from '@/app/types/local';
import RoleCard from '@/components/ui/RoleCard';
import './styleLocal.css';

interface RevealStateProps {
  gameData: GameData;
  setShowRole: (show: boolean) => void;
  onNextPlayer: () => void;
}

export default function RevealState({
  gameData,
  setShowRole,
  onNextPlayer
}: RevealStateProps) {
  const player: Player = gameData.game.players[gameData.game.currentPlayer];
  const totalPlayers = gameData.config.numPlayers;
  const current = gameData.game.currentPlayer + 1;

  // isPeeking: carta volteada sólo mientras está presionada
  // hasRevealed: si ya vio la carta al menos una vez (activa el botón "Siguiente")
  //
  // No hace falta reiniciarlos al cambiar de jugador: la pantalla se remonta
  // entera en cada turno —lleva `key` en `page.tsx`—, así que nacen limpios y
  // es imposible que la carta de uno aparezca abierta para el siguiente.
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const pressActive = useRef(false);

  const startPeek = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    pressActive.current = true;
    setIsPeeking(true);
    if (!hasRevealed) {
      setHasRevealed(true);
      setShowRole(true);
    }
  };

  const endPeek = () => {
    pressActive.current = false;
    setIsPeeking(false);
  };

  const isLastPlayer = gameData.game.currentPlayer === totalPlayers - 1;
  const nextPlayerName = !isLastPlayer ? gameData.game.players[gameData.game.currentPlayer + 1].name : '';

  return (
    <div className="reveal-screen">

      {/* Header compacto */}
      <div className="reveal-header">
        <h2 className="reveal-title font-press-start text-cyan-400 text-xl tracking-wider">REVELACIÓN</h2>
        <div className="reveal-progress">
          {Array(totalPlayers).fill(0).map((_, i) => (
            <div key={i} className={`progress-dot ${i < current ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Zona central: nombre + instrucción + carta */}
      <div className="reveal-center">

        {/* Nombre del jugador con contexto */}
        <div className="reveal-player-info">
          <p className="reveal-player-turn font-vt323 text-slate-400 text-xl">TURNO DE</p>
          <p className="reveal-player-name font-press-start text-pink-500 text-3xl md:text-4xl">{player.name}</p>
          
          {!hasRevealed && !isPeeking && (
            <div className="flex flex-col gap-1.5 items-center animate-in fade-in zoom-in duration-300">
              <p className="text-cyan-400 font-vt323 text-lg uppercase tracking-widest">
                ¡Asegúrate de que nadie mire tu pantalla! 🤫
              </p>
              <p className="reveal-player-hint font-vt323 text-xl text-slate-300">
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
              <p className="reveal-player-hint revealed-hint font-vt323 text-lg text-cyan-300">
                ✋ Suelta la pantalla para ocultarlo
              </p>
            </div>
          )}

          {hasRevealed && !isPeeking && (
            <div className="flex flex-col gap-1 items-center animate-in fade-in zoom-in duration-300">
               <p className="reveal-player-hint revealed-hint font-vt323 text-xl text-cyan-400">
                 ✅ ¿Ya sabes tu rol?
               </p>
               <p className="text-slate-400 text-lg font-vt323 px-4 text-center mt-2 uppercase">
                 {isLastPlayer 
                   ? 'Si estás listo, pulsa empezar.' 
                   : `Pásale el dispositivo a ${nextPlayerName}.`}
               </p>
            </div>
          )}
        </div>

        {/* Carta 3D */}
        <RoleCard
          isImpostor={player.isImpostor}
          secretWord={gameData.game.secretWord}
          categoryName={gameData.game.categoryName}
          isPeeking={isPeeking}
          hasRevealed={hasRevealed}
          onPeekStart={startPeek}
          onPeekEnd={endPeek}
        />
      </div>

      {/* Footer: botón siguiente, solo visible tras revelar */}
      <div className={`reveal-footer ${hasRevealed ? 'visible' : ''}`}>
        <button
          onClick={onNextPlayer}
          disabled={!hasRevealed}
          className="reveal-next-btn"
        >
          {isLastPlayer
            ? <><span>EMPEZAR</span> <span>▶</span></>
            : <><span>PASAR A {nextPlayerName}</span> <span>▶</span></>
          }
        </button>
      </div>

    </div>
  );
}
