import { RotateCcw } from 'lucide-react';

interface Player {
    isImpostor: boolean;
    name: string;
}

interface PlayingStateProps {
    selectedCategory: string;
    timeLeft: number;
    formatTime: (seconds: number) => string;
    playingOrder: Player[];
    isTimerRunning: boolean;
    setIsTimerRunning: (running: boolean) => void;
    onEndGame: () => void;
    onResetGame: () => void;
}

export default function PlayingState({
    selectedCategory,
    timeLeft,
    formatTime,
    playingOrder,
    isTimerRunning,
    setIsTimerRunning,
    onEndGame,
    onResetGame
}: PlayingStateProps) {
    return (
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">🎮 ¡Juego en Curso!</h2>
            <h3 className="text-4xl font-bold text-white">🧪 La categoria es {selectedCategory} 🧪</h3>

            <div className="bg-indigo-500/30 border-2 border-blue-400 rounded-3xl p-4">
                <p className="text-white text-lg mb-2">Tiempo Restante</p>
                <p className={`text-7xl font-bold ${timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-white text-xl font-bold mb-4">📋 Orden de Turnos:</p>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {playingOrder.map((player, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 rounded-lg p-3 border border-white/20"
                        >
                            <span className="text-purple-300 font-semibold">{idx + 1}.</span>
                            <span className="text-white ml-2">{player.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white/10 rounded-2xl px-6 py-4 space-y-4">
                <p className="text-white text-lg">📋 Instrucciones:</p>
                <ul className="text-purple-200 text-left space-y-2">
                    <li>• Los inocentes deben hablar sobre la palabra sin decirla directamente</li>
                    <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
                    <li>• Al final, voten por quién creen que es el impostor</li>
                </ul>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex-1 bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-yellow-600 transition-all"
                >
                    {isTimerRunning ? '⏸️ Pausar' : '▶️ Reanudar'}
                </button>

                <button
                    onClick={onEndGame}
                    className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all"
                >
                    🏁 Terminar
                </button>
            </div>

            <button
                onClick={onResetGame}
                className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
            >
                <RotateCcw className="inline mr-2 mb-1" size={20} />
                Nueva Partida
            </button>
        </div>
    );
}
