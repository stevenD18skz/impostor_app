'use client';

import Image from 'next/image';
import './card3d.css';

interface RoleCardProps {
  isImpostor: boolean;
  /** `null` cuando el jugador es impostor: su pantalla nunca recibe la palabra. */
  secretWord: string | null;
  categoryName: string;
  /** La carta está volteada mientras se mantiene pulsada. */
  isPeeking: boolean;
  /** Ya se vio al menos una vez: apaga el aro de pulso que invita a pulsar. */
  hasRevealed: boolean;
  onPeekStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onPeekEnd: () => void;
}

/**
 * Carta 3D de revelación de rol. La usan por igual el modo local y el online,
 * que sólo se diferencian en el texto que rodea a la carta, no en la carta.
 */
export default function RoleCard({
  isImpostor,
  secretWord,
  categoryName,
  isPeeking,
  hasRevealed,
  onPeekStart,
  onPeekEnd,
}: RoleCardProps) {
  return (
    <div
      className={`card-scene-3d ${isPeeking ? 'peeking' : ''}`}
      onMouseDown={onPeekStart}
      onMouseUp={onPeekEnd}
      onMouseLeave={onPeekEnd}
      onTouchStart={onPeekStart}
      onTouchEnd={onPeekEnd}
      onTouchCancel={onPeekEnd}
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
          {!hasRevealed && <div className="card-pulse-ring" />}
        </div>

        {/* Reverso: rol del jugador */}
        <div className="card-3d-face card-3d-back">
          <Image
            src={isImpostor ? '/card_impostor.png' : '/card_innocent.png'}
            alt={isImpostor ? 'Impostor' : 'Inocente'}
            fill
            className="card-image"
            priority
            draggable={false}
          />

          {/* Info overlay inocente */}
          {!isImpostor && (
            <div className="card-word-overlay">
              <span className="card-word-label font-vt323 text-cyan-400">Tu palabra secreta</span>
              <span className="card-word-value font-press-start text-white text-sm md:text-base mt-2 uppercase">{secretWord}</span>
            </div>
          )}

          {/* Info overlay impostor */}
          {isImpostor && (
            <div className="card-impostor-overlay">
              <span className="card-word-label font-vt323 text-pink-400">La categoría es</span>
              <span className="card-word-value capitalize font-press-start text-white text-sm md:text-base mt-2">{categoryName}</span>
              <span className="card-impostor-hint font-vt323 text-slate-300 text-sm mt-2">Adivina la palabra sin ser atrapado</span>
            </div>
          )}
        </div>
      </div>

      {/* Sombra dinámica bajo la carta */}
      <div className={`card-shadow ${isPeeking ? (isImpostor ? 'shadow-impostor' : 'shadow-innocent') : ''}`} />
    </div>
  );
}
