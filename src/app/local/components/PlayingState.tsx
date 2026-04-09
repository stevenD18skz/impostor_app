import { useState } from 'react';
import { BookOpenText, Crown, Gamepad2, GamepadDirectional, Infinity, ListOrdered, OctagonPause, Play, RotateCcw, ChevronDown } from 'lucide-react';
import { GameData } from '@/app/types/local';

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
    <div className="flex flex-col gap-4 text-(--color-main) flex-1">
      <header className="text-center pt-1">
        <h2 className="text-3xl sm:text-4xl font-black flex items-center justify-center gap-2">
          <GamepadDirectional size={34} strokeWidth={3} />
          ¡Juego en Curso!
          <Gamepad2 size={34} strokeWidth={3} />
        </h2>
      </header>

      <main className="flex flex-col gap-3 flex-1">
        {/* Timer */}
        {gameData.config.noTimeLimit ? (
          <div className="p-4 rounded-2xl bg-white/8 flex items-center justify-center gap-2">
            <Infinity size={30} strokeWidth={2} className="text-(--color-primary)" />
            <p className="text-xl font-bold text-(--color-secondary)">Sin límite de tiempo</p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/8 text-center">
            <p className="text-base font-semibold text-(--color-primary) mb-1">Tiempo Restante</p>
            <p className={`text-6xl font-black tabular-nums ${gameData.timer.timeLeft <= 30 ? 'text-pink-500 animate-pulse' : 'text-(--color-secondary)'}`}>
              {formatTime(gameData.timer.timeLeft)}
            </p>
          </div>
        )}

        {/* Playing order */}
        <div className="p-4 rounded-2xl bg-white/8">
          <p className="flex items-center justify-center gap-2 mb-3 text-base font-semibold text-(--color-primary)">
            <ListOrdered size={22} strokeWidth={2} />
            Orden de Turnos
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar">
            {gameData.game.playingOrder.map((player, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/8 text-base">
                <span className="font-semibold text-(--color-primary)">{idx + 1}.</span>
                <strong className="text-(--color-secondary) ml-1.5">{player.name}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl bg-white/8 overflow-hidden">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full px-4 py-3 text-(--color-primary)"
          >
            <div className="flex items-center gap-2">
              <BookOpenText size={22} strokeWidth={2} />
              <span className="text-base font-semibold">Instrucciones</span>
            </div>
            <ChevronDown size={22} strokeWidth={3} className={`transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${showInstructions ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <ul className="space-y-2 text-sm text-left text-(--color-detail) px-4 pb-3">
              <li>• Los inocentes deben hablar sobre la palabra indirectamente</li>
              <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
              <li>• Al final, voten por quién creen que es el impostor</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-3 pt-1">
        <div className="flex gap-3">
          {!gameData.config.noTimeLimit && (
            <button
              onClick={() => setIsTimerRunning(!gameData.timer.isTimerRunning)}
              className="flex flex-1 items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl bg-cyan-700 text-base text-white font-bold active:scale-95 transition-transform"
            >
              {gameData.timer.isTimerRunning ? <OctagonPause size={22} strokeWidth={3} /> : <Play size={22} strokeWidth={3} />}
              {gameData.timer.isTimerRunning ? 'Pausar' : 'Reanudar'}
            </button>
          )}
          <button
            onClick={onEndGame}
            className="flex flex-1 items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl bg-pink-700 text-base text-white font-bold active:scale-95 transition-transform"
          >
            <Crown size={22} strokeWidth={3} />
            Terminar
          </button>
        </div>
      </footer>
    </div>
  );
}
