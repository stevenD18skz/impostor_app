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
        <div className="space-y-8">
            <header className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
                <Medal size={48} strokeWidth={2} />
                <h2>¡Juego Terminado!</h2>
                <Medal size={48} strokeWidth={2} />
            </header>

            <main className="rounded-2xl p-8 space-y-6 bg-white/10">
                <p className="mb-0 text-(--color-secondary) text-2xl">La palabra secreta era</p>
                <p className="text-amber-500 text-5xl font-bold">{secretWord}</p>

                <p className="mb-0 text-(--color-secondary) text-2xl">El impostor era</p>
                <p className="text-pink-500 text-5xl font-bold">{players.find(p => p.isImpostor)?.name}</p>

                <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-xl text-purple-200">
                        ¿Adivinaron quién era el impostor? 🤔
                    </p>
                </div>
            </main>

            <footer className="flex items-center justify-center gap-2">
                <button
                    onClick={onResetGame}
                    className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
                >
                    <RotateCcw size={32} strokeWidth={3} />
                    Nueva Partida
                </button>
            </footer>
        </div>
    );
}
