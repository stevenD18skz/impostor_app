import { useState } from 'react';
import { BookOpenText, Crown, Gamepad2, GamepadDirectional, ListOrdered, MessageSquareText, Pause, Play, RotateCcw, ChevronDown, OctagonPause } from 'lucide-react';
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
        <div className="text-center space-y-4 text-(--color-main)">
            <h2 className="text-5xl font-bold flex items-center justify-center gap-2">
                <GamepadDirectional size={48} strokeWidth={3} />
                <strong>¡Juego en Curso!</strong>
                <Gamepad2 size={48} strokeWidth={3} />
            </h2>

            <div className="bg-indigo-500/30 border-2 border-blue-400 rounded-3xl p-4">
                <p className="text-(--color-primary) font-bold text-xl">Tiempo Restante</p>
                <p className={`text-7xl font-bold ${gameData.timer.timeLeft <= 30 ? 'text-pink-600 animate-pulse' : 'text-(--color-secondary)'}`}>
                    {formatTime(gameData.timer.timeLeft)}
                </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-(--color-primary) text-2xl font-bold mb-4 flex items-center gap-2 justify-center">
                    <ListOrdered size={32} strokeWidth={2} />
                    Orden de Turnos
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto text-xl custom-scrollbar">
                    {gameData.game.playingOrder.map((player, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 rounded-lg p-3 border border-white/20"
                        >
                            <span className="text-(--color-primary) font-semibold">{idx + 1}.</span>
                            <strong className="text-(--color-secondary) ml-2">{player.name}</strong>
                        </div>
                    ))}
                </div>
            </div>

            {/* Acordeón de Instrucciones */}
            <div className="bg-white/10 text-(--color-primary) rounded-2xl overflow-hidden">
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                    <div className="flex items-center gap-2">
                        <BookOpenText size={32} strokeWidth={2} className="" />
                        <span className=" text-2xl font-bold">Instrucciones</span>
                    </div>
                    <ChevronDown
                        size={32}
                        strokeWidth={3}
                        className={` transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`}
                    />
                </button>

                <div
                    className={`overflow-hidden transition-all duration-300 ${showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="px-6 pb-4">
                        <ul className="text-(--color-detail) text-lg text-left space-y-2">
                            <li>• Los inocentes deben hablar sobre la palabra indirectamente</li>
                            <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
                            <li>• Al final, voten por quién creen que es el impostor</li>
                        </ul>
                    </div>
                </div>
            </div>


            <section className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsTimerRunning(!gameData.timer.isTimerRunning)}
                        className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-cyan-600 text-xl text-(--color-secondary) font-bold hover:bg-cyan-700 transition-all duration-300"
                    >
                        {gameData.timer.isTimerRunning ? <OctagonPause size={32} strokeWidth={3} /> : <Play size={32} strokeWidth={3} />}
                        {gameData.timer.isTimerRunning ? 'Pausar' : 'Reanudar'}
                    </button>

                    <button
                        onClick={onEndGame}
                        className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-pink-600 text-xl text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
                    >
                        <Crown size={32} strokeWidth={3}/>
                        Terminar
                    </button>
                </div>

                <button
                    onClick={onResetGame}
                    className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
                >
                    <RotateCcw size={32} strokeWidth={3} />
                    Nueva Partida
                </button>
                
            </section>
        </div>
    );
}
