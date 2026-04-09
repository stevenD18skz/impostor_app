'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const flipCard = useCallback(() => {
    if (isFlipped || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setIsFlipped(true);
      setIsFlipping(false);
      setShowRole(true);
    }, 350);
  }, [isFlipped, isFlipping, setShowRole]);

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isFlipped) return;
    setIsPressed(true);
    pressTimer.current = setTimeout(() => {
      flipCard();
    }, 180);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (!isFlipped) flipCard();
  };

  const handlePressCancel = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const totalPlayers = gameData.config.numPlayers;
  const current = gameData.game.currentPlayer + 1;

  return (
    <div className="reveal-screen">
      {/* Header */}
      <div className="reveal-header">
        <h2 className="reveal-title">Revelación de Roles</h2>
        <p className="reveal-subtitle">Jugador {current} de {totalPlayers}</p>

        {/* Progress dots */}
        <div className="reveal-progress">
          {Array(totalPlayers).fill(0).map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < current ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Card flip area */}
      <div className="card-scene-wrapper">
        {/* Player name chip */}
        <div className="player-name-chip">
          {player.name}
        </div>

        <div
          className={`card-scene-3d`}
          onMouseDown={!isFlipped ? handlePressStart : undefined}
          onMouseUp={!isFlipped ? handlePressEnd : undefined}
          onMouseLeave={!isFlipped ? handlePressCancel : undefined}
          onTouchStart={!isFlipped ? handlePressStart : undefined}
          onTouchEnd={!isFlipped ? handlePressEnd : undefined}
          onTouchCancel={!isFlipped ? handlePressCancel : undefined}
          style={{ cursor: isFlipped ? 'default' : 'pointer' }}
        >
          <div className={`card-3d-inner ${isFlipped ? 'flipped' : ''} ${isPressed && !isFlipped ? 'pressed' : ''}`}>
            {/* FRONT — card back (mystery) */}
            <div className="card-3d-face card-3d-front">
              <Image
                src="/card_back.png"
                alt="Carta boca abajo"
                fill
                className="card-image"
                priority
                draggable={false}
              />
              <div className="card-hint">
                <span>👆 Toca para revelar</span>
              </div>
            </div>

            {/* BACK — impostor or innocent */}
            <div className="card-3d-face card-3d-back">
              <Image
                src={player.isImpostor ? '/card_impostor.png' : '/card_innocent.png'}
                alt={player.isImpostor ? 'Impostor' : 'Inocente'}
                fill
                className="card-image"
                priority
                draggable={false}
              />

              {/* Word overlay for innocents */}
              {!player.isImpostor && isFlipped && (
                <div className="card-word-overlay">
                  <span className="card-word-label">Palabra secreta</span>
                  <span className="card-word-value">{gameData.game.secretWord}</span>
                </div>
              )}

              {/* Category overlay for impostors */}
              {player.isImpostor && isFlipped && (
                <div className="card-impostor-overlay">
                  <span className="card-word-label">Categoría</span>
                  <span className="card-word-value capitalize">{gameData.config.selectedCategory}</span>
                  <span className="card-impostor-hint">Descubre la palabra sin que te atrapen</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next button */}
      {isFlipped && (
        <div className="reveal-footer">
          <button
            onClick={onNextPlayer}
            className="reveal-next-btn"
          >
            {gameData.game.currentPlayer < gameData.config.numPlayers - 1
              ? <><span>Siguiente Jugador</span> <ChevronRight size={22} strokeWidth={3} /></>
              : <><span>¡Comenzar Partida!</span> <span>🎮</span></>
            }
          </button>
        </div>
      )}
    </div>
  );
}
