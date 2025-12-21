import { useState } from 'react';
import { BookOpenText, Crown, Gamepad2, GamepadDirectional, ListOrdered, MessageSquareText, Pause, Play, RotateCcw, ChevronDown } from 'lucide-react';
import { GameData } from '@/app/local/types/local';

interface PlayingStateProps {
    gameData: GameData;
    formatTime: (seconds: number) => string;
    setIsTimerRunning: (running: boolean) => void;
    onEndGame: () => void;
    onResetGame: () => void;
}

export default function PlayingState({
    gameData,
    formatTime,
    setIsTimerRunning,
    onEndGame,
    onResetGame
}: PlayingStateProps) {
    const [showInstructions, setShowInstructions] = useState(false);

    return (
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                <GamepadDirectional size={42} className='text-rose-600' />
                <strong>¡Juego en Curso!</strong>
                <Gamepad2 size={42} className='text-rose-600' />
            </h2>

            <div className="bg-indigo-500/30 border-2 border-blue-400 rounded-3xl p-4">
                <p className="text-white text-xl mb-2">Tiempo Restante</p>
                <p className={`text-7xl font-bold ${gameData.timer.timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(gameData.timer.timeLeft)}
                </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-white text-2xl font-bold mb-4 flex items-center gap-2 justify-center">
                    <ListOrdered size={32} strokeWidth={2} />
                    Orden de Turnos
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto text-lg">
                    {gameData.game.playingOrder.map((player, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 rounded-lg p-3 border border-white/20"
                        >
                            <span className="text-purple-400 font-semibold">{idx + 1}.</span>
                            <strong className="text-slate-300 ml-2">{player.name}</strong>
                        </div>
                    ))}
                </div>
            </div>

            {/* Acordeón de Instrucciones */}
            <div className="bg-white/10 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                    <div className="flex items-center gap-2">
                        <BookOpenText size={32} strokeWidth={2} className="text-white" />
                        <span className="text-white text-2xl font-bold">Instrucciones</span>
                    </div>
                    <ChevronDown
                        size={32}
                        strokeWidth={3}
                        className={`text-white transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`}
                    />
                </button>

                <div
                    className={`overflow-hidden transition-all duration-300 ${showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="px-6 pb-4">
                        <ul className="text-white text-lg text-left space-y-2">
                            <li>• Los inocentes deben hablar sobre la palabra sin decirla directamente</li>
                            <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
                            <li>• Al final, voten por quién creen que es el impostor</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setIsTimerRunning(!gameData.timer.isTimerRunning)}
                    className="flex-1 text-xl bg-amber-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-amber-600 transition-all flex items-center gap-1 justify-center"
                >
                    {gameData.timer.isTimerRunning ? <Pause size={32} strokeWidth={3} /> : <Play size={32} strokeWidth={3} />}
                    {gameData.timer.isTimerRunning ? 'Pausar' : 'Reanudar'}
                </button>

                <button
                    onClick={onEndGame}
                    className="flex-1 text-xl bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all flex items-center gap-1 justify-center"
                >
                    <Crown size={32} strokeWidth={3} className='text-amber-400' />
                    Terminar
                </button>
            </div>

            <button
                onClick={onResetGame}
                className="w-full text-xl bg-gray-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-all"
            >
                <RotateCcw className="inline mr-2 mb-1" size={32} strokeWidth={3} />
                Nueva Partida
            </button>
        </div>
    );
}
