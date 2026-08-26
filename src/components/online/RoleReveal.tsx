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

  return (
    <div className="space-y-8">
      <header
        className={`rounded-2xl p-6 border-2
        ${
          isRevealed
            ? card.isImpostor
              ? 'bg-linear-to-br from-red-400/40 to-red-900/40 border-red-400'
              : 'bg-linear-to-br from-green-400/40 to-green-900/40 border-green-400'
            : 'bg-linear-to-br from-amber-300/40 to-amber-600/40 border-amber-400'
        }`}
      >
        <h2 className="text-3xl font-bold text-(--color-secondary)">
          {isRevealed ? (card.isImpostor ? '🎭' : '🃏') : '🔒'} Carta de {playerName}
        </h2>
      </header>

      {!isRevealed ? (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="bg-linear-to-br from-amber-300/40 to-amber-600/40 border-2 border-amber-400 rounded-2xl p-8">
            <p className="text-(--color-secondary) text-2xl mb-4">
              ⚠️ {playerName}, asegúrate de que solo tú puedas ver la pantalla
            </p>
            <p className="text-(--color-detail) text-lg">
              Los demás jugadores deben mirar hacia otro lado
            </p>
          </div>

          <button
            onClick={() => setIsRevealed(true)}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-orange-600 text-xl text-(--color-secondary) font-bold hover:bg-orange-700 transition-all duration-300"
          >
            <Eye size={32} strokeWidth={3} />
            Ver Mi Rol
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div
            className={`rounded-2xl p-8 border-2 w-full
            ${
              card.isImpostor
                ? 'bg-linear-to-br from-red-400/40 to-red-900/40 border-red-400'
                : 'bg-linear-to-br from-green-400/40 to-green-900/40 border-green-400'
            }
            `}
          >
            <h3 className="text-2xl font-bold text-(--color-secondary) mb-4">
              {card.isImpostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
            </h3>

            {!card.isImpostor && (
              <div className="bg-white/20 rounded-xl p-6 mt-4">
                <p className="text-(--color-secondary) text-xl mb-2">Tu palabra secreta es</p>
                <p className="text-(--color-secondary) text-4xl font-bold">{card.secretWord}</p>
              </div>
            )}

            {card.isImpostor && (
              <div className="bg-white/20 rounded-xl p-6 space-y-4">
                <p className="text-(--color-secondary) text-2xl flex items-center justify-center mb-0">
                  <Lightbulb size={32} strokeWidth={3} className="text-amber-500" />
                  La categoría es
                </p>
                <p>
                  <strong className="text-pink-500 text-4xl">{card.categoryName}</strong>
                </p>
                <p className="text-(--color-detail) text-lg">
                  No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te
                  descubran.
                </p>
              </div>
            )}
          </div>

          {!hasReady ? (
            <button
              onClick={onReady}
              className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
            >
              <Play size={32} strokeWidth={3} />
              Entendido, ir al juego
            </button>
          ) : (
            <div className="space-y-2 text-center">
              <span className="text-(--color-secondary) text-xl">
                Esperando a que todos estén listos...
              </span>
              <p className="text-(--color-detail) text-lg">
                {readyCount} de {totalCount} listos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
