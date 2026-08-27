'use client';

import { useParams, useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

import Lobby from '@/components/online/Lobby';
import RoleReveal from '@/components/online/RoleReveal';
import GameRunning from '@/components/online/GameRunning';
import GameEnd from '@/components/online/GameEnd';
import JoinRoom from '@/components/online/JoinRoom';
import Shell, { Loading, NotConfigured } from '@/components/online/Shell';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { isValidCode, normalizeCode } from '@/lib/room';

/*
  La sala vive en su propia URL. Eso es lo que la vuelve compartible: mandar
  `/room/ABC123` es mandar la sala, y un F5 cae exactamente donde estaba en vez
  de rebotar al menú.
*/

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = normalizeCode(
    Array.isArray(params?.code) ? params.code[0] : (params?.code ?? ''),
  );

  const game = useOnlineGame(code);
  const {
    status,
    isConfigured,
    isRestoringSession,
    joinError,
    session,
    isHost,
    hostId,
    room,
    players,
    phase,
    myCard,
    isSpectator,
    hasReady,
    revealTotal,
    busy,
    enter,
    leaveRoom,
    updateSettings,
    startGame,
    confirmRole,
    endGame,
    resetGame,
  } = game;

  const goHome = () => router.push('/');

  const exit = async () => {
    await leaveRoom();
    goHome();
  };

  if (!isConfigured) return <NotConfigured />;

  if (!isValidCode(code)) {
    return (
      <Shell>
        <h2 className="text-3xl font-bold text-pink-500 mb-4">Código de sala inválido</h2>
        <p className="text-(--color-detail) text-xl mb-6">
          «{code || '—'}» no parece un código de sala.
        </p>
        <button
          onClick={goHome}
          className="group relative flex items-center justify-center gap-2 mx-auto py-4 px-6 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 outline-none cursor-pointer"
        >
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400" />
          <Home size={18} strokeWidth={3} />
          VOLVER AL MENÚ
        </button>
      </Shell>
    );
  }

  if (isRestoringSession) return <Loading message="Restaurando sesión..." />;

  // Sin sesión para esta sala: o se abrió el enlace de otro, o la sala rechazó
  // la entrada y hay que volver a intentarlo con otro nombre.
  if (!session) {
    return (
      <Shell>
        <JoinRoom
          code={code}
          error={joinError}
          onEnter={(name) => enter(name)}
          onBack={goHome}
        />
      </Shell>
    );
  }

  if (status === 'error') {
    return (
      <Shell>
        <h2 className="text-3xl font-bold text-pink-500 mb-4">Sin conexión</h2>
        <p className="text-(--color-detail) text-xl mb-6">
          No se pudo conectar con el servidor de la sala. Revisa tu conexión.
        </p>
        <button
          onClick={exit}
          className="group relative flex items-center justify-center gap-2 mx-auto py-4 px-6 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 outline-none cursor-pointer"
        >
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400" />
          <Home size={18} strokeWidth={3} />
          VOLVER AL MENÚ
        </button>
      </Shell>
    );
  }

  // Hay sesión pero el tablero todavía no llega: es el instante entre entrar al
  // canal y que el anfitrión reparta el estado.
  if (!room) return <Loading message="Entrando a la sala..." />;

  return (
    <Shell wide={phase === 'lobby'}>
      {/* Llegó con el reparto hecho: espera afuera, sin ver cartas ajenas. */}
      {isSpectator && (phase === 'reveal' || phase === 'playing') && (
        <div className="space-y-6 py-8">
          <h2 className="text-4xl font-bold text-(--color-main)">La partida ya empezó</h2>
          <p className="text-(--color-detail) text-xl">
            Entras automáticamente cuando termine esta ronda.
          </p>
          <button
            onClick={exit}
            className="group relative flex items-center justify-center gap-2 mx-auto py-4 px-6 border-4 border-cyan-800 bg-slate-900 text-cyan-400 font-press-start text-xs hover:-translate-y-1 hover:border-cyan-400 hover:text-white hover:shadow-[0_4px_0_#0f172a,0_4px_10px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-none transition-all duration-200 outline-none cursor-pointer"
          >
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-800 group-hover:bg-cyan-400" />
            SALIR DE LA SALA
          </button>
        </div>
      )}

      {phase === 'lobby' && (
        <Lobby
          code={room.code}
          players={players}
          myId={session.playerId}
          hostId={hostId}
          isHost={isHost}
          settings={room.settings}
          updateSettings={updateSettings}
          onStartGame={startGame}
          onLeaveRoom={exit}
          leaving={Boolean(busy.leaving)}
        />
      )}

      {phase === 'reveal' && myCard && (
        <RoleReveal
          playerName={session.name}
          card={myCard}
          onReady={confirmRole}
          hasReady={hasReady}
          readyCount={room.game?.readyIds.length ?? 0}
          totalCount={revealTotal}
        />
      )}

      {phase === 'playing' && room.game && !isSpectator && (
        <GameRunning
          order={room.game.order}
          start={room.game.start}
          card={room.settings.allowPeek ? myCard : null}
          onEndGame={endGame}
        />
      )}

      {phase === 'ended' && room.game && (
        <GameEnd
          secretWord={room.game.secretWord}
          impostors={room.game.impostors}
          variant={room.game.variant}
          onReset={resetGame}
          canReset={isHost}
        />
      )}
    </Shell>
  );
}
