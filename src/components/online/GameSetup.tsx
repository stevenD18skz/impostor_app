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
  onCreate: (playerName: string) => Promise<void>;
  onJoin: (roomCode: string, playerName: string) => Promise<void>;
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

export default function GameSetup({ onCreate, onJoin }: GameSetupProps) {
  // INPUTS
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // STATE
  const [pending, setPending] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState('');

  // Crear y entrar hacen lo mismo alrededor: validar, mostrar el estado de
  // espera y traducir el fallo a un mensaje. Solo cambia el trámite del medio.
  const run = async (kind: 'create' | 'join', task: () => Promise<void>) => {
    setError('');
    setPending(kind);
    try {
      await task();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err?.message || 'Algo salió mal');
      }
      setPending(null);
    }
    // En el camino feliz no se apaga el estado de espera: la pantalla entera se
    // reemplaza por el lobby y tocar los botones otra vez no debería ser opción.
  };

  const createRoom = () =>
    run('create', async () => {
      playerNameSchema.parse(playerName);
      await onCreate(playerName.trim());
    });

  const joinRoom = () =>
    run('join', async () => {
      playerNameSchema.parse(playerName);
      roomCodeSchema.parse(roomCode.toUpperCase());
      await onJoin(roomCode.toUpperCase(), playerName.trim());
    });

  const isJoining = pending !== null;



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
              {pending === 'join' ? 'Uniendo...' : 'Entrar'}
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
            {pending === 'create' ? 'Creando sala...' : 'Crear Sala'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-100 text-lg p-4 rounded-xl text-center">
            ⚠️ {error} ⚠️
          </div>
        )}
      </main>
    </div>
  );
}
