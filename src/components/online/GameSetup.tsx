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

/** El marco arcade con esquinas decorativas. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border-4 border-cyan-800 p-5 rounded-none relative">
      <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-0.5 bg-slate-700" />
      <span className="text-pink-500 font-vt323 text-lg">◇</span>
      <div className="flex-1 h-0.5 bg-slate-700" />
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
    <div className="space-y-5">
      <header className="flex flex-col items-center pt-2">
        <h1 className="flex items-center justify-center gap-3 text-cyan-400 text-2xl md:text-3xl font-press-start tracking-wider">
          <HatGlasses size={36} strokeWidth={3} className="text-pink-500" />
          IMPOSTOR
        </h1>
        <p className="flex items-center justify-center gap-2 text-slate-400 text-lg font-vt323 mt-2 uppercase tracking-widest">
          <Wifi size={18} className="text-cyan-400" />
          [ Modo Online ]
        </p>
      </header>

      <Panel>
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest mb-3">
              <UserRound size={20} strokeWidth={3} className="text-pink-500" />
              Tu Nombre
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Juan"
              maxLength={20}
              className="w-full px-4 py-3 text-2xl font-vt323 bg-slate-800 text-white placeholder-slate-500 border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && !isBusy && joinRoom()}
                placeholder="CÓDIGO"
                maxLength={CODE_LENGTH}
                className="flex-1 min-w-0 px-4 py-3 text-2xl font-vt323 bg-slate-800 text-white placeholder-slate-500 border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none transition-colors uppercase tracking-widest"
              />
              <button
                onClick={joinRoom}
                disabled={isBusy}
                className="group relative flex items-center justify-center gap-2 py-3 px-5 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
              >
                <DoorOpen size={18} strokeWidth={3} />
                {pending === 'join' ? '...' : 'ENTRAR'}
              </button>
            </div>
          </div>

          <Separator />

          <div>
            <button
              onClick={createRoom}
              disabled={isBusy}
              className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
            >
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400" />
              <PencilRuler size={18} strokeWidth={3} />
              {pending === 'create' ? 'CREANDO...' : 'CREAR SALA'}
            </button>
          </div>

          {error && (
            <div className="bg-pink-600/20 border-2 border-pink-500 text-pink-100 text-lg font-vt323 p-3 rounded-none text-center">
              ⚠️ {error} ⚠️
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
