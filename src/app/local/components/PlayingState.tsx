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
        <div className="text-center space-y-6 text-(--color-main)">
            <header>
                <h2 className="text-5xl font-bold flex items-center justify-center gap-2">
                    <GamepadDirectional size={48} strokeWidth={3} />
                    <strong>¡Juego en Curso!</strong>
                    <Gamepad2 size={48} strokeWidth={3} />
                </h2>
            </header>

            <main className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/10">
                    <p className="text-xl font-bold text-(--color-primary) ">Tiempo Restante</p>
                    <p className={`text-7xl font-bold ${gameData.timer.timeLeft <= 30 ? 'text-pink-600 animate-pulse' : 'text-(--color-secondary)'}`}>
                        {formatTime(gameData.timer.timeLeft)}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10">
                    <p className="flex items-center justify-center gap-2 mb-4 text-xl font-bold text-(--color-primary) ">
                        <ListOrdered size={32} strokeWidth={2} />
                        Orden de Turnos
                    </p>

                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto text-xl custom-scrollbar">
                        {gameData.game.playingOrder.map((player, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-lg bg-white/10 text-xl"
                            >
                                <span className="font-semibold text-(--color-primary)">{idx + 1}.</span>
                                <strong className="text-(--color-secondary) ml-2">{player.name}</strong>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/10 text-(--color-primary) overflow-hidden">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="flex items-center justify-between w-full px-6 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpenText size={32} strokeWidth={2}/>
                            <span className="text-2xl font-bold">Instrucciones</span>
                        </div>
                        <ChevronDown size={32} strokeWidth={3} className={` transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all ease-in duration-300 ${showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6">
                            <ul className="space-y-2 text-lg text-left text-(--color-detail)">
                                <li>• Los inocentes deben hablar sobre la palabra indirectamente</li>
                                <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
                                <li>• Al final, voten por quién creen que es el impostor</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>


            <footer className="flex flex-col gap-4">
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
                        <Crown size={32} strokeWidth={3} />
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

            </footer>
        </div>
    );
}
