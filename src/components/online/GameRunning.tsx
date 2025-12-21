import { useState, useEffect } from 'react';
import { Crown, Gamepad2, GamepadDirectional, ListOrdered, BookOpenText, ChevronDown } from 'lucide-react';

interface GameRunningProps {
  room: any;
  onEndGame: () => void;
}

export default function GameRunning({ room, onEndGame }: GameRunningProps) {
  // Local timer for smooth countdown, synced with server occasionally if needed
  // For simplicity, we'll just use the server time or a local countdown that starts when we enter
  const [timeLeft, setTimeLeft] = useState(room.game_data.timeLeft);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Simple countdown
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-(--color-main)">
      <header>
        <h2 className="text-5xl font-bold flex items-center justify-center gap-2">
          <GamepadDirectional size={48} strokeWidth={3} />
          <strong>¡Juego en Curso!</strong>
          <Gamepad2 size={48} strokeWidth={3} />
        </h2>
      </header>

      <main className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/10">
          <p className="text-xl font-bold text-(--color-primary)">Tiempo Restante</p>
          <p className={`text-7xl font-bold ${timeLeft <= 30 ? 'text-pink-600 animate-pulse' : 'text-(--color-secondary)'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10">
          <p className="flex items-center justify-center gap-2 mb-4 text-xl font-bold text-(--color-primary)">
            <ListOrdered size={32} strokeWidth={2} />
            Orden de Turnos
          </p>

          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto text-xl custom-scrollbar">
            {room.game_data.playingOrder.map((player: any, idx: number) => (
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
              <BookOpenText size={32} strokeWidth={2} />
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

      <footer className="flex gap-4">
        <button
          onClick={onEndGame}
          className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-pink-600 text-xl text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
        >
          <Crown size={32} strokeWidth={3} />
          Terminar
        </button>
      </footer>
    </div>
  );
}
