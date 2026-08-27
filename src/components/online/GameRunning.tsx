import { useState } from 'react';
import {
  Crown, Gamepad2, GamepadDirectional, ListOrdered, BookOpenText, ChevronDown,
  Eye, EyeOff, Flag, RotateCw, RotateCcw, Lightbulb,
} from 'lucide-react';
import type { Card, GameData } from '@/lib/room';

interface GameRunningProps {
  order: Card[];
  /** Solo en modo círculo: quién abre y hacia dónde sigue. */
  start: GameData['start'];
  /** La carta de quien mira esta pantalla, para poder repasarla. */
  card: {
    isImpostor: boolean;
    secretWord: string | null;
    categoryName: string;
  } | null;
  onEndGame: () => void;
}

/**
 * Repasar la propia carta a mitad de partida.
 *
 * Se muestra solo mientras se mantiene pulsado, nunca con un botón que la deja
 * fija: en esta pantalla el teléfono está sobre la mesa y a la vista de todos,
 * y una carta que se queda abierta es una carta que acaba viendo el de al lado.
 * Soltar la esconde, y eso incluye soltar sin querer.
 *
 * No cuesta un solo mensaje: la carta ya está en este navegador desde el
 * reparto, solo que hasta ahora no se pintaba.
 */
function PeekCard({ card }: { card: NonNullable<GameRunningProps['card']> }) {
  const [peeking, setPeeking] = useState(false);

  const tone = card.isImpostor
    ? 'from-red-400/40 to-red-900/40 border-red-400'
    : 'from-green-400/40 to-green-900/40 border-green-400';

  return (
    <div
      onPointerDown={() => setPeeking(true)}
      onPointerUp={() => setPeeking(false)}
      onPointerLeave={() => setPeeking(false)}
      onPointerCancel={() => setPeeking(false)}
      onContextMenu={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      aria-label="Mantén pulsado para ver tu carta"
      className={`select-none touch-none cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${
        peeking
          ? `bg-linear-to-br ${tone}`
          : 'bg-white/10 border-white/20 hover:bg-white/15 active:scale-[0.99]'
      }`}
    >
      {peeking ? (
        <div className="space-y-3">
          <p className="text-2xl font-bold text-(--color-secondary)">
            {card.isImpostor ? '🎭 ERES EL IMPOSTOR' : '✅ ERES INOCENTE'}
          </p>
          {card.isImpostor ? (
            <div className="bg-white/20 rounded-xl p-4">
              <p className="flex items-center justify-center gap-2 text-(--color-secondary) text-lg mb-1">
                <Lightbulb size={22} strokeWidth={3} className="text-amber-400" />
                La categoría es
              </p>
              <p className="text-pink-400 text-3xl font-bold">{card.categoryName}</p>
            </div>
          ) : (
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-(--color-secondary) text-lg mb-1">Tu palabra secreta</p>
              <p className="text-(--color-secondary) text-3xl font-bold">{card.secretWord}</p>
            </div>
          )}
          <p className="flex items-center justify-center gap-2 text-(--color-secondary) text-base">
            <EyeOff size={18} strokeWidth={3} />
            Suelta para ocultarla
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="flex items-center justify-center gap-2 text-(--color-primary) text-xl font-bold">
            <Eye size={24} strokeWidth={3} />
            ¿Se te olvidó tu carta?
          </p>
          <p className="text-(--color-detail) text-lg">
            Mantén pulsado aquí para verla, tapando la pantalla
          </p>
        </div>
      )}
    </div>
  );
}

/** Quién empieza y hacia qué lado, cuando se juega en círculo. */
function CircleStart({ start, order }: { start: NonNullable<GameData['start']>; order: Card[] }) {
  const Arrow = start.dir === 'horario' ? RotateCw : RotateCcw;

  return (
    <div className="p-4 rounded-2xl bg-white/10 space-y-3">
      <p className="flex items-center justify-center gap-2 text-xl font-bold text-(--color-primary)">
        <Flag size={26} strokeWidth={3} />
        Empieza
      </p>
      <p className="text-(--color-secondary) text-5xl font-bold break-words">{start.name}</p>

      <div className="flex items-center justify-center gap-2 text-cyan-400 text-2xl font-bold">
        <Arrow size={32} strokeWidth={3} />
        {start.dir === 'horario' ? 'Sentido horario' : 'Sentido antihorario'}
      </div>
      <p className="text-(--color-detail) text-base">
        Sigue el jugador que tenga a su {start.dir === 'horario' ? 'izquierda' : 'derecha'}.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/20">
        {order.map((p) => (
          <span
            key={p.id}
            className={`px-3 py-1 rounded-lg text-lg ${
              p.id === start.id
                ? 'bg-cyan-600 text-(--color-secondary) font-bold'
                : 'bg-white/10 text-(--color-detail)'
            }`}
          >
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GameRunning({ order, start, card, onEndGame }: GameRunningProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="space-y-6 text-(--color-main)">
      <header>
        <h2 className="text-5xl font-bold flex items-center justify-center gap-2">
          <GamepadDirectional size={48} strokeWidth={3} />
          <strong>¡Juego en Curso!</strong>
          <Gamepad2 size={48} strokeWidth={3} />
        </h2>
      </header>

      <main className="space-y-4">
        {start ? (
          <CircleStart start={start} order={order} />
        ) : (
          <div className="p-4 rounded-2xl bg-white/10">
            <p className="flex items-center justify-center gap-2 mb-4 text-xl font-bold text-(--color-primary)">
              <ListOrdered size={32} strokeWidth={2} />
              Orden de Turnos
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto text-xl custom-scrollbar">
              {order.map((player, idx) => (
                <div key={player.id} className="p-3 rounded-lg bg-white/10 text-xl">
                  <span className="font-semibold text-(--color-primary)">{idx + 1}.</span>
                  <strong className="text-(--color-secondary) ml-2">{player.name}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {card && <PeekCard card={card} />}

        <div className="p-4 rounded-2xl bg-white/10 text-(--color-primary) overflow-hidden">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full px-6 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <BookOpenText size={32} strokeWidth={2} />
              <span className="text-2xl font-bold">Instrucciones</span>
            </div>
            <ChevronDown
              size={32}
              strokeWidth={3}
              className={`transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all ease-in duration-300 ${showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-6">
              <ul className="space-y-2 text-lg text-left text-(--color-detail)">
                <li>• Los inocentes deben hablar sobre la palabra indirectamente</li>
                <li>• El impostor debe intentar adivinar la palabra y actuar natural</li>
                <li>• Al final, voten por quién creen que es el impostor</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex gap-4">
        <button
          onClick={onEndGame}
          className="flex flex-1 items-center justify-center gap-1 py-4 px-8 rounded-xl bg-pink-600 text-xl text-(--color-secondary) font-bold hover:bg-pink-700 transition-all duration-300"
        >
          <Crown size={32} strokeWidth={3} />
          Terminar
        </button>
      </footer>
    </div>
  );
}
