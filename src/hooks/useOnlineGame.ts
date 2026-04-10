import { useState, useCallback, useEffect } from 'react';
import { useRealtimeRoom } from './useRealtimeRoom';

export function useOnlineGame() {
  const [mode, setMode] = useState<'menu' | 'online_setup' | 'local' | 'multiplayer'>('menu');
  const [room, setRoom] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  
  const [myPlayer, setMyPlayer] = useState<any>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [playerHasReady, setPlayerHasReady] = useState(false);

  const [loading, setLoading] = useState({
    leaving: false,
    updating: false,
    starting: false,
    confirming: false,
    ending: false,
    resetting: false
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedRoomCode = localStorage.getItem('impostor_roomCode');
        const savedPlayerName = localStorage.getItem('impostor_playerName');
        const savedMode = localStorage.getItem('impostor_mode');

        if (savedRoomCode && savedPlayerName && savedMode === 'multiplayer') {
          console.log('Restaurando sesión...', { savedRoomCode, savedPlayerName });

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
            localStorage.removeItem('impostor_roomCode');
            localStorage.removeItem('impostor_playerName');
            localStorage.removeItem('impostor_mode');
          } else {
            setRoomCode(data.roomCode);
            setRoom(data.room);
            setMyPlayer(data.myPlayer);
            setMode('multiplayer');
            console.log('Sesión restaurada exitosamente');
          }
        }
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('impostor_roomCode');
        localStorage.removeItem('impostor_playerName');
        localStorage.removeItem('impostor_mode');
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleRoomUpdate = useCallback((updatedRoom: any) => {
    setRoom(updatedRoom);
  }, []);

  const handlePlayerUpdate = useCallback((updatedPlayer: any) => {
    setMyPlayer(updatedPlayer);
  }, []);

  useRealtimeRoom(
    roomCode,
    mode === 'multiplayer',
    myPlayer?.name || '',
    handleRoomUpdate,
    handlePlayerUpdate
  );

  const handleJoin = (code: string, roomData: any, player: any) => {
    setRoomCode(code);
    setRoom(roomData);
    setMyPlayer(player);
    setMode('multiplayer');

    localStorage.setItem('impostor_roomCode', code);
    localStorage.setItem('impostor_playerName', player.name);
    localStorage.setItem('impostor_mode', 'multiplayer');
  };

  const updateSettings = async (settings: any) => {
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
      if (data?.room) setRoom(data.room);
      if (data?.room?.players) {
        setMyPlayer(data.room.players.find((p: any) => p.name === myPlayer.name));
      }
    } catch (error) {
      console.error("Error starting game", error);
    } finally {
      setLoading(prev => ({ ...prev, starting: false }));
    }
  };

  const leaveRoom = async () => {
    setLoading(prev => ({ ...prev, leaving: true }));
    try {
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
      localStorage.removeItem('impostor_roomCode');
      localStorage.removeItem('impostor_playerName');
      localStorage.removeItem('impostor_mode');

      setRoom(null);
      setRoomCode('');
      setMyPlayer(null);
      setMode('menu');
      setLoading(prev => ({ ...prev, leaving: false }));
    }
  };

  const confirmRole = async () => {
    setLoading(prev => ({ ...prev, confirming: true }));
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmRole', roomCode, playerName: myPlayer.name })
      });
    } catch (error) {
      console.error("Error confirming role", error);
    } finally {
      setLoading(prev => ({ ...prev, confirming: false }));
      setPlayerHasReady(true);
    }
  };

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

  return {
    mode, setMode,
    room, roomCode,
    myPlayer, playerHasReady,
    isRestoringSession, loading,
    handleJoin, updateSettings, startGame,
    leaveRoom, confirmRole, endGame, resetGame
  };
}
