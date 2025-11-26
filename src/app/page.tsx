'use client';

import { useState, useEffect } from 'react';
import GameSetup from '@/components/GameSetup';
import Lobby from '@/components/Lobby';
import RoleReveal from '@/components/RoleReveal';
import GameRunning from '@/components/GameRunning';
import GameEnd from '@/components/GameEnd';

export default function ImpostorGame() {
  const [room, setRoom] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // Polling logic
  useEffect(() => {
    if (!roomCode) return;

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
  }, [roomCode]);

  const handleJoin = (code: string, name: string, roomData: any) => {
    setRoomCode(code);
    setPlayerName(name);
    setRoom(roomData);
  };

  const updateSettings = async (settings: any) => {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateSettings', roomCode, settings })
    });
    // Optimistic update or wait for poll
  };

  const startGame = async () => {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'startGame', roomCode })
    });
  };

  const endGame = async () => {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'endGame', roomCode })
    });
  };

  const resetGame = () => {
    setRoom(null);
    setRoomCode('');
    setPlayerName('');
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
          <GameSetup onJoin={handleJoin} />
        </div>
      </div>
    );
  }

  const isHost = room.host === playerName;
  const myPlayer = room.players.find((p: any) => p.name === playerName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        
        {room.gameState === 'setup' && (
          <Lobby 
            room={room} 
            isHost={isHost} 
            onUpdateSettings={updateSettings} 
            onStartGame={startGame} 
          />
        )}

        {room.gameState === 'lobby' && (
           <Lobby 
            room={room} 
            isHost={isHost} 
            onUpdateSettings={updateSettings} 
            onStartGame={startGame} 
          />
        )}

        {room.gameState === 'playing' && (
           // We can handle the "Reveal" phase locally or as a sub-state
           // For simplicity, let's say if we haven't seen our role, show reveal
           // But since we don't have local state for "seen role" yet, let's add it or assume 'playing' starts with reveal
           // Actually, let's use a local state for "ready"
           <GameController 
             room={room} 
             isHost={isHost} 
             myPlayer={myPlayer} 
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

// Sub-component to handle local reveal state
function GameController({ room, isHost, myPlayer, onEndGame }: any) {
  const [hasRevealed, setHasRevealed] = useState(false);

  if (!hasRevealed) {
    return (
      <RoleReveal 
        player={myPlayer} 
        secretWord={room.gameData.secretWord} 
        onReady={() => setHasRevealed(true)} 
      />
    );
  }

  return (
    <GameRunning 
      room={room} 
      isHost={isHost} 
      onEndGame={onEndGame} 
    />
  );
}