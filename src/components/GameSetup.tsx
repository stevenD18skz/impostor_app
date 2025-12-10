import { useState } from 'react';
import { z } from 'zod';

// Esquemas de validación con Zod
const playerNameSchema = z.string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(20, 'El nombre no puede tener más de 20 caracteres')
  .trim()
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios');

const roomCodeSchema = z.string()
  .length(6, 'El código de sala debe tener exactamente 6 caracteres')
  .regex(/^[A-Z0-9]+$/, 'El código solo puede contener letras mayúsculas y números');

interface GameSetupProps {
  handleJoin: (roomCode: string, playerName: string, roomData: any) => void;
  handleLocalPlay: () => void;
}

export default function GameSetup({ handleJoin, handleLocalPlay }: GameSetupProps) {
  // INPUTS
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // STATE
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');



  const createRoom = async () => {
    setError('');
    setIsJoining(true);

    try {
      // Validar el nombre del jugador con Zod
      playerNameSchema.parse(playerName);

      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', playerName: playerName.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      handleJoin(data.roomCode, data.room, data.myPlayer);
    } catch (err: any) {
      // Manejar errores de validación de Zod
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsJoining(false);
    }
  };



  const joinRoom = async () => {
    setError('');
    setIsJoining(true);

    try {
      // Validar el nombre del jugador con Zod
      playerNameSchema.parse(playerName);
      // Validar el código de sala con Zod
      roomCodeSchema.parse(roomCode.toUpperCase());

      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', roomCode: roomCode.toUpperCase(), playerName: playerName.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      handleJoin(data.roomCode, data.room, data.myPlayer);
    } catch (err: any) {
      // Manejar errores de validación de Zod
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsJoining(false);
    }
  };



  return (
    <div className="text-center space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-white mb-2">🕵️ EL IMPOSTOR</h1>
        <p className="text-purple-200 text-lg">¿Quién no conoce la palabra secreta?</p>
      </div>

      <div className="bg-white/10 rounded-2xl p-8 backdrop-blur space-y-6">
        <div>
          <label className="block text-white text-lg font-semibold mb-3 text-left">
            👤 Tu Nombre
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ej: Juan"
            className="w-full px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white mb-4 font-semibold">Crear Nueva Sala</p>
          <button
            onClick={createRoom}
            disabled={isJoining}
            className="w-full bg-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50"
          >
            {isJoining ? 'Uniendote a la sala...' : '✨ Crear Sala'}
          </button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white mb-4 font-semibold">O Unirse a una Sala</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="flex-1 px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none uppercase"
            />
            <button
              onClick={joinRoom}
              disabled={isJoining}
              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
            >
              {isJoining ? 'Uniendo...' : 'Entrar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <p className="text-white mb-4 font-semibold">O Jugar Local</p>
          <button
            onClick={handleLocalPlay}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-all shadow-lg"
          >
            📱 Jugar Local (Un solo dispositivo)
          </button>
        </div>
      </div>
    </div>
  );
}
