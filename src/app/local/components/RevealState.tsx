import ButtonsGeneral from '@/components/ui/ButtonsGeneral';
import { Eye, Lightbulb } from 'lucide-react';
import { Player, GameData } from '@/app/local/types/local';

interface RevealStateProps {
    gameData: GameData;
    setShowRole: (show: boolean) => void;
    onNextPlayer: () => void;
}

export default function RevealState({
    gameData,
    setShowRole,
    onNextPlayer
}: RevealStateProps) {
    const player: Player = gameData.game.players[gameData.game.currentPlayer];



    return (
        <div className="text-center space-y-8">
            <header className={`rounded-2xl p-6 border-2
                ${gameData.game.showRole ?
                    (player.isImpostor
                        ? 'bg-linear-to-br from-red-400/40 to-red-900/40 border-red-400'
                        : 'bg-linear-to-br from-green-400/40 to-green-900/40 border-green-400')
                    : 'bg-linear-to-br from-amber-300/40 to-amber-600/40 border-amber-400'}`}>
                <h2 className="text-3xl font-bold text-(--color-secondary)">
                    {gameData.game.showRole ? (player.isImpostor ? '🎭' : '🃏') : '🔒'} Carta de {player.name}
                </h2>
            </header>

            {!gameData.game.showRole ? (
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="bg-linear-to-br from-amber-300/40 to-amber-600/40 border-2 border-amber-400 rounded-2xl p-8">
                        <p className="text-(--color-secondary) text-2xl mb-4">
                            ⚠️ {player.name}, asegúrate de que solo tú puedas ver la pantalla
                        </p>
                        <p className="text-(--color-detail) text-lg">
                            Los demás jugadores deben mirar hacia otro lado
                        </p>
                    </div>

                    <button
                        onClick={() => setShowRole(true)}
                        className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-orange-600 text-xl text-(--color-secondary) font-bold hover:bg-orange-700 transition-all duration-300"
                    >
                        <Eye className="inline" size={24} strokeWidth={3} />
                        Ver Mi Rol
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className={`rounded-2xl p-8 border-2 w-full 
                        ${player.isImpostor
                            ? 'bg-linear-to-br from-red-400/40 to-red-900/40 border-red-400'
                            : 'bg-linear-to-br from-green-400/40 to-green-900/40 border-green-400'}
                        `}>

                        <h3 className="text-2xl font-bold text-(--color-secondary) mb-4">
                            {player.isImpostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
                        </h3>

                        {!player.isImpostor && (
                            <div className="bg-white/20 rounded-xl p-6 mt-4">
                                <p className="text-(--color-secondary) text-xl mb-2">Tu palabra secreta es</p>
                                <p className="text-(--color-secondary) text-4xl font-bold">{gameData.game.secretWord}</p>
                            </div>
                        )}

                        {player.isImpostor && (
                            <div className="bg-white/20 rounded-xl p-6 space-y-4">
                                <p className="text-(--color-secondary) text-2xl flex items-center justify-center gap-2 mb-0">
                                    <Lightbulb size={32} className="text-amber-500" />
                                    La categoría es 
                                </p>
                                <p><strong className="text-pink-500 text-4xl">{gameData.config.selectedCategory}</strong></p>
                                <p className="text-(--color-detail) text-lg">
                                    No conoces la palabra secreta. Intenta descubrirla escuchando a los demás sin que te descubran.
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
