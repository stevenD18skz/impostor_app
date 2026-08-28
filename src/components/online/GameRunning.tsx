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

/** El marco arcade con esquinas decorativas. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-slate-900 border-4 border-cyan-800 rounded-none relative">
      <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />
      <div className="relative z-10">{children}</div>
    </div>
  );
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
      className={`select-none touch-none cursor-pointer border-4 p-4 rounded-none relative transition-colors duration-200 ${
        peeking
          ? card.isImpostor
            ? 'bg-red-950 border-red-500'
            : 'bg-emerald-950 border-emerald-500'
          : 'bg-slate-900 border-cyan-800'
      }`}
    >
      <div className="absolute top-1 left-1 w-2 h-2 bg-pink-600" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-cyan-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-pink-600" />

      <div className="relative z-10">
        {peeking ? (
          <div className="space-y-2 text-center">
            <p className={`font-press-start text-lg ${card.isImpostor ? 'text-red-400' : 'text-emerald-400'}`}>
              {card.isImpostor ? '🎭 IMPOSTOR' : '🃏 INOCENTE'}
            </p>
            {card.isImpostor ? (
              <div className="bg-slate-800 border-2 border-cyan-900 p-3 rounded-none">
                <p className="flex items-center justify-center gap-2 text-cyan-400 font-vt323 text-lg uppercase tracking-widest mb-1">
                  <Lightbulb size={18} strokeWidth={3} className="text-amber-400" />
                  La categoría es
                </p>
                <p className="text-pink-400 font-press-start text-sm md:text-base uppercase break-words">
                  {card.categoryName}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800 border-2 border-cyan-900 p-3 rounded-none">
                <p className="text-cyan-400 font-vt323 text-lg uppercase tracking-widest mb-1">
                  Tu palabra secreta
                </p>
                <p className="text-white font-press-start text-sm md:text-base uppercase break-words">
                  {card.secretWord}
                </p>
              </div>
            )}
            <p className="flex items-center justify-center gap-2 text-slate-300 font-vt323 text-base pt-1">
              <EyeOff size={16} strokeWidth={3} />
              Suelta para ocultarla
            </p>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <p className="flex items-center justify-center gap-2 text-xl font-vt323 text-cyan-400 uppercase tracking-widest">
              <Eye size={20} strokeWidth={3} className="text-pink-500" />
              ¿Se te olvidó tu carta?
            </p>
            <p className="text-slate-400 text-base font-vt323">
              Mantén pulsado aquí para verla, tapando la pantalla
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Quién empieza y hacia qué lado, cuando se juega en círculo. */
function CircleStart({ start, order }: { start: NonNullable<GameData['start']>; order: Card[] }) {
  const Arrow = start.dir === 'horario' ? RotateCw : RotateCcw;

  return (
    <Panel>
      <p className="flex items-center justify-center gap-2 mb-2 text-xl font-vt323 text-cyan-400 uppercase tracking-widest">
        <Flag size={22} strokeWidth={2} className="text-pink-500" />
        Empieza
      </p>
      <p className="text-white font-press-start text-xl md:text-2xl uppercase break-words text-center">
        {start.name}
      </p>
      <p className="flex items-center justify-center gap-2 mt-3 text-pink-400 font-vt323 text-xl uppercase tracking-widest">
        <Arrow size={24} strokeWidth={3} />
        Sentido {start.dir}
      </p>
      <p className="text-slate-400 text-base font-vt323 text-center mt-1">
        Sigue quien tenga a su {start.dir === 'horario' ? 'izquierda' : 'derecha'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-3 mt-3 border-t-2 border-slate-700">
        {order.map((p) => (
          <span
            key={p.id}
            className={`px-3 py-1 text-lg font-vt323 ${
              p.id === start.id
                ? 'bg-pink-600 border-2 border-pink-400 text-white'
                : 'bg-slate-800 border-2 border-slate-600 text-slate-400'
            }`}
          >
            {p.name}
          </span>
        ))}
      </div>
    </Panel>
  );
}

export default function GameRunning({ order, start, card, onEndGame }: GameRunningProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="flex flex-col gap-4 flex-1">
      <header className="text-center pt-1">
        <h2 className="text-2xl sm:text-3xl font-press-start flex items-center justify-center gap-3 text-cyan-400">
          <GamepadDirectional size={34} strokeWidth={3} className="text-pink-500" />
          ¡EN CURSO!
          <Gamepad2 size={34} strokeWidth={3} className="text-pink-500" />
        </h2>
      </header>

      <main className="flex flex-col gap-3 flex-1">
        {start ? (
          <CircleStart start={start} order={order} />
        ) : (
          <Panel>
            <p className="flex items-center justify-center gap-2 mb-3 text-xl font-vt323 text-cyan-400 uppercase tracking-widest">
              <ListOrdered size={22} strokeWidth={2} className="text-pink-500" />
              Turnos
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar">
              {order.map((player, idx) => (
                <div key={player.id} className="p-2 border-2 border-slate-700 bg-slate-800 rounded-none text-lg font-vt323">
                  <span className="font-bold text-pink-400">[{idx + 1}]</span>
                  <strong className="text-white ml-2 uppercase">{player.name}</strong>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {card && <PeekCard card={card} />}

        {/* Instructions */}
        <div className="bg-slate-900 border-4 border-cyan-800 rounded-none overflow-hidden relative">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full px-4 py-3 text-cyan-400 outline-none hover:bg-slate-800"
          >
            <div className="flex items-center gap-2 font-vt323 text-xl uppercase tracking-widest">
              <BookOpenText size={22} strokeWidth={2} className="text-pink-500" />
              <span>Instrucciones</span>
            </div>
            <ChevronDown size={22} strokeWidth={3} className={`transition-transform duration-300 text-pink-500 ${showInstructions ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-slate-800 ${showInstructions ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <ul className="space-y-2 text-base font-vt323 text-left text-slate-300 px-4 py-3">
              <li>&gt; Inocentes: hablen de la palabra indirectamente</li>
              <li>&gt; Impostor: finge saberla y adivina</li>
              <li>&gt; Al final, voten por el impostor</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-3 pt-1">
        <div className="flex gap-3 font-press-start text-xs sm:text-sm">
          <button
            onClick={onEndGame}
            className="group flex flex-1 items-center justify-center gap-2 py-4 px-4 bg-slate-900 border-4 border-pink-700 text-pink-400 transition-all hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:shadow-none cursor-pointer"
          >
            <Crown size={18} strokeWidth={3} />
            TERMINAR
          </button>
        </div>
      </footer>
    </div>
  );
}
