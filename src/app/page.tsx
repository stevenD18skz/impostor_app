'use client';

import { useState, useEffect } from 'react';
import GameSetup from '@/components/GameSetup';
import Lobby from '@/components/Lobby';
import RoleReveal from '@/components/RoleReveal';
import GameRunning from '@/components/GameRunning';
import GameEnd from '@/components/GameEnd';
import LocalGame from '@/app/local/components/LocalGame';
import { useRouter } from 'next/navigation';

export default function ImpostorGame() {
  // Room state
  const [mode, setMode] = useState<'menu' | 'local' | 'multiplayer'>('menu');
  const [room, setRoom] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');

  // Game state
  const [loadingState, setLoadingState] = useState(false);
  const [myPlayer, setMyPlayer] = useState<any>(null);

  // Navigation
  const router = useRouter();

  // Polling logic
  useEffect(() => {
    if (!roomCode || mode !== 'multiplayer') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game?code=${roomCode}`);
        console.log("res ============================aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
          // Actualizar myPlayer también para todos los jugadores (no solo el host)
          if (data.players && myPlayer) {
            const updatedPlayer = data.players.find((p: any) => p.name === myPlayer.name);
            if (updatedPlayer) {
              setMyPlayer(updatedPlayer);
            }
          }
        } else {
          // Handle error (e.g., room closed)
          console.error("Error fetching room");
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [roomCode, mode, myPlayer]);



  // GAME SETUP
  const handleJoin = (code: string, roomData: any, myPlayer: any) => {
    setRoomCode(code);
    setRoom(roomData);
    setMyPlayer(myPlayer);
    setMode('multiplayer');
  };


  const handleLocalPlay = () => {
    router.push('/local');
  };



  // LOBBY
  const updateSettings = async (settings: any) => {
    setLoadingState(true);
    try {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateSettings', roomCode, settings })
    });
    } catch (error) {
      console.error("Error updating settings", error);
    } finally {
      setLoadingState(false);
    }
  };


  const startGame = async () => {
    setLoadingState(true);

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
      setLoadingState(false);
    }
  };


  const LeaveRoom = async () => {
    setMode('menu');
  };



  // ROLE REVEAL
  const confirmRole = async () => {
    setLoadingState(true);
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
      setLoadingState(false);
    }
  };



  // GAME END
  const endGame = async () => {
    setLoadingState(true);

    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'endGame', roomCode })
      });
    } catch (error) {
      console.error("Error ending game", error);
    } finally {
      setLoadingState(false);
    }
  };


  const resetGame = async () => {
    setLoadingState(true);

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
      setLoadingState(false);
    }
  };

  


  if (mode === 'menu' || (!room && mode !== 'local')) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
          <GameSetup handleJoin={handleJoin} handleLocalPlay={handleLocalPlay} />
        </div>
      </div>
    );
  }


  const playerHasReady = room?.game_data.readyPlayers.find((p: any) => p === myPlayer.name);


  return (
    <div className="min-h-screen  bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">

        {room.game_state === 'setup' && (
          <Lobby
            room={room}
            player={myPlayer}
            settingsRoom={room.settings}
            onStartGame={startGame}
            onLeaveRoom={LeaveRoom}
            loadingState={loadingState}
          />
        )}


        {room.game_state === 'reveal' && (
          <RoleReveal
            player={myPlayer}
            secretWord={room.game_data.secretWord}
            onReady={confirmRole}
            playerHasReady={playerHasReady}
            loadingState={loadingState}
          />
        )}


        {room.game_state === 'playing' && (
          <GameRunning
            room={room}
            onEndGame={endGame}
          />
        )}


        {room.game_state === 'ended' && (
          <GameEnd room={room} onReset={resetGame} />
        )}
      </div>
    </div>
  );
}
