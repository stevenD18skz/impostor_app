'use client';

import { useState, useEffect } from 'react';
import { categorias } from '@/lib/data';
import SetupState from '@/app/local/components/SetupState';
import NamesState from '@/app/local/components/NamesState';
import RevealState from '@/app/local/components/RevealState';
import PlayingState from '@/app/local/components/PlayingState';
import EndedState from '@/app/local/components/EndedState';
import { useRouter } from 'next/navigation';
import { GameData } from '@/app/types/local';

const DEFAULT_NUM_PLAYERS = 4;

const initialGameData: GameData = {
  gameState: 'names',
  config: {
    numPlayers: DEFAULT_NUM_PLAYERS,
    numImpostors: 1,
    selectedCategory: 'comida',
    timeLimit: 180,
    noTimeLimit: false,
  },
  game: {
    players: [],
    playerNames: Array(DEFAULT_NUM_PLAYERS).fill(''),
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
    if (gameData.config.noTimeLimit) return;
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
  }, [gameData.timer.isTimerRunning, gameData.timer.timeLeft, gameData.config.noTimeLimit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'selectedCategory') {
      setGameData(prev => ({
        ...prev,
        config: { ...prev.config, [name]: value }
      }));
    } else if (name === 'noTimeLimit') {
      const checked = (e.target as HTMLInputElement).checked;
      setGameData(prev => ({
        ...prev,
        config: { ...prev.config, noTimeLimit: checked }
      }));
    } else if (name.startsWith('playerName-')) {
      const index = parseInt(name.split('-')[1]);
      setGameData(prev => ({
        ...prev,
        game: {
          ...prev.game,
          playerNames: prev.game.playerNames.map((n, i) => i === index ? value : n)
        }
      }));
    } else {
      const parsed = parseInt(value);
      if (name === 'numPlayers') {
        setGameData(prev => {
          const newNames = Array(parsed).fill('').map((_, i) => prev.game.playerNames[i] || '');
          const maxImpostors = Math.floor(parsed / 2);
          return {
            ...prev,
            config: {
              ...prev.config,
              numPlayers: parsed,
              numImpostors: Math.min(prev.config.numImpostors, maxImpostors)
            },
            game: { ...prev.game, playerNames: newNames }
          };
        });
      } else {
        setGameData(prev => ({
          ...prev,
          config: { ...prev.config, [name]: parsed }
        }));
      }
    }
  };

  // Names → Setup
  const goToSetup = (names: string[]) => {
    setGameData(prev => {
      const maxImpostors = Math.floor(names.length / 2);
      return {
        ...prev,
        gameState: 'setup',
        config: {
          ...prev.config,
          numPlayers: names.length,
          numImpostors: Math.min(prev.config.numImpostors, maxImpostors)
        },
        game: { ...prev.game, playerNames: names }
      };
    });
  };

  // Setup → Reveal (start game)
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
          timeLeft: prev.config.noTimeLimit ? 0 : prev.config.timeLimit,
          isTimerRunning: false
        }
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
          game: { ...prev.game, playingOrder: shuffled, showRole: false },
          timer: {
            ...prev.timer,
            isTimerRunning: !prev.config.noTimeLimit
          }
        };
      }
    });
  };

  // Nueva partida: mantiene nombres y config, vuelve a setup
  const resetGame = () => {
    setGameData(prev => ({
      ...initialGameData,
      gameState: 'setup',
      config: prev.config,
      game: {
        ...initialGameData.game,
        playerNames: prev.game.playerNames,
      },
      timer: {
        timeLeft: prev.config.noTimeLimit ? 0 : prev.config.timeLimit,
        isTimerRunning: false
      }
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => router.back();

  const handleShowRole = () => {
    setGameData(prev => ({
      ...prev,
      game: { ...prev.game, showRole: true }
    }));
  };

  const handleTimerRunning = (running: boolean) => {
    setGameData(prev => ({
      ...prev,
      timer: { ...prev.timer, isTimerRunning: running }
    }));
  };

  const handleEndGame = () => {
    setGameData(prev => ({ ...prev, gameState: 'ended' }));
  };

  const handleIncrement = (field: string, max: number, step: number = 1) => {
    const currentValue = gameData.config[field as keyof typeof gameData.config] as number;
    if (currentValue < max) {
      const newValue = Math.min(currentValue + step, max);
      handleChange({ target: { name: field, value: newValue.toString() } } as any);
    }
  };

  const handleDecrement = (field: string, min: number, step: number = 1) => {
    const currentValue = gameData.config[field as keyof typeof gameData.config] as number;
    if (currentValue > min) {
      const newValue = Math.max(currentValue - step, min);
      handleChange({ target: { name: field, value: newValue.toString() } } as any);
    }
  };

  return (
    /* Mobile: full screen, no floating. Desktop: centered card */
    <div className="game-root">
      <div className="game-container">
        {gameData.gameState === 'names' && (
          <NamesState
            gameData={gameData}
            handleChange={handleChange}
            onBack={handleBack}
            onContinue={goToSetup}
          />
        )}

        {gameData.gameState === 'setup' && (
          <SetupState
            config={gameData.config}
            handleChange={handleChange}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
            onBack={() => setGameData(prev => ({ ...prev, gameState: 'names' }))}
            onContinue={startGame}
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
        )}
      </div>
    </div>
  );
}
