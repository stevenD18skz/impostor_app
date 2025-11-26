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

  const confirmRole = async () => {
    await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirmRole', roomCode, playerName })
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

        {room.gameState === 'reveal' && (
          (() => {
            const isReady = room.gameData.readyPlayers?.includes(playerName);
            if (isReady) {
              return (
                <div className="text-center space-y-8">
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 animate-pulse">
                    <h2 className="text-3xl font-bold text-white mb-4">
                      ⏳ Esperando a los demás...
                    </h2>
                    <p className="text-white/80 text-lg">
                      El juego comenzará cuando todos hayan visto su rol.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-white/60">
                      Jugadores listos: {room.gameData.readyPlayers.length}/{room.players.length}
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <RoleReveal 
                player={myPlayer} 
                secretWord={room.gameData.secretWord} 
                onReady={confirmRole} 
              />
            );
          })()
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