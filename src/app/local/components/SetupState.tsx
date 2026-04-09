import { Book, Clock, Drama, HatGlasses, Infinity, WifiOff } from 'lucide-react';
import { categorias } from '@/lib/data';
import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import NumberInput from '@/components/ui/NumberInput';
import './styleLocal.css';

interface SetupStateProps {
  config: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
  handleIncrement: (field: string, max: number, step?: number) => void;
  handleDecrement: (field: string, min: number, step?: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function SetupState({
  config,
  handleChange,
  handleIncrement,
  handleDecrement,
  onBack,
  onContinue
}: SetupStateProps) {
  return (
    <div className="flex flex-col gap-5 flex-1">
      <header className="flex flex-col items-center pt-2">
        <h1 className="flex items-center justify-center gap-1.5 text-(--color-main) text-4xl font-black tracking-tight">
          <HatGlasses size={48} />
          EL IMPOSTOR
        </h1>
        <p className="flex items-center justify-center gap-1 text-(--color-detail) text-sm mt-1">
          <WifiOff size={15} />
          Modo Local — Configuración
        </p>
      </header>

      <main className="flex flex-col gap-4 flex-1">
        {/* Categoría */}
        <div className="bg-white/8 rounded-2xl p-4">
          <label className="flex items-center justify-center gap-1.5 text-(--color-primary) text-lg font-semibold mb-3">
            <Book size={20} strokeWidth={3} />
            Categoría
          </label>
          <select
            name="selectedCategory"
            value={config.selectedCategory}
            onChange={handleChange}
            className="w-full px-4 py-3 text-lg cursor-pointer bg-white/15 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:outline-none"
          >
            {Object.keys(categorias).map(key => (
              <option key={key} value={key} className="bg-slate-800">
                {/* @ts-ignore */}
                {categorias[key].nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Impostores */}
        <NumberInput
          label="Número de Impostores"
          icon={Drama}
          name="numImpostors"
          value={config.numImpostors}
          min={1}
          max={Math.floor(config.numPlayers / 2)}
          onChange={handleChange}
          onIncrement={() => handleIncrement('numImpostors', Math.floor(config.numPlayers / 2))}
          onDecrement={() => handleDecrement('numImpostors', 1)}
        />

        {/* Tiempo */}
        <div className="bg-white/8 rounded-2xl p-4 flex flex-col gap-4">
          <label className="flex items-center justify-center gap-1.5 text-(--color-primary) text-lg font-semibold">
            <Clock size={20} strokeWidth={3} />
            Tiempo del Juego
          </label>

          {/* Toggle sin límite */}
          <label className="flex items-center justify-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="noTimeLimit"
                id="noTimeLimit"
                checked={config.noTimeLimit}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300 ${config.noTimeLimit ? 'bg-purple-500' : 'bg-white/20'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${config.noTimeLimit ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-(--color-secondary) text-base font-medium">
              <Infinity size={18} strokeWidth={2.5} />
              Sin límite de tiempo
            </span>
          </label>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${config.noTimeLimit ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'}`}>
            <div className="number-input-wrapper pt-2">
              <button
                type="button"
                onClick={() => handleDecrement('timeLimit', 60, 30)}
                disabled={config.timeLimit <= 60 || config.noTimeLimit}
                className="number-input-btn"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <p className="text-(--color-secondary) text-3xl font-bold">
                  {Math.floor(config.timeLimit / 60)}:{String(config.timeLimit % 60).padStart(2, '0')}
                </p>
                <p className="text-(--color-detail) text-xs">min : seg</p>
              </div>
              <button
                type="button"
                onClick={() => handleIncrement('timeLimit', 600, 30)}
                disabled={config.timeLimit >= 600 || config.noTimeLimit}
                className="number-input-btn"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex gap-3 pt-2">
        <ButtonsGeneral type="back" onBack={onBack} onContinue={onContinue} text="Jugadores" />
        <ButtonsGeneral type="continue" onBack={onBack} onContinue={onContinue} text="Jugar" />
      </footer>
    </div>
  );
}
