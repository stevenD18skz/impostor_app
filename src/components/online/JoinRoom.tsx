'use client';

import { useState } from 'react';
import { DoorOpen, Home, UserRound } from 'lucide-react';

import { playerNameSchema } from './GameSetup';

interface JoinRoomProps {
  code: string;
  /** Lo que dijo la sala la última vez: nombre repetido, sala cerrada, etc. */
  error: string | null;
  onEnter: (name: string) => void;
  onBack: () => void;
}

/**
 * Lo que ve quien abre el enlace de una sala sin haber pasado por el menú.
 * Es la mitad del sentido de tener el código en la URL: se comparte el enlace y
 * el otro solo pone su nombre.
 */
export default function JoinRoom({ code, error, onEnter, onBack }: JoinRoomProps) {
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');

  const submit = () => {
    const parsed = playerNameSchema.safeParse(name);
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? 'Nombre inválido');
      return;
    }
    setLocalError('');
    onEnter(parsed.data);
  };

  const message = localError || error;

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center">
        <h1 className="text-(--color-main) text-4xl font-bold">Entrar a la sala</h1>
        <p className="text-cyan-400 text-5xl font-press-start tracking-widest mt-4">{code}</p>
      </header>

      <main className="bg-white/10 rounded-2xl p-6 backdrop-blur space-y-4">
        <label className="flex items-center justify-center gap-1 text-(--color-primary) text-2xl font-semibold">
          <UserRound size={24} strokeWidth={3} />
          Tu Nombre
        </label>
        <input
          type="text"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ej: Juan"
          className="w-full px-4 py-3 text-xl bg-white/20 text-(--color-secondary) placeholder-purple-300 rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:outline-none"
        />

        <button
          onClick={submit}
          className="flex items-center justify-center gap-1 py-4 px-8 w-full rounded-xl text-xl bg-pink-600 text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
        >
          <DoorOpen size={24} strokeWidth={3} />
          Entrar
        </button>

        {message && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-100 text-lg p-4 rounded-xl text-center">
            ⚠️ {message} ⚠️
          </div>
        )}

        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1 py-3 px-6 w-full rounded-xl text-lg bg-slate-600 text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
        >
          <Home size={20} strokeWidth={3} />
          Volver al menú
        </button>
      </main>
    </div>
  );
}
