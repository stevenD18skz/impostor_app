import { Medal, RotateCcw } from 'lucide-react';

interface GameEndProps {
  room: any;
  onReset: () => void;
  loading: {
    leaving: boolean;
    updating: boolean;
    starting: boolean;
    confirming: boolean;
    ending: boolean;
    resetting: boolean;
  };
}

export default function GameEnd({ room, onReset, loading }: GameEndProps) {
  const impostor = room.players.find((p: any) => p.is_impostor);

  if (loading.resetting) {
    return (
      <div className="space-y-8">
        <header className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
          <Medal size={48} strokeWidth={2} />
          <h2>¡Juego Terminado!</h2>
          <Medal size={48} strokeWidth={2} />
        </header>
        <main className="rounded-2xl p-8 space-y-6 bg-white/10">
          <p className="text-(--color-secondary) text-2xl mb-4">Volviendo al Lobby...</p>
          <p className="text-amber-500 text-5xl font-bold">Cargando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-center gap-2 text-4xl font-bold text-(--color-main)">
        <Medal size={48} strokeWidth={2} />
        <h2>¡Juego Terminado!</h2>
        <Medal size={48} strokeWidth={2} />
      </header>

      <main className="rounded-2xl p-8 space-y-6 bg-white/10">
        <p className="mb-0 text-(--color-secondary) text-2xl">La palabra secreta era</p>
        <p className="text-amber-500 text-5xl font-bold">{room.game_data.secretWord}</p>

        <p className="mb-0 text-(--color-secondary) text-2xl">El impostor era</p>
        <p className="text-pink-500 text-5xl font-bold">{impostor?.name || 'Desconocido'}</p>

        <div className="pt-2 border-t border-white/20">
          <p className="text-lg text-(--color-detail)">
            ¿Adivinaron quién era el impostor? 🤔
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-2">
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
        >
          <RotateCcw size={32} strokeWidth={3} />
          Volver al Lobby
        </button>
      </footer>
    </div>
  );
}
