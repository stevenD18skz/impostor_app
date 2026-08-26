import { Medal, RotateCcw } from 'lucide-react';
import type { Card } from '@/lib/room';

interface GameEndProps {
  secretWord: string;
  /** Pueden ser varios: la configuración deja subir el número de impostores. */
  impostors: Card[];
  onReset: () => void;
  /** Volver al lobby lo decide el anfitrión; los demás esperan. */
  canReset: boolean;
}

export default function GameEnd({ secretWord, impostors, onReset, canReset }: GameEndProps) {
  const many = impostors.length > 1;

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

        <p className="mb-0 text-(--color-secondary) text-2xl">
          {many ? 'Los impostores eran' : 'El impostor era'}
        </p>
        {impostors.length ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {impostors.map((i) => (
              <span key={i.id} className="text-pink-500 text-5xl font-bold">
                {i.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-pink-500 text-5xl font-bold">Desconocido</p>
        )}

        <div className="pt-2 border-t border-white/20">
          <p className="text-lg text-(--color-detail)">
            {many
              ? '¿Adivinaron quiénes eran los impostores? 🤔'
              : '¿Adivinaron quién era el impostor? 🤔'}
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-2">
        {canReset ? (
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
          >
            <RotateCcw size={32} strokeWidth={3} />
            Volver al Lobby
          </button>
        ) : (
          <p className="text-(--color-detail) text-xl animate-pulse">
            Esperando a que el anfitrión vuelva al lobby...
          </p>
        )}
      </footer>
    </div>
  );
}
