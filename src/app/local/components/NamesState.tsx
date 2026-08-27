'use client';

import { useState } from 'react';
import { UserRound, UsersRound, Plus, Trash2 } from 'lucide-react';
import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import type { GameData } from '@/app/types/local';
import './styleLocal.css';

interface NamesStateProps {
  gameData: GameData;
  onBack: () => void;
  onContinue: (names: string[]) => void;
}

export default function NamesState({
  gameData,
  onBack,
  onContinue
}: NamesStateProps) {
  const [names, setNames] = useState<string[]>(
    gameData.game.playerNames.length >= 3
      ? [...gameData.game.playerNames]
      : Array(Math.max(gameData.game.playerNames.length, 3)).fill('').map((_, i: number) => gameData.game.playerNames[i] || '')
  );
  const [errors, setErrors] = useState<string[]>(Array(Math.max(gameData.game.playerNames.length, 3)).fill(''));
  const [globalError, setGlobalError] = useState('');

  const updateName = (idx: number, value: string) => {
    const updated = [...names];
    updated[idx] = value;
    setNames(updated);
    if (errors[idx]) {
      const newErrors = [...errors];
      newErrors[idx] = '';
      setErrors(newErrors);
    }
    if (globalError) setGlobalError('');
  };

  const addPlayer = () => {
    if (names.length >= 12) return;
    setNames([...names, '']);
    setErrors([...errors, '']);
  };

  const removePlayer = (idx: number) => {
    if (names.length <= 3) return;
    setNames(names.filter((_, i) => i !== idx));
    setErrors(errors.filter((_, i) => i !== idx));
  };

  const handleContinue = () => {
    const newErrors: string[] = names.map(n => n.trim() === '' ? 'El nombre no puede estar vacío' : '');

    const seen = new Set<string>();
    const dupErrors = [...newErrors];
    names.forEach((n, i) => {
      const trimmed = n.trim().toLowerCase();
      if (trimmed !== '') {
        if (seen.has(trimmed)) {
          dupErrors[i] = 'Nombre duplicado';
        } else {
          seen.add(trimmed);
        }
      }
    });

    setErrors(dupErrors);

    if (names.length < 3) {
      setGlobalError('Se necesitan al menos 3 jugadores para jugar');
      return;
    }

    if (dupErrors.some(e => e !== '')) return;

    onContinue(names.map(n => n.trim()));
  };

  return (
    <div className="flex flex-col gap-5 flex-1 font-vt323">
      <header className="text-center pt-2">
        <h1 className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-press-start text-cyan-400 tracking-wider">
          <UsersRound size={34} strokeWidth={3} className="text-pink-500" />
          JUGADORES
        </h1>
        <p className="text-xl text-slate-400 mt-2 uppercase">
          [ Ingresa los nombres (mín. 3, máx. 12) ]
        </p>
      </header>

      {globalError && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm font-medium">
          ⚠️ {globalError}
        </div>
      )}

      <main className="flex flex-col gap-2.5 flex-1 overflow-y-auto custom-scrollbar max-h-[65vh] pr-1">
        {names.map((name, idx) => (
          <div key={idx} className="bg-slate-900 border-4 border-cyan-800 p-3 relative group">
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-2 text-cyan-400 text-lg uppercase font-bold tracking-widest">
                <UserRound size={18} strokeWidth={3} className="text-pink-500" />
                Jugador {idx + 1}
              </label>
              {names.length > 3 && (
                <button
                  type="button"
                  onClick={() => removePlayer(idx)}
                  className="ml-auto pr-1 text-pink-700 hover:text-pink-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <input
              name={`playerName-${idx}`}
              id={`playerName-${idx}`}
              type="text"
              placeholder={`Jugador ${idx + 1}`}
              value={name}
              onChange={e => updateName(idx, e.target.value)}
              maxLength={24}
              className={`w-full px-4 py-3 text-xl bg-slate-800 text-white border-2 rounded-none focus:outline-none transition-all placeholder:text-slate-600
                ${errors[idx]
                  ? 'border-pink-500 bg-pink-900/20'
                  : 'border-cyan-700 focus:border-cyan-400 focus:bg-slate-700'
                }`}
            />
            {errors[idx] && (
              <p className="text-red-400 text-xs mt-1">⚠️ {errors[idx]}</p>
            )}
          </div>
        ))}
      </main>

      <footer className="mt-auto pt-4 flex flex-col gap-3">
        {names.length < 12 && (
          <button
            type="button"
            onClick={addPlayer}
            className="flex items-center justify-center gap-3 py-4 border-4 border-dashed border-slate-600 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all text-xs sm:text-sm font-press-start cursor-pointer hover:bg-slate-800"
          >
            <Plus size={20} strokeWidth={3} className="text-pink-500" />
            AÑADIR JUGADOR ({names.length}/12)
          </button>
        )}

        <div className="flex gap-3">
          <ButtonsGeneral type="back" onBack={onBack} onContinue={handleContinue} text="Atrás" />
          <ButtonsGeneral type="continue" onBack={onBack} onContinue={handleContinue} text="Configurar" />
        </div>
      </footer>
    </div>
  );
}
