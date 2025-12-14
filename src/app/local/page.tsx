'use client';

import { useState, useEffect } from 'react';
import { categorias } from '@/app/lib/data';
import SetupState from '@/app/local/components/SetupState';
import NamesState from '@/app/local/components/NamesState';
import RevealState from '@/app/local/components/RevealState';
import PlayingState from '@/app/local/components/PlayingState';
import EndedState from '@/app/local/components/EndedState';
import { useRouter } from 'next/navigation';

interface Player {
  isImpostor: boolean;
  name: string;
}

interface GameData {
  gameState: 'setup' | 'names' | 'reveal' | 'playing' | 'ended';
  config: {
    numPlayers: number;
    numImpostors: number;
    selectedCategory: string;
    timeLimit: number;
  };
  game: {
    players: Player[];
    playerNames: string[];
    secretWord: string;
    playingOrder: Player[];
    currentPlayer: number;
    showRole: boolean;
  };
  timer: {
    timeLeft: number;
    isTimerRunning: boolean;
  };
}

const initialGameData: GameData = {
  gameState: 'setup',
  config: {
    numPlayers: 4,
    numImpostors: 1,
    selectedCategory: 'comida',
    timeLimit: 180,
  },
  game: {
    players: [],
    playerNames: [],
    secretWord: '',
    playingOrder: [],
    currentPlayer: 0,
    showRole: false,
  },
  timer: {
    timeLeft: 180,
    isTimerRunning: false,
  },
};

export default function LocalGame() {
  const [gameData, setGameData] = useState<GameData>(initialGameData);
  const router = useRouter();

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (gameData.timer.isTimerRunning && gameData.timer.timeLeft > 0) {
      interval = setInterval(() => {
        setGameData(prev => {
          if (prev.timer.timeLeft <= 1) {
            return {
              ...prev,
              gameState: 'ended',
              timer: { ...prev.timer, timeLeft: 0, isTimerRunning: false }
            };
          }
          return {
            ...prev,
            timer: { ...prev.timer, timeLeft: prev.timer.timeLeft - 1 }
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameData.timer.isTimerRunning, gameData.timer.timeLeft]);

  const goToNames = () => {
    setGameData(prev => {
      const newPlayerNames = prev.game.playerNames.length !== prev.config.numPlayers
        ? Array(prev.config.numPlayers).fill('')
        : prev.game.playerNames;
      return {
        ...prev,
        gameState: 'names',
        game: { ...prev.game, playerNames: newPlayerNames }
      };
    });
  };

  const startGame = () => {
    setGameData(prev => {
      // @ts-ignore
      const palabras: string[] = categorias[prev.config.selectedCategory].palabras;
      const word = palabras[Math.floor(Math.random() * palabras.length)];

      const playerRoles = Array(prev.config.numPlayers).fill(false);
      const impostorIndices: number[] = [];

      while (impostorIndices.length < prev.config.numImpostors) {
        const idx = Math.floor(Math.random() * prev.config.numPlayers);
        if (!impostorIndices.includes(idx)) {
          impostorIndices.push(idx);
          playerRoles[idx] = true;
        }
      }

      const players = playerRoles.map((isImpostor, idx) => ({
        isImpostor,
        name: prev.game.playerNames[idx] || `Jugador ${idx + 1}`
      }));

      return {
        ...prev,
        gameState: 'reveal',
        game: {
          ...prev.game,
          secretWord: word,
          players,
          currentPlayer: 0,
          showRole: false
        },
        timer: {
          ...prev.timer,
          timeLeft: prev.config.timeLimit
        }
      };
    });
  };

  const updatePlayerName = (index: number, name: string) => {
    setGameData(prev => {
      const newNames = [...prev.game.playerNames];
      newNames[index] = name;
      return {
        ...prev,
        game: { ...prev.game, playerNames: newNames }
      };
    });
  };

  const nextPlayer = () => {
    setGameData(prev => {
      if (prev.game.currentPlayer < prev.config.numPlayers - 1) {
        return {
          ...prev,
          game: {
            ...prev.game,
            currentPlayer: prev.game.currentPlayer + 1,
            showRole: false
          }
        };
      } else {
        const shuffled = [...prev.game.players].sort(() => Math.random() - 0.5);
        return {
          ...prev,
          gameState: 'playing',
          game: {
            ...prev.game,
            playingOrder: shuffled
          },
          timer: {
            ...prev.timer,
            isTimerRunning: true
          }
        };
      }
    });
  };

  const resetGame = () => {
    setGameData(prev => ({
      ...initialGameData,
      config: prev.config, // Mantener la configuración actual
      timer: { ...initialGameData.timer, timeLeft: prev.config.timeLimit }
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="text-center space-y-8 w-full min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        {gameData.gameState === 'setup' && (
          <SetupState
            selectedCategory={gameData.config.selectedCategory}
            setSelectedCategory={(category) => {
              setGameData(prev => ({
                ...prev,
                config: { ...prev.config, selectedCategory: category }
              }));
            }}
            numPlayers={gameData.config.numPlayers}
            setNumPlayers={(num) => {
              setGameData(prev => ({
                ...prev,
                config: { ...prev.config, numPlayers: num }
              }));
            }}
            numImpostors={gameData.config.numImpostors}
            setNumImpostors={(num) => {
              setGameData(prev => ({
                ...prev,
                config: { ...prev.config, numImpostors: num }
              }));
            }}
            timeLimit={gameData.config.timeLimit}
            setTimeLimit={(time) => {
              setGameData(prev => ({
                ...prev,
                config: { ...prev.config, timeLimit: time }
              }));
            }}
            onBack={handleBack}
            onContinue={goToNames}
          />
        )}

        {gameData.gameState === 'names' && (
          <NamesState
            numPlayers={gameData.config.numPlayers}
            playerNames={gameData.game.playerNames}
            updatePlayerName={updatePlayerName}
            onBack={() => setGameData(prev => ({ ...prev, gameState: 'setup' }))}
            onStartGame={startGame}
          />
        )}

        {gameData.gameState === 'reveal' && (
          <RevealState
            players={gameData.game.players}
            currentPlayer={gameData.game.currentPlayer}
            showRole={gameData.game.showRole}
            setShowRole={(show) => {
              setGameData(prev => ({
                ...prev,
                game: { ...prev.game, showRole: show }
              }));
            }}
            secretWord={gameData.game.secretWord}
            numPlayers={gameData.config.numPlayers}
            onNextPlayer={nextPlayer}
          />
        )}

        {gameData.gameState === 'playing' && (
          <PlayingState
            selectedCategory={gameData.config.selectedCategory}
            timeLeft={gameData.timer.timeLeft}
            formatTime={formatTime}
            playingOrder={gameData.game.playingOrder}
            isTimerRunning={gameData.timer.isTimerRunning}
            setIsTimerRunning={(running) => {
              setGameData(prev => ({
                ...prev,
                timer: { ...prev.timer, isTimerRunning: running }
              }));
            }}
            onEndGame={() => setGameData(prev => ({ ...prev, gameState: 'ended' }))}
            onResetGame={resetGame}
          />
        )}

        {gameData.gameState === 'ended' && (
          <EndedState
            secretWord={gameData.game.secretWord}
            players={gameData.game.players}
            onResetGame={resetGame}
          />
        )}</div>
    </div>
  );
}
