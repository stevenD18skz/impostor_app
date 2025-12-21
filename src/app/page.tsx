'use client';

import { useState, useCallback, useEffect } from 'react';
import GameSetup from '@/components/online/GameSetup';
import Lobby from '@/components/online/Lobby';
import RoleReveal from '@/components/online/RoleReveal';
import GameRunning from '@/components/online/GameRunning';
import GameEnd from '@/components/online/GameEnd';
import { useRouter } from 'next/navigation';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';

export default function ImpostorGame() {
  // Room state
  const [mode, setMode] = useState<'menu' | 'local' | 'multiplayer'>('menu');
  const [room, setRoom] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');

  // Game state
  const [myPlayer, setMyPlayer] = useState<any>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [playerHasReady, setPlayerHasReady] = useState(false);

  // Loading states - usando objeto para manejar múltiples estados de carga
  const [loading, setLoading] = useState({
    leaving: false,
    updating: false,
    starting: false,
    confirming: false,
    ending: false,
    resetting: false
  });

  // Navigation
  const router = useRouter();

  // Restaurar sesión desde localStorage al cargar
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedRoomCode = localStorage.getItem('impostor_roomCode');
        const savedPlayerName = localStorage.getItem('impostor_playerName');
        const savedMode = localStorage.getItem('impostor_mode');

        if (savedRoomCode && savedPlayerName && savedMode === 'multiplayer') {
          console.log('Restaurando sesión...', { savedRoomCode, savedPlayerName });

          // Intentar reconectar a la sala
          const res = await fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'rejoin',
              roomCode: savedRoomCode,
              playerName: savedPlayerName
            })
          });

          const data = await res.json();

          if (data.error) {
            console.error('Error al reconectar:', data.error);
            // Limpiar localStorage si la sala ya no existe
            localStorage.removeItem('impostor_roomCode');
            localStorage.removeItem('impostor_playerName');
            localStorage.removeItem('impostor_mode');
          } else {
            // Restaurar el estado
            setRoomCode(data.roomCode);
            setRoom(data.room);
            setMyPlayer(data.myPlayer);
            setMode('multiplayer');
            console.log('Sesión restaurada exitosamente');
          }
        }
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        // Limpiar localStorage en caso de error
        localStorage.removeItem('impostor_roomCode');
        localStorage.removeItem('impostor_playerName');
        localStorage.removeItem('impostor_mode');
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);


  
  // Callbacks memoizados para evitar re-renders infinitos
  const handleRoomUpdate = useCallback((updatedRoom: any) => {
    setRoom(updatedRoom);

  }, []);

  const handlePlayerUpdate = useCallback((updatedPlayer: any) => {
    setMyPlayer(updatedPlayer);
  }, []);

  // Realtime subscription - reemplaza el polling
  useRealtimeRoom(
    roomCode,
    mode === 'multiplayer',
    myPlayer?.name || '',
    handleRoomUpdate,
    handlePlayerUpdate
  );



  // GAME SETUP
  const handleJoin = (code: string, roomData: any, myPlayer: any) => {
    setRoomCode(code);
    setRoom(roomData);
    setMyPlayer(myPlayer);
    setMode('multiplayer');

    // Guardar en localStorage para persistencia
    localStorage.setItem('impostor_roomCode', code);
    localStorage.setItem('impostor_playerName', myPlayer.name);
    localStorage.setItem('impostor_mode', 'multiplayer');
  };


  const handleLocalPlay = () => {
    router.push('/local');
  };



  // LOBBY
  const updateSettings = async (settings: any) => {
    console.log("Updating settings", settings);
    setLoading(prev => ({ ...prev, updating: true }));
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSettings', roomCode, settings })
      });
    } catch (error) {
      console.error("Error updating settings", error);
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };


  const startGame = async () => {
    setLoading(prev => ({ ...prev, starting: true }));

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'startGame', roomCode })
      });
      const data = await res.json();
      setRoom(data?.room);
      setMyPlayer(data?.room?.players?.find((p: any) => p.name === myPlayer.name));
    } catch (error) {
      console.error("Error starting game", error);
    } finally {
      setLoading(prev => ({ ...prev, starting: false }));
    }
  };


  const LeaveRoom = async () => {
    setLoading(prev => ({ ...prev, leaving: true }));
    try {
      // Llamar al endpoint para salir de la sala
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          roomCode,
          playerName: myPlayer?.name
        })
      });
    } catch (error) {
      console.error('Error al salir de la sala:', error);
    } finally {
      // Limpiar localStorage al salir de la sala
      localStorage.removeItem('impostor_roomCode');
      localStorage.removeItem('impostor_playerName');
      localStorage.removeItem('impostor_mode');

      // Limpiar estado local
      setRoom(null);
      setRoomCode('');
      setMyPlayer(null);
      setMode('menu');
      setLoading(prev => ({ ...prev, leaving: false }));
    }
  };



  // ROLE REVEAL
  const confirmRole = async () => {
    setLoading(prev => ({ ...prev, confirming: true }));
    try {
      const playerName = myPlayer.name;
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmRole', roomCode, playerName })
      });
    } catch (error) {
      console.error("Error confirming role", error);
    } finally {
      setLoading(prev => ({ ...prev, confirming: false }));
      setPlayerHasReady(true);
    }
  };



  // GAME END
  const endGame = async () => {
    setLoading(prev => ({ ...prev, ending: true }));

    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'endGame', roomCode })
      });
    } catch (error) {
      console.error("Error ending game", error);
    } finally {
      setLoading(prev => ({ ...prev, ending: false }));
    }
  };


  const resetGame = async () => {
    setLoading(prev => ({ ...prev, resetting: true }));

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetGame', roomCode })
      });

      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setMyPlayer(data.room.players.find((p: any) => p.name === myPlayer.name));
      }
    } catch (error) {
      console.error("Error resetting game", error);
    } finally {
      setLoading(prev => ({ ...prev, resetting: false }));
    }
  };




  // Mostrar loading mientras se restaura la sesión
  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Restaurando sesión...</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu' || (!room && mode !== 'local')) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
          <GameSetup handleJoin={handleJoin} handleLocalPlay={handleLocalPlay} />
        </div>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-linear-to-br from-purple-900 via-purple-900 to-indigo-900 text-center">
      <div className={`bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full
        ${room.game_state === 'setup' ? 'max-w-5xl' : 'max-w-2xl'} 
        `}>

        {room.game_state === 'setup' && (
          <Lobby
            room={room}
            player={myPlayer}
            settingsRoom={room.settings}
            updateSettings={updateSettings}
            onStartGame={startGame}
            onLeaveRoom={LeaveRoom}
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
