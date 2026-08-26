'use client';

import { useState } from 'react';
import { z } from 'zod';
import { HatGlasses, Wifi, UserRound, DoorOpen, PencilRuler } from 'lucide-react';

import { CODE_LENGTH } from '@/lib/room';

// Se valida con Zod y se comparte con la pantalla de entrada por enlace, para
// que las dos puertas de la sala pidan exactamente lo mismo.
export const playerNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(20, 'El nombre no puede tener más de 20 caracteres')
  // Se permiten números: "Juan2" es un nombre perfectamente normal en una sala.
  .regex(/^[\p{L}\p{N} _.-]+$/u, 'El nombre solo puede tener letras, números y espacios');

export const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(CODE_LENGTH, `El código de sala debe tener ${CODE_LENGTH} caracteres`)
  .regex(/^[A-Z0-9]+$/, 'El código solo puede tener letras y números');

interface GameSetupProps {
  onCreate: (playerName: string) => Promise<void>;
  onJoin: (roomCode: string, playerName: string) => Promise<void>;
}

function Separator() {
  return (
    <div className="flex items-center gap-3 py-2 m-0 p-0">
      <div className="flex-1 h-px bg-white/20 m-0 p-0" />
      <span className="text-(--color-detail) text-sm font-semibold m-0 p-0">○</span>
      <div className="flex-1 h-px bg-white/20 m-0 p-0" />
    </div>
  );
}

export default function GameSetup({ onCreate, onJoin }: GameSetupProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const [pending, setPending] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState('');

  // Crear y entrar hacen lo mismo alrededor: validar, mostrar el estado de
  // espera y traducir el fallo a un mensaje. Solo cambia el trámite del medio.
  const run = async (kind: 'create' | 'join', task: () => Promise<void>) => {
    setError('');
    setPending(kind);
    try {
      await task();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? 'Datos inválidos');
      else setError(err instanceof Error ? err.message : 'Algo salió mal');
      setPending(null);
    }
    // En el camino feliz no se apaga el estado de espera: la navegación se lleva
    // la pantalla y tocar los botones otra vez no debería ser opción.
  };

  const createRoom = () =>
    run('create', async () => {
      const name = playerNameSchema.parse(playerName);
      await onCreate(name);
    });

  const joinRoom = () =>
    run('join', async () => {
      const name = playerNameSchema.parse(playerName);
      const code = roomCodeSchema.parse(roomCode);
      await onJoin(code, name);
    });

  const isBusy = pending !== null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center">
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
            maxLength={20}
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
              onKeyDown={(e) => e.key === 'Enter' && !isBusy && joinRoom()}
              placeholder="CÓDIGO"
              maxLength={CODE_LENGTH}
              className="flex-1 min-w-0 px-4 py-3 text-xl bg-white/20 text-(--color-secondary) placeholder-purple-300 rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none uppercase tracking-widest"
            />
            <button
              onClick={joinRoom}
              disabled={isBusy}
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
            disabled={isBusy}
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
