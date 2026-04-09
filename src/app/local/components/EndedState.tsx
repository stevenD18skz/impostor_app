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
  const impostors = players.filter(p => p.isImpostor);
  const multipleImpostors = impostors.length > 1;

  return (
    <div className="flex flex-col gap-5 flex-1">
      <header className="flex items-center justify-center gap-2 text-3xl font-black text-(--color-main) pt-2">
        <Medal size={36} strokeWidth={2} />
        <h2>¡Juego Terminado!</h2>
        <Medal size={36} strokeWidth={2} />
      </header>

      <main className="flex flex-col gap-4 flex-1">
        {/* Secret word */}
        <div className="rounded-2xl p-5 bg-white/8 text-center">
          <p className="text-(--color-secondary) text-base mb-1">La palabra secreta era</p>
          <p className="text-amber-400 text-5xl font-black">{secretWord}</p>
        </div>

        {/* Impostors */}
        <div className="rounded-2xl p-5 bg-white/8 text-center">
          <p className="text-(--color-secondary) text-base mb-2">
            {multipleImpostors ? `Los impostores eran (${impostors.length})` : 'El impostor era'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {impostors.map((p, i) => (
              <span key={i} className="text-pink-400 text-4xl font-black">
                {p.name}{i < impostors.length - 1 ? ' &' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white/8 text-center">
          <p className="text-sm text-(--color-detail)">
            ¿Adivinaron {multipleImpostors ? 'a los impostores' : 'quién era el impostor'}? 🤔
          </p>
        </div>
      </main>

      <footer className="pt-2">
        <button
          onClick={onResetGame}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white/15 text-lg text-(--color-secondary) font-bold active:scale-95 transition-transform"
        >
          <RotateCcw size={24} strokeWidth={3} />
          Nueva Partida
        </button>
      </footer>
    </div>
  );
}
