'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
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
  const [isPeeking, setIsPeeking] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const pressActive = useRef(false);

  // Resetear estado local cada vez que cambia el jugador
  useEffect(() => {
    setIsPeeking(false);
    setHasRevealed(false);
    pressActive.current = false;
  }, [gameData.game.currentPlayer]);

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

  return (
    <div className="reveal-screen">

      {/* Header compacto */}
      <div className="reveal-header">
        <h2 className="reveal-title">Revelación de Roles</h2>
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
          <p className="reveal-player-turn">Turno de</p>
          <p className="reveal-player-name">{player.name}</p>
          {!hasRevealed && (
            <p className="reveal-player-hint">
              {typeof window !== 'undefined' && 'ontouchstart' in window
                ? '👇 Mantén presionada la carta'
                : '🖱️ Mantén presionado para ver tu rol'}
            </p>
          )}
          {hasRevealed && !isPeeking && (
            <p className="reveal-player-hint revealed-hint">
              ✅ Puedes verla otra vez o continuar
            </p>
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
                  <span className="card-word-label">Tu palabra secreta</span>
                  <span className="card-word-value">{gameData.game.secretWord}</span>
                </div>
              )}

              {/* Info overlay impostor */}
              {player.isImpostor && (
                <div className="card-impostor-overlay">
                  <span className="card-word-label">La categoría es</span>
                  <span className="card-word-value capitalize">{gameData.config.selectedCategory}</span>
                  <span className="card-impostor-hint">Adivina la palabra sin que te atrapen</span>
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
            ? <><span>¡Empezar Partida!</span> <span>🎮</span></>
            : <><span>Siguiente Jugador</span> <ChevronRight size={22} strokeWidth={3} /></>
          }
        </button>
      </div>

    </div>
  );
}
