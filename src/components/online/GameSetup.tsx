import { useState } from 'react';
import { z } from 'zod';
import { HatGlasses, Wifi, UserRound, DoorOpen, WifiOff, PencilRuler } from 'lucide-react';

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

function Separator() {
  return (
    <div className='flex items-center gap-3 py-2 m-0 p-0'>
      <div className='flex-1 h-px bg-white/20 m-0 p-0' />
      <span className='text-(--color-detail) text-sm font-semibold m-0 p-0'>○</span>
      <div className='flex-1 h-px bg-white/20 m-0 p-0' />
    </div>
  )
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
    <div className="space-y-6">
      <header className='flex flex-col items-center'>
        <h1 className="flex items-center justify-center gap-1 text-(--color-main) text-5xl font-bold">
          <HatGlasses size={64} />
          EL IMPOSTOR
        </h1>
        <p className="flex items-center justify-center gap-1 text-(--color-detail) text-lg">
          <Wifi size={24} />
          Modo Online
        </p>
      </header>

      <main className="bg-white/10 rounded-2xl p-6 backdrop-blur space-y-4">
        <div>
          <label className="flex items-center justify-center gap-1 text-(--color-primary) text-2xl font-semibold mb-3">
            <UserRound size={24} strokeWidth={3} />
            Tu Nombre
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ej: Juan"
            className="w-full px-4 py-3 text-xl bg-white/20 text-(--color-secondary) placeholder-purple-300 rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none"
          />
        </div>

        <Separator />

        <div className="pt-4 text-center">
          <div className="flex gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="flex-1 px-4 py-3 text-xl bg-white/20 text-(--color-secondary) placeholder-purple-300 rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none uppercase"
            />
            <button
              onClick={joinRoom}
              disabled={isJoining}
              className="flex items-center justify-center gap-1 py-3 px-6 rounded-xl text-xl bg-cyan-600 text-(--color-secondary) font-bold hover:bg-cyan-700 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              <DoorOpen size={24} strokeWidth={3} />
              {isJoining ? 'Uniendo...' : 'Entrar'}
            </button>
          </div>
        </div>

        <Separator />

        <div className="pt-4 text-center">
          <button
            onClick={createRoom}
            disabled={isJoining}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            <PencilRuler size={24} strokeWidth={3} />
            {isJoining ? 'Creando sala...' : 'Crear Sala'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-100 text-lg p-4 rounded-xl text-center">
            ⚠️ {error} ⚠️
          </div>
        )}

        <Separator />

        <div className="pt-4 text-center">
          <button
            onClick={handleLocalPlay}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 w-full rounded-xl text-xl bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300 shadow-lg"
          >
            <WifiOff size={24} strokeWidth={3} />
            Jugar Local (Un solo dispositivo)
          </button>
        </div>
      </main>
    </div>
  );
}
