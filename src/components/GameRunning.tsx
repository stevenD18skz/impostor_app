import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface GameRunningProps {
  room: any;
  onEndGame: () => void;
}

export default function GameRunning({ room, onEndGame }: GameRunningProps) {
  // Local timer for smooth countdown, synced with server occasionally if needed
  // For simplicity, we'll just use the server time or a local countdown that starts when we enter
  const [timeLeft, setTimeLeft] = useState(room.gameData.timeLeft);
  
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
    <div className="text-center space-y-8">
      <h2 className="text-4xl font-bold text-white">🎮 ¡Juego en Curso!</h2>
      <h3 className="text-2xl font-bold text-white">Categoría: {room.settings.category}</h3>
      
      <div className="bg-linear-gradient-to-br from-indigo-200/30 via-blue-200/30 to-indigo-200/30 border-2 border-blue-400 rounded-3xl p-12">
        <p className="text-white text-lg mb-4">Tiempo Restante</p>
        <p className={`text-7xl font-bold ${timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {formatTime(timeLeft)}
        </p>
      </div>

      <div className="bg-white/10 rounded-2xl p-6 space-y-4">
        <p className="text-white text-xl font-bold mb-4">📋 Orden de Turnos:</p>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {room.gameData.playingOrder.map((player: any, idx: number) => (
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

       
        <div className="flex gap-4">
          <button
            onClick={onEndGame}
            className="w-full bg-green-300 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600 transition-all"
          >
            🏁 Terminar Partida
          </button>
        </div>
      
    </div>
  );
}
