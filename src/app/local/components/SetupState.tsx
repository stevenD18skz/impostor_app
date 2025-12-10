import { Play, Users } from 'lucide-react';
import { categorias } from '@/app/lib/data';

interface SetupStateProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    numPlayers: number;
    setNumPlayers: (num: number) => void;
    numImpostors: number;
    setNumImpostors: (num: number) => void;
    timeLimit: number;
    setTimeLimit: (time: number) => void;
    onBack: () => void;
    onContinue: () => void;
}

export default function SetupState({
    selectedCategory,
    setSelectedCategory,
    numPlayers,
    setNumPlayers,
    numImpostors,
    setNumImpostors,
    timeLimit,
    setTimeLimit,
    onBack,
    onContinue
}: SetupStateProps) {
    return (
        <div className="text-center space-y-4">
            <div>
                <h1 className="text-5xl font-bold text-white mb-2">🕵️ EL IMPOSTOR</h1>
                <p className="text-purple-200 text-lg">Modo Local</p>
            </div>

            <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        🎯 Categoría
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
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
                        <Users className="inline mr-2 mb-1" size={24} />
                        Número de Jugadores
                    </label>
                    <input
                        type="number"
                        min="3"
                        max="12"
                        value={numPlayers}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNumPlayers(val);
                            if (numImpostors >= val) setNumImpostors(Math.max(1, val - 1));
                        }}
                        className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                    />
                </div>

                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        👤 Número de Impostores
                    </label>
                    <input
                        type="number"
                        min="1"
                        max={numPlayers - 1}
                        value={numImpostors}
                        onChange={(e) => setNumImpostors(parseInt(e.target.value))}
                        className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                    />
                </div>

                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <label className="block text-white text-lg font-semibold mb-3">
                        ⏱️ Tiempo del Juego (segundos)
                    </label>
                    <input
                        type="number"
                        min="60"
                        max="600"
                        step="30"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                        className="w-full px-4 py-3 text-2xl text-center bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:bg-gray-700 transition-all shadow-lg"
                >
                    ← Volver
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
