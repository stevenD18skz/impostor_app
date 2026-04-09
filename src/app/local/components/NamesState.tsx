'use client';

import { useState } from 'react';
import { UserRound, UsersRound, Plus, Trash2 } from 'lucide-react';
import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import './styleLocal.css';

interface NamesStateProps {
  gameData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
  onBack: () => void;
  onContinue: (names: string[]) => void;
}

export default function NamesState({
  gameData,
  handleChange,
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
    <div className="flex flex-col gap-5 flex-1">
      <header className="text-center pt-2">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-black text-(--color-primary)">
          <UsersRound size={34} strokeWidth={3} />
          Jugadores
        </h1>
        <p className="text-sm text-(--color-detail) mt-1">
          Ingresa los nombres (mín. 3, máx. 12)
        </p>
      </header>

      {globalError && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm font-medium">
          ⚠️ {globalError}
        </div>
      )}

      <main className="flex flex-col gap-2.5 flex-1 overflow-y-auto custom-scrollbar max-h-[68vh] pr-1">
        {names.map((name, idx) => (
          <div key={idx} className="bg-white/8 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <label className="flex items-center gap-1 text-(--color-primary) text-sm font-semibold">
                <UserRound size={15} strokeWidth={3} />
                Jugador {idx + 1}
              </label>
              {names.length > 3 && (
                <button
                  type="button"
                  onClick={() => removePlayer(idx)}
                  className="ml-auto p-1 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} strokeWidth={2.5} />
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
              className={`w-full px-3 py-2.5 text-base bg-white/15 text-(--color-secondary) rounded-lg focus:ring-2 focus:outline-none transition-all
                ${errors[idx]
                  ? 'ring-2 ring-red-400/70 focus:ring-red-400'
                  : 'focus:ring-(--color-primary)'
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
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-(--color-detail) hover:border-(--color-primary) hover:text-(--color-primary) transition-all text-sm font-medium"
          >
            <Plus size={18} strokeWidth={2.5} />
            Añadir jugador ({names.length}/12)
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
