import { useState } from 'react';
import { Eye, Lightbulb, Play } from 'lucide-react';

interface RoleRevealProps {
  player: any;
  gameData: any;
  onReady: () => void;
  playerHasReady: boolean;
  loading: {
    leaving: boolean;
    updating: boolean;
    starting: boolean;
    confirming: boolean;
    ending: boolean;
    resetting: boolean;
  };
}

export default function RoleReveal({ player, gameData, onReady, playerHasReady, loading }: RoleRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  console.log(gameData);



  return (
    <div className="space-y-8">
      <header className={`rounded-2xl p-6 border-2
        ${isRevealed
          ? (player.is_impostor
            ? 'bg-linear-to-br from-red-400/40 to-red-900/40 border-red-400'
            : 'bg-linear-to-br from-green-400/40 to-green-900/40 border-green-400')
          : 'bg-linear-to-br from-amber-300/40 to-amber-600/40 border-amber-400'}`}>
        <h2 className="text-3xl font-bold text-(--color-secondary)">
          {isRevealed ? (player.is_impostor ? '🎭' : '🃏') : '🔒'} Carta de {player.name}
        </h2>
      </header>

      {!isRevealed ? (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="bg-linear-to-br from-amber-300/40 to-amber-600/40 border-2 border-amber-400 rounded-2xl p-8">
            <p className="text-(--color-secondary) text-2xl mb-4">
              ⚠️ {player.name}, asegúrate de que solo tú puedas ver la pantalla
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
          <div className={`rounded-2xl p-8 border-2 w-full 
            ${player.is_impostor
              ? 'bg-linear-to-br from-red-400/40 to-red-900/40 border-red-400'
              : 'bg-linear-to-br from-green-400/40 to-green-900/40 border-green-400'}
            `}>

            <h3 className="text-2xl font-bold text-(--color-secondary) mb-4">
              {player.is_impostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
            </h3>

            {!player.is_impostor && (
              <div className="bg-white/20 rounded-xl p-6 mt-4">
                <p className="text-(--color-secondary) text-xl mb-2">Tu palabra secreta es</p>
                <p className="text-(--color-secondary) text-4xl font-bold">{gameData.secretWord}</p>
              </div>
            )}

            {player.is_impostor && (
              <div className="bg-white/20 rounded-xl p-6 space-y-4">
                <p className="text-(--color-secondary) text-2xl flex items-center justify-center mb-0">
                  <Lightbulb size={32} strokeWidth={3} className="text-amber-500" />
                  La categoría es
                </p>
                <p><strong className="text-pink-500 text-4xl">{gameData.settings.category}</strong></p>
                <p className="text-(--color-detail) text-lg">
                  No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te descubran.
                </p>
              </div>
            )}
          </div>

          {!playerHasReady ? (
            <button
              onClick={onReady}
              className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
            >
              <Play size={32} strokeWidth={3} />
              {loading.confirming ? 'Confirmando...' : 'Entendido, ir al juego'}
            </button>
          )
            : (
              <span className="text-(--color-secondary) text-xl">Esperando a que todos estén listos...</span>
            )}
        </div>
      )}
    </div>
  );
}
