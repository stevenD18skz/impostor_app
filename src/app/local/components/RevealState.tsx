import { Eye } from 'lucide-react';

interface Player {
    isImpostor: boolean;
    name: string;
}

interface RevealStateProps {
    players: Player[];
    currentPlayer: number;
    showRole: boolean;
    setShowRole: (show: boolean) => void;
    secretWord: string;
    numPlayers: number;
    onNextPlayer: () => void;
}

export default function RevealState({
    players,
    currentPlayer,
    showRole,
    setShowRole,
    secretWord,
    numPlayers,
    onNextPlayer
}: RevealStateProps) {
    const player = players[currentPlayer];

    return (
        <div className="text-center space-y-8">
            <div className="bg-pink-500/30 rounded-2xl p-6 border-2 border-purple-400">
                <h2 className="text-3xl font-bold text-white">
                    🃏 Carta de {player.name}
                </h2>
            </div>

            {!showRole ? (
                <div className="space-y-6">
                    <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-8">
                        <p className="text-white text-lg mb-4">
                            ⚠️ {player.name}, asegúrate de que solo tú puedas ver la pantalla
                        </p>
                        <p className="text-yellow-200 text-sm">
                            Los demás jugadores deben mirar hacia otro lado
                        </p>
                    </div>

                    <button
                        onClick={() => setShowRole(true)}
                        className="bg-linear-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
                    >
                        <Eye className="inline mr-2 mb-1" size={24} />
                        Ver Mi Rol
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className={`rounded-2xl p-8 border-4 ${player.isImpostor ? 'bg-linear-gradient-to-br from-red-900/40 to-red-600/40 border-red-400' : 'bg-linear-gradient-to-br from-green-900/40 to-green-600/40 border-green-400'}`}>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
                            <h3 className="text-3xl font-bold text-white">
                                🃏 {player.name}
                            </h3>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4">
                            {player.isImpostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
                        </h3>

                        {!player.isImpostor && (
                            <div className="bg-white/20 rounded-xl p-6 mt-4">
                                <p className="text-white text-sm mb-2">Tu palabra secreta es:</p>
                                <p className="text-white text-4xl font-bold">{secretWord}</p>
                            </div>
                        )}

                        {player.isImpostor && (
                            <div className="bg-white/20 rounded-xl p-6 mt-4">
                                <p className="text-white text-lg">
                                    No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te descubran.
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onNextPlayer}
                        className="w-full bg-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                    >
                        {currentPlayer < numPlayers - 1 ? '➡️ Siguiente Jugador' : '🎮 Comenzar Juego'}
                    </button>
                </div>
            )}
        </div>
    );
}
