'use client';

import { useState, useSyncExternalStore } from 'react';
import { Book, BookPlus, Drama, HatGlasses, ListOrdered, RotateCw, Tornado, WifiOff } from 'lucide-react';

import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import NumberInput from '@/components/ui/NumberInput';
import CategoryEditor from '@/components/CategoryEditor';
import {
  builtInCategories,
  getCategoriesServerSnapshot,
  getCategoriesSnapshot,
  resolveCategory,
  subscribeCategories,
  type CategoryWords,
} from '@/lib/categories';
import type { OrderMode } from '@/lib/room';
import type { FieldChange, GameData, NumericConfigField } from '@/app/types/local';
import './styleLocal.css';

type Config = GameData['config'];

interface SetupStateProps {
  config: Config;
  handleChange: (e: FieldChange) => void;
  handleIncrement: (field: NumericConfigField, max: number, step?: number) => void;
  handleDecrement: (field: NumericConfigField, min: number, step?: number) => void;
  /** Para los ajustes que no son un `<input name=...>`. */
  updateConfig: (patch: Partial<Config>) => void;
  onBack: () => void;
  onContinue: () => void;
}

/** El marco arcade que llevan todas las tarjetas de esta pantalla. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border-4 border-cyan-800 p-4 rounded-none relative">
      <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function PanelLabel({ icon: Icon, children }: { icon: typeof Book; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-center gap-2 text-cyan-400 text-lg font-bold uppercase tracking-widest mb-3">
      <Icon size={20} strokeWidth={3} className="text-pink-500" />
      {children}
    </label>
  );
}

const ORDER_OPTIONS: { value: OrderMode; label: string; icon: typeof Book }[] = [
  { value: 'lista', label: 'Lista', icon: ListOrdered },
  { value: 'circulo', label: 'En círculo', icon: RotateCw },
];

const ORDER_HINT: Record<OrderMode, string> = {
  lista: 'Un turno numerado para cada quien.',
  circulo: 'Se sortea quién empieza y hacia qué lado sigue.',
};

const CUSTOM_PREFIX = 'custom:';

export default function SetupState({
  config,
  handleChange,
  handleIncrement,
  handleDecrement,
  updateConfig,
  onBack,
  onContinue
}: SetupStateProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  /** Las propias viven en localStorage; guardarlas avisa a esta lista sola. */
  const mine = useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    getCategoriesServerSnapshot,
  );

  const selected = { category: config.selectedCategory, custom: config.custom };
  const wordCount = resolveCategory(selected)?.palabras.length ?? 0;
  const mineInPlay = config.custom ? mine.find((c) => c.nombre === config.custom?.nombre) : undefined;
  const selectValue = config.custom
    ? `${CUSTOM_PREFIX}${mineInPlay?.id ?? ''}`
    : config.selectedCategory;

  const pickCategory = (value: string) => {
    if (!value.startsWith(CUSTOM_PREFIX)) {
      updateConfig({ selectedCategory: value, custom: null });
      return;
    }
    const chosen = mine.find((c) => c.id === value.slice(CUSTOM_PREFIX.length));
    if (chosen) updateConfig({ custom: { nombre: chosen.nombre, palabras: chosen.palabras } });
  };

  const useCategory = (words: CategoryWords) => updateConfig({ custom: words });

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
        {/* Categoría */}
        <Panel>
          <PanelLabel icon={Book}>Categoría</PanelLabel>
          <select
            name="selectedCategory"
            value={selectValue}
            onChange={(e) => pickCategory(e.target.value)}
            className="w-full px-4 py-3 text-2xl font-vt323 cursor-pointer bg-slate-800 text-white border-2 border-cyan-700 rounded-none focus:border-cyan-400 focus:outline-none focus:bg-slate-700 transition-colors"
          >
            {mine.length > 0 && (
              <optgroup label="Mías">
                {mine.map((cat) => (
                  <option key={cat.id} value={`${CUSTOM_PREFIX}${cat.id}`} className="bg-slate-800 text-xl">
                    {cat.nombre}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="De siempre">
              {builtInCategories().map((cat) => (
                <option key={cat.key} value={cat.key} className="bg-slate-800 text-xl">
                  {cat.nombre}
                </option>
              ))}
            </optgroup>
          </select>

          <div className="flex items-center justify-between gap-3 mt-3">
            <span className="text-slate-400 text-lg font-vt323">{wordCount} palabras</span>
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="flex items-center gap-2 px-3 py-2 border-2 border-cyan-700 bg-slate-800 text-cyan-400 text-lg font-vt323 uppercase tracking-widest hover:border-cyan-400 hover:text-white transition-colors cursor-pointer"
            >
              <BookPlus size={18} strokeWidth={3} />
              {mine.length ? 'Mis categorías' : 'Crear una'}
            </button>
          </div>
        </Panel>

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

        {/* Orden de turnos */}
        <Panel>
          <PanelLabel icon={ListOrdered}>Orden de turnos</PanelLabel>
          <div className="grid grid-cols-2 gap-3">
            {ORDER_OPTIONS.map((opt) => {
              const active = config.orderMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateConfig({ orderMode: opt.value })}
                  aria-pressed={active}
                  className={`flex flex-col items-center justify-center gap-1 py-3 border-2 font-vt323 text-xl uppercase transition-all cursor-pointer ${
                    active
                      ? 'bg-pink-600 border-pink-400 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-300'
                  }`}
                >
                  <opt.icon size={24} strokeWidth={3} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-slate-400 text-base font-vt323 text-center mt-3">
            {ORDER_HINT[config.orderMode]}
          </p>
        </Panel>

        {/* Modo caos */}
        <Panel>
          <PanelLabel icon={Tornado}>Modo caos</PanelLabel>
          <label className="flex items-center justify-center gap-3 cursor-pointer">
            <span className="relative">
              <input
                type="checkbox"
                checked={config.chaos}
                onChange={(e) => updateConfig({ chaos: e.target.checked })}
                className="sr-only"
              />
              <span
                className={`block w-12 h-6 border-2 transition-all duration-300 rounded-none ${
                  config.chaos ? 'bg-pink-600 border-pink-400' : 'bg-slate-800 border-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform duration-300 rounded-none ${
                    config.chaos ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </span>
            </span>
            <span className="text-white font-vt323 text-xl uppercase">
              {config.chaos ? 'Activado' : 'Desactivado'}
            </span>
          </label>
          <p className="text-slate-400 text-base font-vt323 text-center mt-3">
            {config.chaos
              ? 'De vez en cuando, y sin avisar, una ronda rompe las reglas: todos impostores, ninguno, o la mitad.'
              : 'Todas las rondas se juegan igual.'}
          </p>
        </Panel>
      </main>

      <footer className="flex gap-3 pt-2">
        <ButtonsGeneral type="back" onBack={onBack} onContinue={onContinue} text="Jugadores" />
        <ButtonsGeneral type="continue" onBack={onBack} onContinue={onContinue} text="Jugar" />
      </footer>

      {editorOpen && (
        <CategoryEditor
          onClose={() => setEditorOpen(false)}
          onUse={useCategory}
          current={config.custom}
        />
      )}
    </div>
  );
}
