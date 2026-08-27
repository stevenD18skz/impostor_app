'use client';

import { useState, useRef } from 'react';
import { Player, GameData } from '@/app/types/local';
import Image from 'next/image';
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
        <div
          className={`card-scene-3d ${isPeeking ? 'peeking' : ''}`}
          onMouseDown={startPeek}
          onMouseUp={endPeek}
          onMouseLeave={endPeek}
          onTouchStart={startPeek}
          onTouchEnd={endPeek}
          onTouchCancel={endPeek}
          style={{ cursor: 'pointer', touchAction: 'none' }}
        >
          <div className={`card-3d-inner ${isPeeking ? 'flipped' : ''}`}>

            {/* Frente: dorso de la carta */}
            <div className="card-3d-face card-3d-front">
              <Image
                src="/card_back.png"
                alt="Carta boca abajo"
                fill
                className="card-image"
                priority
                draggable={false}
              />
              {/* Pulso visual cuando aún no se ha visto */}
              {!hasRevealed && (
                <div className="card-pulse-ring" />
              )}
            </div>

            {/* Reverso: rol del jugador */}
            <div className="card-3d-face card-3d-back">
              <Image
                src={player.isImpostor ? '/card_impostor.png' : '/card_innocent.png'}
                alt={player.isImpostor ? 'Impostor' : 'Inocente'}
                fill
                className="card-image"
                priority
                draggable={false}
              />

              {/* Info overlay inocente */}
              {!player.isImpostor && (
                <div className="card-word-overlay">
                  <span className="card-word-label font-vt323 text-cyan-400">Tu palabra secreta</span>
                  <span className="card-word-value font-press-start text-white text-sm md:text-base mt-2 uppercase">{gameData.game.secretWord}</span>
                </div>
              )}

              {/* Info overlay impostor */}
              {player.isImpostor && (
                <div className="card-impostor-overlay">
                  <span className="card-word-label font-vt323 text-pink-400">La categoría es</span>
                  <span className="card-word-value capitalize font-press-start text-white text-sm md:text-base mt-2">{gameData.game.categoryName}</span>
                  <span className="card-impostor-hint font-vt323 text-slate-300 text-sm mt-2">Adivina la palabra sin ser atrapado</span>
                </div>
              )}
            </div>
          </div>

          {/* Sombra dinámica bajo la carta */}
          <div className={`card-shadow ${isPeeking ? (player.isImpostor ? 'shadow-impostor' : 'shadow-innocent') : ''}`} />
        </div>
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
