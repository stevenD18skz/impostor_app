'use client';

import { useState, useEffect } from 'react';
import { categorias } from '@/app/lib/data';
import SetupState from '@/app/local/components/SetupState';
import NamesState from '@/app/local/components/NamesState';
import RevealState from '@/app/local/components/RevealState';
import PlayingState from '@/app/local/components/PlayingState';
import EndedState from '@/app/local/components/EndedState';
import { useRouter } from 'next/navigation';
import { GameData } from '@/app/local/types/local';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'selectedCategory') {
      setGameData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [name]: value
        }
      }));
    }
    else if (name.startsWith('playerName-')) {
      const index = parseInt(name.split('-')[1]);
      setGameData(prev => ({
        ...prev,
        game: {
          ...prev.game,
          playerNames: prev.game.playerNames.map((name, i) => i === index ? value : name)
        }
      }));
    }
    else {
      setGameData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [name]: parseInt(value)
        }
      }));
    }
  };

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

  const handleShowRole = () => {
    setGameData(prev => ({
      ...prev,
      game: {
        ...prev.game,
        showRole: true
      }
    }));
  };

  const handleTimerRunning = (running: boolean) => {
    setGameData(prev => ({
      ...prev,
      timer: { ...prev.timer, isTimerRunning: running }
    }));
  };

  const handleEndGame = () => {
    setGameData(prev => ({
      ...prev,
      gameState: 'ended'
    }));
  };

  const handleBackNames = () => {
    setGameData(prev => ({
      ...prev,
      gameState: 'setup'
    }));
  };


  return (
    <div className="flex items-center justify-center space-y-8 text-center w-full min-h-screen p-4 bg-linear-to-br from-indigo-900 to-purple-900">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
        {gameData.gameState === 'setup' && (
          <SetupState
            config={gameData.config}
            handleChange={handleChange}
            onBack={handleBack}
            onContinue={goToNames}
          />
        )}

        {gameData.gameState === 'names' && (
          <NamesState
            gameData={gameData}
            handleChange={handleChange}
            onBack={handleBackNames}
            onStartGame={startGame}
          />
        )}

        {gameData.gameState === 'reveal' && (
          <RevealState
            gameData={gameData}
            setShowRole={handleShowRole}
            onNextPlayer={nextPlayer}
          />
        )}

        {gameData.gameState === 'playing' && (
          <PlayingState
            gameData={gameData}
            formatTime={formatTime}
            setIsTimerRunning={handleTimerRunning}
            onEndGame={handleEndGame}
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
