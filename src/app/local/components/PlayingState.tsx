'use client';

import { useState } from 'react';
import {
  BookOpenText, ChevronDown, Crown, Eye, EyeOff, Flag, Gamepad2, GamepadDirectional,
  ListOrdered, RotateCcw, RotateCw, X,
} from 'lucide-react';
import { GameData, Player } from '@/app/types/local';

interface PlayingStateProps {
  gameData: GameData;
  onEndGame: () => void;
}

/** El marco arcade que llevan todas las tarjetas de esta pantalla. */
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
 * Repasar la carta a mitad de partida.
 *
 * Aquí el teléfono está en la mesa y lo ve todo el mundo, así que hay dos
 * cerrojos: primero hay que decir quién eres, y después la carta solo se ve
 * mientras se mantiene pulsada. Soltar la esconde —y eso incluye soltarla sin
 * querer, que es justo cuando importa.
 */
function PeekPanel({ players, secretWord, categoryName }: {
  players: Player[];
  secretWord: string;
  categoryName: string;
}) {
  const [who, setWho] = useState<Player | null>(null);
  const [peeking, setPeeking] = useState(false);

  const close = () => {
    setPeeking(false);
    setWho(null);
  };

  if (!who) {
    return (
      <Panel>
        <p className="flex items-center justify-center gap-2 mb-3 text-xl font-vt323 text-cyan-400 uppercase tracking-widest">
          <Eye size={22} strokeWidth={2} className="text-pink-500" />
          ¿Olvidaste tu carta?
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {players.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setWho(p)}
              className="px-3 py-2 border-2 border-slate-600 bg-slate-800 text-white font-vt323 text-lg uppercase hover:border-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="text-slate-500 text-base font-vt323 text-center mt-3">
          Toca tu nombre y tapa la pantalla de los demás
        </p>
      </Panel>
    );
  }

  return (
    <div
      className={`p-4 border-4 rounded-none relative transition-colors duration-200 ${
        peeking
          ? who.isImpostor
            ? 'bg-red-950 border-red-500'
            : 'bg-emerald-950 border-emerald-500'
          : 'bg-slate-900 border-cyan-800'
      }`}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute top-1 right-1 z-20 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <X size={20} strokeWidth={3} />
      </button>

      <div
        onPointerDown={() => setPeeking(true)}
        onPointerUp={() => setPeeking(false)}
        onPointerLeave={() => setPeeking(false)}
        onPointerCancel={() => setPeeking(false)}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        aria-label={`Mantén pulsado para ver la carta de ${who.name}`}
        className="select-none touch-none cursor-pointer relative z-10 text-center py-2"
      >
        <p className="text-slate-400 font-vt323 text-lg uppercase tracking-widest">{who.name}</p>

        {peeking ? (
          <div className="space-y-2 mt-2">
            <p className={`font-press-start text-lg ${who.isImpostor ? 'text-red-400' : 'text-emerald-400'}`}>
              {who.isImpostor ? '🎭 IMPOSTOR' : '🃏 INOCENTE'}
            </p>
            <p className="text-cyan-400 font-vt323 text-lg uppercase tracking-widest">
              {who.isImpostor ? 'La categoría es' : 'Tu palabra secreta'}
            </p>
            <p className="text-white font-press-start text-base md:text-xl uppercase break-words">
              {who.isImpostor ? categoryName : secretWord}
            </p>
            <p className="flex items-center justify-center gap-2 text-slate-300 font-vt323 text-base pt-1">
              <EyeOff size={16} strokeWidth={3} />
              Suelta para ocultarla
            </p>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-2 text-cyan-400 font-vt323 text-xl uppercase mt-2 animate-pulse">
            <Eye size={20} strokeWidth={3} className="text-pink-500" />
            Mantén pulsado aquí
          </p>
        )}
      </div>
    </div>
  );
}

export default function PlayingState({ gameData, onEndGame }: PlayingStateProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const { start, playingOrder, secretWord, categoryName, players } = gameData.game;
  const Arrow = start?.dir === 'horario' ? RotateCw : RotateCcw;

  return (
    <div className="flex flex-col gap-4 text-(--color-main) flex-1">
      <header className="text-center pt-1">
        <h2 className="text-2xl sm:text-3xl font-press-start flex items-center justify-center gap-3 text-cyan-400">
          <GamepadDirectional size={34} strokeWidth={3} className="text-pink-500" />
          ¡EN CURSO!
          <Gamepad2 size={34} strokeWidth={3} className="text-pink-500" />
        </h2>
      </header>

      <main className="flex flex-col gap-3 flex-1">
        {start ? (
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
          </Panel>
        ) : (
          <Panel>
            <p className="flex items-center justify-center gap-2 mb-3 text-xl font-vt323 text-cyan-400 uppercase tracking-widest">
              <ListOrdered size={22} strokeWidth={2} className="text-pink-500" />
              Turnos
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar">
              {playingOrder.map((player, idx) => (
                <div key={idx} className="p-2 border-2 border-slate-700 bg-slate-800 rounded-none text-lg font-vt323">
                  <span className="font-bold text-pink-400">[{idx + 1}]</span>
                  <strong className="text-white ml-2 uppercase">{player.name}</strong>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <PeekPanel players={players} secretWord={secretWord} categoryName={categoryName} />

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
            className="group flex flex-1 items-center justify-center gap-2 py-4 px-4 bg-slate-900 border-4 border-pink-700 text-pink-400 transition-all hover:-translate-y-1 hover:border-pink-500 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-none"
          >
            <Crown size={18} strokeWidth={3} />
            TERMINAR
          </button>
        </div>
      </footer>
    </div>
  );
}
