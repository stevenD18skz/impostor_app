import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import { Eye, Lightbulb } from 'lucide-react';

interface Player {
    isImpostor: boolean;
    name: string;
}

interface RevealStateProps {
    gameData: any;
    setShowRole: (show: boolean) => void;
    onNextPlayer: () => void;
}

export default function RevealState({
    gameData,
    setShowRole,
    onNextPlayer
}: RevealStateProps) {
    const player = gameData.game.players[gameData.game.currentPlayer];

    return (
        <div className="text-center space-y-8">
            <div className={`rounded-2xl p-6 border-2
                ${gameData.game.showRole ? 
                    (player.isImpostor 
                        ? 'border-red-400 bg-pink-500/30' 
                        : 'border-green-400 bg-green-500/30')
                    : 'border-gray-400 bg-gray-500/30'}`}>
                <h2 className="text-3xl font-bold text-white">
                    {gameData.game.showRole ? (player.isImpostor ? '🎭' : '🃏') : '🔒'} Carta de {player.name}
                </h2>
            </div>

            {!gameData.game.showRole ? (
                <div className="space-y-6">
                    <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-8">
                        <p className="text-white text-2xl mb-4">
                            ⚠️ {player.name}, asegúrate de que solo tú puedas ver la pantalla
                        </p>
                        <p className="text-yellow-200 text-xl">
                            Los demás jugadores deben mirar hacia otro lado
                        </p>
                    </div>

                    <button
                        onClick={() => setShowRole(true)}
                        className="bg-linear-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg"
                    >
                        <Eye className="inline mr-2 mb-1" size={24} />
                        Ver Mi Rol
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className={`rounded-2xl p-8 border-4 
                        ${player.isImpostor 
                            ? 'bg-linear-to-br from-red-900/40 to-red-600/40 border-red-400' 
                            : 'bg-linear-to-br from-green-900/40 to-green-600/40 border-green-400'}
                        `}> 

                        <h3 className="text-2xl font-bold text-white mb-4">
                            {player.isImpostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
                        </h3>

                        {!player.isImpostor && (
                            <div className="bg-white/20 rounded-xl p-6 mt-4">
                                <p className="text-white text-xl mb-2">Tu palabra secreta es:</p>
                                <p className="text-white text-4xl font-bold">{gameData.game.secretWord}</p>
                            </div>
                        )}

                        {player.isImpostor && (
                            <div className="bg-white/20 rounded-xl p-6 mt-4">
                                <p className="text-white text-xl">
                                    No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te descubran.
                                </p>
                            </div>
                        )}  
                        {player.isImpostor && (
                            <div className="bg-purple-500/20 rounded-xl p-6 mt-4">
                                <p className="text-white text-xl flex items-center justify-center gap-2 ">
                                    <Lightbulb size={32} className="text-amber-500" /> 
                                    La categoría es: <strong className="text-pink-500 text-3xl">{gameData.config.selectedCategory}</strong>
                                </p>
                            </div>
                        )}


                    </div>

                    
                    <ButtonsGeneral type="continue" onBack={() => setShowRole(false)} onContinue={onNextPlayer} />    
                </div>
            )}
        </div>
    );
}
