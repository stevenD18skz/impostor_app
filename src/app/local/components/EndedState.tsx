import { RotateCcw } from 'lucide-react';

interface Player {
    isImpostor: boolean;
    name: string;
}

interface EndedStateProps {
    secretWord: string;
    players: Player[];
    onResetGame: () => void;
}

export default function EndedState({
    secretWord,
    players,
    onResetGame
}: EndedStateProps) {
    return (
        <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-white">🏁 ¡Juego Terminado!</h2>

            <div className="bg-white/10 rounded-2xl p-8 space-y-4">
                <p className="text-white text-2xl mb-4">La palabra secreta era:</p>
                <p className="text-yellow-300 text-5xl font-bold">{secretWord}</p>

                <p className="text-white text-2xl mt-8 mb-4">El impostor era:</p>
                <p className="text-red-400 text-5xl font-bold">{players.find(p => p.isImpostor)?.name}</p>


                <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-purple-200 text-lg">
                        ¿Adivinaron quién era el impostor? 🤔
                    </p>
                </div>
            </div>

            <button
                onClick={onResetGame}
                className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
            >
                <RotateCcw className="inline mr-2 mb-1" size={24} />
                Nueva Partida
            </button>
        </div>
    );
}
