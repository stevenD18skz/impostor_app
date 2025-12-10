interface NamesStateProps {
    numPlayers: number;
    playerNames: string[];
    updatePlayerName: (index: number, name: string) => void;
    onBack: () => void;
    onStartGame: () => void;
}

export default function NamesState({
    numPlayers,
    playerNames,
    updatePlayerName,
    onBack,
    onStartGame
}: NamesStateProps) {
    return (
        <div className="text-center space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-white mb-2">👥 Nombres de Jugadores</h2>
                <p className="text-purple-200">Ingresa el nombre de cada jugador</p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array(numPlayers).fill(0).map((_, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                        <label className="block text-white text-sm font-semibold mb-2">
                            Jugador {idx + 1}
                        </label>
                        <input
                            type="text"
                            placeholder={`Jugador ${idx + 1}`}
                            value={playerNames[idx] || ''}
                            onChange={(e) => updatePlayerName(idx, e.target.value)}
                            className="w-full px-4 py-3 text-lg bg-white/20 text-white placeholder-purple-300 rounded-xl border-2 border-white/30 focus:border-purple-400 focus:outline-none"
                        />
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-all"
                >
                    ← Atrás
                </button>
                <button
                    onClick={onStartGame}
                    className="flex-1 bg-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                    Iniciar Juego →
                </button>
            </div>
        </div>
    );
}
