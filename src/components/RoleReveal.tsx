import { useState } from 'react';
import { Eye } from 'lucide-react';

interface RoleRevealProps {
  player: any;
  secretWord: string;
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

export default function RoleReveal({ player, secretWord, onReady, playerHasReady, loading }: RoleRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  
  
  return (
    <div className="text-center space-y-8">
      <div className="bg-indigo-500/30 rounded-2xl p-6 border-2 border-purple-400">
        <h2 className="text-3xl font-bold text-white">
          🃏 Tu Carta
        </h2>
      </div>

      {!isRevealed ? (
        <div className="space-y-6">
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-8">
            <p className="text-white text-lg mb-4">
              ⚠️ Asegúrate de que solo tú puedas ver la pantalla
            </p>
          </div>

          <button
            onClick={() => setIsRevealed(true)}
            className="bg-cyan-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
          >
            <Eye className="inline mr-2 mb-1" size={24} />
            Ver Mi Rol
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`rounded-2xl p-8 border-4 ${player.is_impostor ? 'bg-red-900/40 border-red-400' : 'bg-green-900/40 border-green-400'}`}>
            <h3 className="text-2xl font-bold text-white mb-4">
              {player.is_impostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
            </h3>

            {!player.is_impostor && (
              <div className="bg-white/20 rounded-xl p-6 mt-4">
                <p className="text-white text-sm mb-2">Tu palabra secreta es:</p>
                <p className="text-white text-4xl font-bold">{secretWord}</p>
              </div>
            )}

            {player.is_impostor && (
              <div className="bg-white/20 rounded-xl p-6 mt-4">
                <p className="text-white text-lg">
                  No conoces la palabra secreta. Intenta descubrirla escuchando a los demás.
                </p>
              </div>
            )}
          </div>

          {!playerHasReady ? (
            <button
              onClick={onReady}
              className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
            >
              {loading.confirming ? 'Confirmando...' : '🎮 Entendido, ir al juego'}
            </button>
          )
            : (
              <span className="text-white text-lg">Esperando a que todos estén listos...  </span>
            )}
        </div>
      )}
    </div>
  );
}
