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
  const [mode, setMode] = useState<'menu' | 'local' | 'multiplayer'>('menu');
  const [room, setRoom] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [hasRevealed, setHasRevealed] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [myPlayer, setMyPlayer] = useState<any>(null);

  const router = useRouter();

  // Polling logic
  useEffect(() => {
    if (!roomCode || mode !== 'multiplayer') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game?code=${roomCode}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
        } else {
          // Handle error (e.g., room closed)
          console.error("Error fetching room");
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [roomCode, mode]);



  const handleJoin = (code: string, name: string, roomData: any) => {
    setRoomCode(code);
    setPlayerName(name);
    setRoom(roomData);
    setMode('multiplayer');
    setIsHost(roomData.host === name);
    setMyPlayer(roomData.players.find((p: any) => p.name === name));
  };



  const updateSettings = async (settings: any) => {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateSettings', roomCode, settings })
    });
  };



  const startGame = async () => {
    setLoadingState(true);

    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'startGame', roomCode })
      });
    } catch (error) {
      console.error("Error starting game", error);
    } finally {
      setLoadingState(false);
    }
  };



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



  const resetGame = () => {
    setRoom(null);
    setRoomCode('');
    setPlayerName('');
    setMode('menu');
  };



  const handleLocalPlay = () => {
    router.push('/local');
  };



  const LeaveRoom = async () => {
    setMode('menu');
    return

    setLoadingState(true);
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leaveRoom', roomCode })
      });
    } catch (error) {
      console.error("Error leaving room", error);
    } finally {
      setLoadingState(false);
      setMode('menu');
    }
    resetGame();
  };



  const confirmRole = async () => {
    setLoadingState(true);
    try {
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



  if (mode === 'menu' || (!room && mode !== 'local')) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
          <GameSetup onJoin={handleJoin} onLocalPlay={handleLocalPlay} />
        </div>
      </div>
    );
  }

  
  const allPlayersReady = room?.players.every((p: any) => p.ready);
  const playerHasReady = room?.gameData.readyPlayers.find((p: any) => p === playerName);


  return (
    <div className="min-h-screen  bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">

        {room.gameState === 'setup' && (
          <Lobby
            room={room}
            isHost={isHost}
            onUpdateSettings={updateSettings}
            onStartGame={startGame}
            loadingState={loadingState}
            onLeaveRoom={LeaveRoom}
          />
        )}


        {room.gameState === 'reveal' && (
          <RoleReveal
            player={myPlayer}
            secretWord={room.gameData.secretWord}
            onReady={confirmRole}
            playerHasReady={playerHasReady}
            loadingState={loadingState}
          />
        )}


        {room.gameState === 'playing' && (
          <GameRunning
            room={room}
            isHost={isHost}
            onEndGame={endGame}
          />
        )}


        {room.gameState === 'ended' && (
          <GameEnd room={room} onReset={resetGame} />
        )}

      </div>
    </div>
  );
}
