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
      <div className="flex items-center justify-center w-full min-h-screen bg-slate-900 font-vt323 selection:bg-pink-600 selection:text-white"
           style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <div className="relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full max-w-2xl text-center">
          <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600"></div>
          <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600"></div>
          <div className="absolute inset-4 border-2 border-slate-700/50 pointer-events-none"></div>

          <div className="animate-spin rounded-none h-16 w-16 border-4 border-b-transparent border-cyan-400 mx-auto mb-6 mt-4"></div>
          <p className="text-cyan-400 text-3xl font-press-start mb-4">Restaurando sesión...</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return <MainMenu onLocalPlay={handleLocalPlay} onOnlinePlay={() => setMode('online_setup')} />;
  }

  if (mode === 'online_setup' || (!room && mode !== 'local')) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-slate-900 font-vt323 selection:bg-pink-600 selection:text-white"
           style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <div className="relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full max-w-2xl text-center z-10">
          <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600"></div>
          <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600"></div>
          
          <button 
            onClick={() => setMode('menu')}
            className="absolute top-6 left-6 text-cyan-400 hover:text-pink-400 transition-colors flex items-center gap-2 font-press-start text-xs z-20 hover:-translate-x-1"
          >
            <ArrowLeft size={20} /> VOLVER
          </button>
          
          <div className="mt-8 relative z-10">
            <GameSetup handleJoin={handleJoin} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-slate-900 font-vt323 selection:bg-pink-600 selection:text-white"
         style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      <div className={`relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-8 w-full text-center z-10
        ${room.game_state === 'setup' ? 'max-w-5xl' : 'max-w-3xl'} 
      `}>
        <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600"></div>
        <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600"></div>
        <div className="absolute inset-4 border-2 border-slate-700/50 pointer-events-none"></div>

        <div className="relative z-10 pt-4">
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
    </div>
  );
}
