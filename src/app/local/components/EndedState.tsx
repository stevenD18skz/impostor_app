import { Medal, RotateCcw } from 'lucide-react';

interface Player {
    isImpostor: boolean;
    name: string;
}

interface EndedStateProps {
    secretWord: string;
    players: Player[];
    onResetGame: () => void;
}

export default function EndedState({
    secretWord,
    players,
    onResetGame
}: EndedStateProps) {
    return (
        <div className="flex flex-col items-cente gap-4 text-center space-y-4">
            <h2 className="flex items-center justify-center gap-2 text-(--color-main) text-4xl font-bold ">
                <Medal size={48} strokeWidth={2} />
                ¡Juego Terminado!  
                <Medal size={48} strokeWidth={2} /> 
            </h2>

            <div className="bg-white/10 rounded-2xl p-8 space-y-4">
                <p className="text-(--color-secondary) text-2xl mb-0">La palabra secreta era</p>
                <p className="text-amber-500 text-5xl font-bold">{secretWord}</p>

                <p className="text-(--color-secondary) text-2xl mt-8 mb-0">El impostor era</p>
                <p className="text-pink-500 text-5xl font-bold">{players.find(p => p.isImpostor)?.name}</p>

                <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-purple-200 text-xl">
                        ¿Adivinaron quién era el impostor? 🤔
                    </p>
                </div>
            </div>

            <button
                onClick={onResetGame}
                className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
            >
                <RotateCcw size={32} strokeWidth={3} />
                Nueva Partida
            </button>
        </div>
    );
}
