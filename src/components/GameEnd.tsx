import { Loader2, RotateCcw } from 'lucide-react';

interface GameEndProps {
  room: any;
  onReset: () => void;
  loading: {
    leaving: boolean;
    updating: boolean;
    starting: boolean;
    confirming: boolean;
    ending: boolean;
    resetting: boolean;
  };
}

export default function GameEnd({ room, onReset, loading }: GameEndProps) {
  const impostor = room.players.find((p: any) => p.is_impostor);

  if (loading.resetting) {
    return (
      <div className="text-center space-y-8">
        <h2 className="text-4xl font-bold text-white">🏁 ¡Juego Terminado!</h2>
        <div className="bg-white/10 rounded-2xl p-8 space-y-4">
          <p className="text-white text-2xl mb-4">Volviendo al Lobby...</p>
          <p className="text-yellow-300 text-5xl font-bold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8">
      <h2 className="text-4xl font-bold text-white">🏁 ¡Juego Terminado!</h2>

      <div className="bg-white/10 rounded-2xl p-8 space-y-4">
        <p className="text-white text-2xl mb-4">La palabra secreta era:</p>
        <p className="text-yellow-300 text-5xl font-bold">{room.game_data.secretWord}</p>

        <p className="text-white text-2xl mt-8 mb-4">El impostor era:</p>
        <p className="text-red-400 text-5xl font-bold">{impostor?.name || 'Desconocido'}</p>

        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-purple-200 text-lg">
            ¿Adivinaron quién era el impostor? 🤔
          </p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
      >
        <RotateCcw className="inline mr-2 mb-1" size={24} />
        Volver al Lobby
      </button>
    </div>
  );
}
