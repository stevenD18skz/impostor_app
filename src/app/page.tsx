'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import GameSetup from '@/components/online/GameSetup';
import Lobby from '@/components/online/Lobby';
import RoleReveal from '@/components/online/RoleReveal';
import GameRunning from '@/components/online/GameRunning';
import GameEnd from '@/components/online/GameEnd';
import MainMenu from '@/components/MainMenu';
import { useOnlineGame } from '@/hooks/useOnlineGame';

const SHELL =
  'flex items-center justify-center w-full min-h-screen bg-slate-900 font-vt323 selection:bg-pink-600 selection:text-white';
const GRID = {
  backgroundImage:
    'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
  backgroundSize: '32px 32px',
};

function Corners() {
  return (
    <>
      <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600"></div>
      <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600"></div>
    </>
  );
}

function Loading({ message }: { message: string }) {
  return (
    <div className={SHELL} style={GRID}>
      <div className="relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full max-w-2xl text-center">
        <Corners />
        <div className="absolute inset-4 border-2 border-slate-700/50 pointer-events-none"></div>
        <div className="animate-spin rounded-none h-16 w-16 border-4 border-b-transparent border-cyan-400 mx-auto mb-6 mt-4"></div>
        <p className="text-cyan-400 text-3xl font-press-start mb-4">{message}</p>
      </div>
    </div>
  );
}

export default function ImpostorGame() {
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(false);

  const {
    status,
    isRestoringSession,
    session,
    isHost,
    hostId,
    room,
    players,
    phase,
    myCard,
    isSpectator,
    hasReady,
    startedAtLocal,
    busy,
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    startGame,
    confirmRole,
    endGame,
    resetGame,
  } = useOnlineGame();

  if (isRestoringSession) return <Loading message="Restaurando sesión..." />;

  // Hay sesión pero el tablero todavía no llega: es el instante entre entrar al
  // canal y que el anfitrión reparta el estado.
  if (session && !room) {
    return <Loading message={status === 'error' ? 'Sin conexión...' : 'Entrando a la sala...'} />;
  }

  if (!session) {
    if (!showSetup) {
      return <MainMenu onLocalPlay={() => router.push('/local')} onOnlinePlay={() => setShowSetup(true)} />;
    }

    return (
      <div className={SHELL} style={GRID}>
        <div className="relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full max-w-2xl text-center z-10">
          <Corners />
          <button
            onClick={() => setShowSetup(false)}
            className="absolute top-6 left-6 text-cyan-400 hover:text-pink-400 transition-colors flex items-center gap-2 font-press-start text-xs z-20 hover:-translate-x-1"
          >
            <ArrowLeft size={20} /> VOLVER
          </button>

          <div className="mt-8 relative z-10">
            <GameSetup onCreate={createRoom} onJoin={joinRoom} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={SHELL} style={GRID}>
      <div
        className={`relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full text-center z-10
        ${phase === 'lobby' ? 'max-w-5xl' : 'max-w-3xl'}`}
      >
        <Corners />
        <div className="absolute inset-4 border-2 border-slate-700/50 pointer-events-none"></div>

        <div className="relative z-10 pt-4">
          {/* Llegó con el reparto hecho: espera afuera, sin ver cartas ajenas. */}
          {isSpectator && (phase === 'reveal' || phase === 'playing') && (
            <div className="space-y-6 py-8">
              <h2 className="text-4xl font-bold text-(--color-main)">La partida ya empezó</h2>
              <p className="text-(--color-detail) text-xl">
                Entras automáticamente cuando termine esta ronda.
              </p>
              <button
                onClick={leaveRoom}
                className="py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
              >
                Salir de la sala
              </button>
            </div>
          )}

          {phase === 'lobby' && (
            <Lobby
              code={room!.code}
              players={players}
              myId={session.playerId}
              hostId={hostId}
              isHost={isHost}
              settings={room!.settings}
              updateSettings={updateSettings}
              onStartGame={startGame}
              onLeaveRoom={leaveRoom}
              leaving={Boolean(busy.leaving)}
            />
          )}

          {phase === 'reveal' && myCard && (
            <RoleReveal
              playerName={session.name}
              card={myCard}
              onReady={confirmRole}
              hasReady={hasReady}
              readyCount={room!.game?.readyIds.length ?? 0}
              totalCount={players.length}
            />
          )}

          {phase === 'playing' && room!.game && !isSpectator && (
            <GameRunning
              order={room!.game.order}
              timeLimit={room!.game.timeLimit}
              startedAtLocal={startedAtLocal}
              onEndGame={endGame}
            />
          )}

          {phase === 'ended' && room!.game && (
            <GameEnd
              secretWord={room!.game.secretWord}
              impostors={room!.game.impostors}
              onReset={resetGame}
            />
          )}
        </div>
      </div>
    </div>
  );
}
