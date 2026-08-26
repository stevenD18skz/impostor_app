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
    startedAtLocal,
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
          className="flex items-center justify-center gap-2 mx-auto py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
        >
          <Home size={24} strokeWidth={3} />
          Volver al menú
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
          className="flex items-center justify-center gap-2 mx-auto py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
        >
          <Home size={24} strokeWidth={3} />
          Volver al menú
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
            className="py-4 px-8 rounded-xl bg-slate-600 text-xl text-(--color-secondary) font-bold hover:bg-slate-700 transition-all duration-300"
          >
            Salir de la sala
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
          timeLimit={room.game.timeLimit}
          startedAtLocal={startedAtLocal}
          onEndGame={endGame}
        />
      )}

      {phase === 'ended' && room.game && (
        <GameEnd
          secretWord={room.game.secretWord}
          impostors={room.game.impostors}
          onReset={resetGame}
          canReset={isHost}
        />
      )}
    </Shell>
  );
}
