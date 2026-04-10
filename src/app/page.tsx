'use client';

import GameSetup from '@/components/online/GameSetup';
import Lobby from '@/components/online/Lobby';
import RoleReveal from '@/components/online/RoleReveal';
import GameRunning from '@/components/online/GameRunning';
import GameEnd from '@/components/online/GameEnd';
import MainMenu from '@/components/MainMenu';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useOnlineGame } from '@/hooks/useOnlineGame';

export default function ImpostorGame() {
  const router = useRouter();
  
  const {
    mode, setMode,
    room, myPlayer, playerHasReady,
    isRestoringSession, loading,
    handleJoin, updateSettings, startGame,
    leaveRoom, confirmRole, endGame, resetGame
  } = useOnlineGame();

  const handleLocalPlay = () => {
    router.push('/local');
  };

  // Mostrar loading mientras se restaura la sesión
  if (isRestoringSession) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-linear-to-br from-indigo-900 to-cyan-900 text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-(--color-secondary) mx-auto mb-4"></div>
          <p className="text-(--color-secondary) text-xl font-semibold">Restaurando sesión...</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return <MainMenu onLocalPlay={handleLocalPlay} onOnlinePlay={() => setMode('online_setup')} />;
  }

  if (mode === 'online_setup' || (!room && mode !== 'local')) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-linear-to-br from-indigo-900 to-cyan-900 text-center">
        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/10">
          <button 
            onClick={() => setMode('menu')}
            className="absolute top-6 left-6 text-white hover:text-pink-300 transition-colors flex items-center gap-2 font-semibold"
          >
            <ArrowLeft size={24} /> Volver
          </button>
          <GameSetup handleJoin={handleJoin} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-linear-to-br from-indigo-900 to-cyan-900 text-center">
      <div className={`bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full border border-white/10
        ${room.game_state === 'setup' ? 'max-w-5xl' : 'max-w-2xl'} 
      `}>
        {room.game_state === 'setup' && (
          <Lobby
            room={room}
            player={myPlayer}
            settingsRoom={room.settings}
            updateSettings={updateSettings}
            onStartGame={startGame}
            onLeaveRoom={leaveRoom}
            loading={loading}
          />
        )}

        {room.game_state === 'reveal' && (
          <RoleReveal
            player={myPlayer}
            gameData={room}
            onReady={confirmRole}
            playerHasReady={playerHasReady}
            loading={loading}
          />
        )}

        {room.game_state === 'playing' && (
          <GameRunning
            room={room}
            onEndGame={endGame}
          />
        )}

        {room.game_state === 'ended' && (
          <GameEnd room={room} onReset={resetGame} loading={loading} />
        )}
      </div>
    </div>
  );
}
