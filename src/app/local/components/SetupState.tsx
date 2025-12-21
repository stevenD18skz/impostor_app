import { Book, Clock, Users, WifiOff, Drama, HatGlasses } from 'lucide-react';
import { categorias } from '@/app/lib/data';
import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import NumberInput from '@/components/ui/NumberInput';

import "./styleLocal.css"

interface SetupStateProps {
    config: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
    onBack: () => void;
    onContinue: () => void;
}

export default function SetupState({
    config,
    handleChange,
    onBack,
    onContinue
}: SetupStateProps) {
    const handleIncrement = (field: string, max: number, step: number = 1) => {
        const currentValue = config[field];
        if (currentValue < max) {
            const newValue = Math.min(currentValue + step, max);
            handleChange({ target: { name: field, value: newValue.toString() } } as any);
        }
    };

    const handleDecrement = (field: string, min: number, step: number = 1) => {
        const currentValue = config[field];
        if (currentValue > min) {
            const newValue = Math.max(currentValue - step, min);
            handleChange({ target: { name: field, value: newValue.toString() } } as any);
        }
    };
    return (
        <div className="space-y-6">
            <header className='flex flex-col items-center'>
                <h1 className="flex items-center justify-center gap-1 text-(--color-main) text-5xl font-bold">
                    <HatGlasses size={64}/>
                    EL IMPOSTOR
                </h1>
                <p className="flex items-center justify-center gap-1 text-(--color-detail) text-lg">
                    <WifiOff size={24}/>
                    Modo Local
                </p>
            </header>

            <main className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="flex items-center justify-center gap-1 text-(--color-primary) text-2xl font-semibold mb-3">
                        <Book size={24} strokeWidth={3}/>
                        Categoría
                    </label>
                    <select
                        name="selectedCategory"
                        value={config.selectedCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-2xl bg-white/20 text-(--color-secondary) rounded-xl focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary) focus:outline-none"
                >
                        {Object.keys(categorias).map(key => (
                            <option key={key} value={key} className="bg-slate-800">
                                {/* @ts-ignore */}
                                {categorias[key].nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <NumberInput
                    label="Número de Jugadores"
                    icon={Users}
                    name="numPlayers"
                    value={config.numPlayers}
                    min={3}
                    max={12}
                    onChange={handleChange}
                    onIncrement={() => handleIncrement('numPlayers', 12)}
                    onDecrement={() => handleDecrement('numPlayers', 3)}
                />

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

                <NumberInput
                    label="Tiempo del Juego (segundos)"
                    icon={Clock}
                    name="timeLimit"
                    value={config.timeLimit}
                    min={60}
                    max={600}
                    step={30}
                    onChange={handleChange}
                    onIncrement={() => handleIncrement('timeLimit', 600, 30)}
                    onDecrement={() => handleDecrement('timeLimit', 60, 30)}
                />
            </main>

            <footer className="flex gap-4">
                <ButtonsGeneral type="back" onBack={onBack} onContinue={onContinue} />
                <ButtonsGeneral type="continue" onBack={onBack} onContinue={onContinue} />
            </footer>
        </div>
    );
}
