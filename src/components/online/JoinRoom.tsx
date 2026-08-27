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
    <div className="space-y-5">
      <header className="flex flex-col items-center pt-2">
        <h1 className="text-cyan-400 text-2xl md:text-3xl font-press-start tracking-wider">
          ENTRAR A LA SALA
        </h1>
        <p className="text-cyan-400 text-3xl sm:text-4xl font-press-start tracking-widest mt-4">{code}</p>
      </header>

      <div className="bg-slate-900 border-4 border-cyan-800 p-5 rounded-none relative space-y-4">
        <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
        <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
        <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />

        <div className="relative z-10 space-y-4">
          <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest">
            <UserRound size={20} strokeWidth={3} className="text-pink-500" />
            Tu Nombre
          </label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Ej: Juan"
            className="w-full px-4 py-3 text-2xl font-vt323 bg-slate-800 text-white placeholder-slate-500 border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none transition-colors"
          />

          <button
            onClick={submit}
            className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 border-4 border-pink-700 bg-slate-900 text-pink-400 font-press-start text-xs sm:text-sm hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 cursor-pointer"
          >
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-700 group-hover:bg-pink-400" />
            <DoorOpen size={18} strokeWidth={3} />
            ENTRAR
          </button>

          {message && (
            <div className="bg-pink-600/20 border-2 border-pink-500 text-pink-100 text-lg font-vt323 p-3 rounded-none text-center">
              ⚠️ {message} ⚠️
            </div>
          )}

          <button
            onClick={onBack}
            className="group relative w-full flex items-center justify-center gap-2 py-3 px-6 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 cursor-pointer"
          >
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400" />
            <Home size={18} strokeWidth={3} />
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    </div>
  );
}
