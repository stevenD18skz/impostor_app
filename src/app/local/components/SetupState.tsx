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
        <h1 className="flex items-center justify-center gap-3 text-cyan-400 text-2xl md:text-3xl font-press-start tracking-wider">
          <HatGlasses size={36} strokeWidth={3} className="text-pink-500" />
          IMPOSTOR
        </h1>
        <p className="flex items-center justify-center gap-2 text-slate-400 text-lg font-vt323 mt-2 uppercase">
          <WifiOff size={18} />
          [ Modo Local - Config ]
        </p>
      </header>

      <main className="flex flex-col gap-4 flex-1">
        <div className="bg-slate-900 border-4 border-cyan-800 p-4 rounded-none relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>

          <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest mb-3 relative z-10">
            <Book size={20} strokeWidth={3} className="text-pink-500" />
            Categoría
          </label>
          <select
            name="selectedCategory"
            value={config.selectedCategory}
            onChange={handleChange}
            className="w-full px-4 py-3 text-2xl font-vt323 cursor-pointer bg-slate-800 text-white border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none focus:bg-slate-700 transition-colors relative z-10"
          >
            {Object.keys(categorias).map(key => (
              <option key={key} value={key} className="bg-slate-800 text-xl">
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

        <div className="bg-slate-900 border-4 border-cyan-800 p-4 flex flex-col gap-4 rounded-none relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600"></div>

          <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest relative z-10">
            <Clock size={20} strokeWidth={3} className="text-pink-500" />
            Tiempo del Juego
          </label>

          {/* Toggle sin límite */}
          <label className="flex items-center justify-center gap-3 cursor-pointer group relative z-10">
            <div className="relative">
              <input
                type="checkbox"
                name="noTimeLimit"
                id="noTimeLimit"
                checked={config.noTimeLimit}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-12 h-6 border-2 transition-all duration-300 rounded-none ${config.noTimeLimit ? 'bg-pink-600 border-pink-400' : 'bg-slate-800 border-slate-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform duration-300 rounded-none ${config.noTimeLimit ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <span className="flex items-center gap-2 text-white font-vt323 text-xl uppercase">
              <Infinity size={22} strokeWidth={3} className="text-cyan-400" />
              Sin límite
            </span>
          </label>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out relative z-10 ${config.noTimeLimit ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'}`}>
            <div className="number-input-wrapper pt-2">
              <button
                type="button"
                onClick={() => handleDecrement('timeLimit', 60, 30)}
                disabled={config.timeLimit <= 60 || config.noTimeLimit}
                className="number-input-btn"
              >
                −
              </button>
              <div className="flex-1 text-center bg-slate-800 border-2 border-cyan-700 mx-2 py-2">
                <p className="text-white text-4xl font-vt323">
                  {Math.floor(config.timeLimit / 60)}:{String(config.timeLimit % 60).padStart(2, '0')}
                </p>
                <p className="text-cyan-400 text-sm font-vt323 uppercase tracking-widest">min : seg</p>
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
