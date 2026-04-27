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
        <h2 className="text-2xl sm:text-3xl font-press-start flex items-center justify-center gap-3 text-cyan-400">
          <GamepadDirectional size={34} strokeWidth={3} className="text-pink-500" />
          ¡EN CURSO!
          <Gamepad2 size={34} strokeWidth={3} className="text-pink-500" />
        </h2>
      </header>

      <main className="flex flex-col gap-3 flex-1">
        {/* Timer */}
        {gameData.config.noTimeLimit ? (
          <div className="p-4 bg-slate-900 border-4 border-cyan-800 rounded-none relative flex items-center justify-center gap-2">
            <Infinity size={30} strokeWidth={2} className="text-pink-500" />
            <p className="text-2xl font-vt323 text-white uppercase tracking-widest">Sin límite</p>
          </div>
        ) : (
          <div className="p-4 bg-slate-900 border-4 border-cyan-800 rounded-none relative text-center">
            <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>
            <p className="text-xl font-vt323 text-cyan-400 mb-1 uppercase tracking-widest">Tiempo Restante</p>
            <p className={`text-6xl font-vt323 tabular-nums ${gameData.timer.timeLeft <= 30 ? 'text-pink-500 animate-pulse' : 'text-white'}`}>
              {formatTime(gameData.timer.timeLeft)}
            </p>
          </div>
        )}

        {/* Playing order */}
        <div className="p-4 bg-slate-900 border-4 border-cyan-800 rounded-none relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>
          <p className="flex items-center justify-center gap-2 mb-3 text-xl font-vt323 text-cyan-400 uppercase tracking-widest">
            <ListOrdered size={22} strokeWidth={2} className="text-pink-500" />
            Turnos
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar">
            {gameData.game.playingOrder.map((player, idx) => (
              <div key={idx} className="p-2 border-2 border-slate-700 bg-slate-800 rounded-none text-lg font-vt323">
                <span className="font-bold text-pink-400">[{idx + 1}]</span>
                <strong className="text-white ml-2 uppercase">{player.name}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-900 border-4 border-cyan-800 rounded-none overflow-hidden relative">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full px-4 py-3 text-cyan-400 outline-none hover:bg-slate-800"
          >
            <div className="flex items-center gap-2 font-vt323 text-xl uppercase tracking-widest">
              <BookOpenText size={22} strokeWidth={2} className="text-pink-500" />
              <span>Instrucciones</span>
            </div>
            <ChevronDown size={22} strokeWidth={3} className={`transition-transform duration-300 text-pink-500 ${showInstructions ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-slate-800 ${showInstructions ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <ul className="space-y-2 text-base font-vt323 text-left text-slate-300 px-4 py-3">
              <li>&gt; Inocentes: hablen de la palabra indirectamente</li>
              <li>&gt; Impostor: finge saberla y adivina</li>
              <li>&gt; Al final, voten por el impostor</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-3 pt-1">
        <div className="flex gap-3 font-press-start text-xs sm:text-sm">
          {!gameData.config.noTimeLimit && (
            <button
              onClick={() => setIsTimerRunning(!gameData.timer.isTimerRunning)}
              className="group flex flex-1 items-center justify-center gap-2 py-4 px-4 bg-slate-900 border-4 border-cyan-700 text-cyan-400 transition-all hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none"
            >
              {gameData.timer.isTimerRunning ? <OctagonPause size={18} strokeWidth={3} /> : <Play size={18} strokeWidth={3} />}
              {gameData.timer.isTimerRunning ? 'PAUSAR' : 'REANUDAR'}
            </button>
          )}
          <button
            onClick={onEndGame}
            className="group flex flex-1 items-center justify-center gap-2 py-4 px-4 bg-slate-900 border-4 border-pink-700 text-pink-400 transition-all hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none"
          >
            <Crown size={18} strokeWidth={3} />
            TERMINAR
          </button>
        </div>
      </footer>
    </div>
  );
}
