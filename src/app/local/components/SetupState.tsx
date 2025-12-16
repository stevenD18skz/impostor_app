import { ArrowLeft, Clock, Minus, Plus, Play, Target, UserRoundX, Users } from 'lucide-react';
import { categorias } from '@/app/lib/data';

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
        <div className="text-center space-y-4">
            <div>
                <h1 className="text-5xl font-bold text-white mb-2">🕵️ EL IMPOSTOR</h1>
                <p className="text-purple-200 text-lg">Modo Local</p>
            </div>

            <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        <Target className="inline mr-2 mb-1 text-blue-500" size={24} />
                        Categoría
                    </label>
                    <select
                        name="selectedCategory"
                        value={config.selectedCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-lg bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                    >
                        {Object.keys(categorias).map(key => (
                            <option key={key} value={key} className="bg-gray-800">
                                {/* @ts-ignore */}
                                {categorias[key].nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        <Users className="inline mr-2 mb-1 text-amber-500" size={24} />
                        Número de Jugadores
                    </label>
                    <div className="number-input-wrapper">
                        <button
                            type="button"
                            onClick={() => handleDecrement('numPlayers', 3)}
                            disabled={config.numPlayers <= 3}
                            className="number-input-btn"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            name="numPlayers"
                            type="number"
                            min="3"
                            max="12"
                            value={config.numPlayers}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleIncrement('numPlayers', 12)}
                            disabled={config.numPlayers >= 12}
                            className="number-input-btn"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        <UserRoundX className="inline mr-2 mb-1 text-red-500" size={24} />
                        Número de Impostores
                    </label>
                    <div className="number-input-wrapper">
                        <button
                            type="button"
                            onClick={() => handleDecrement('numImpostors', 1)}
                            disabled={config.numImpostors <= 1}
                            className="number-input-btn"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            name="numImpostors"
                            type="number"
                            min="1"
                            max={config.numPlayers / 2}
                            value={config.numImpostors}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleIncrement('numImpostors', Math.floor(config.numPlayers / 2))}
                            disabled={config.numImpostors >= Math.floor(config.numPlayers / 2)}
                            className="number-input-btn"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        <Clock className="inline mr-2 mb-1 text-blue-500" size={24} />
                        Tiempo del Juego (segundos)
                    </label>
                    <div className="number-input-wrapper">
                        <button
                            type="button"
                            onClick={() => handleDecrement('timeLimit', 60, 30)}
                            disabled={config.timeLimit <= 60}
                            className="number-input-btn"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            name="timeLimit"
                            type="number"
                            min="60"
                            max="600"
                            step="30"
                            value={config.timeLimit}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleIncrement('timeLimit', 600, 30)}
                            disabled={config.timeLimit >= 600}
                            className="number-input-btn"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:bg-gray-700 transition-all shadow-lg"
                >
                    <ArrowLeft className="inline mr-2 mb-1" size={24} />
                    Volver
                </button>
                <button
                    onClick={onContinue}
                    className="flex-1 bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                    <Play className="inline mr-2 mb-1" size={24} />
                    Continuar
                </button>
            </div>
        </div>
    );
}
