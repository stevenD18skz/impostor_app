'use client';

import { useState } from 'react';
import { resolveCategory } from '@/lib/categories';
import { impostorsFor, rollVariant, shuffle } from '@/lib/room';
import SetupState from '@/app/local/components/SetupState';
import NamesState from '@/app/local/components/NamesState';
import RevealState from '@/app/local/components/RevealState';
import PlayingState from '@/app/local/components/PlayingState';
import EndedState from '@/app/local/components/EndedState';
import { useRouter } from 'next/navigation';
import type { FieldChange, GameData, NumericConfigField } from '@/app/types/local';

const DEFAULT_NUM_PLAYERS = 4;

const initialGameData: GameData = {
  gameState: 'names',
  config: {
    numPlayers: DEFAULT_NUM_PLAYERS,
    numImpostors: 1,
    selectedCategory: 'comida',
    custom: null,
    orderMode: 'lista',
    chaos: false,
  },
  game: {
    players: [],
    playerNames: Array(DEFAULT_NUM_PLAYERS).fill(''),
    secretWord: '',
    categoryName: '',
    playingOrder: [],
    currentPlayer: 0,
    showRole: false,
    start: null,
    variant: 'normal',
  },
  lastWasChaos: false,
};

export default function LocalGame() {
  const [gameData, setGameData] = useState<GameData>(initialGameData);
  const router = useRouter();

  const handleChange = (e: FieldChange) => {
    const { name, value } = e.target;

    if (name === 'selectedCategory') {
      setGameData(prev => ({
        ...prev,
        config: { ...prev.config, [name]: value }
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
      const category = resolveCategory({
        category: prev.config.selectedCategory,
        custom: prev.config.custom,
      });
      if (!category) return prev;

      const word = category.palabras[Math.floor(Math.random() * category.palabras.length)];

      // El modo caos puede torcer la ronda: repartir a todos, a nadie o a la
      // mitad. Fuera de eso reparte lo que diga la configuración.
      const variant = rollVariant(prev.config.numPlayers, prev.config, prev.lastWasChaos);
      const wanted = impostorsFor(variant, prev.config.numPlayers, prev.config);

      const seats = shuffle(
        Array.from({ length: prev.config.numPlayers }, (_, i) => i),
      ).slice(0, wanted);

      const players = Array.from({ length: prev.config.numPlayers }, (_, idx) => ({
        isImpostor: seats.includes(idx),
        name: prev.game.playerNames[idx] || `Jugador ${idx + 1}`
      }));

      return {
        ...prev,
        gameState: 'reveal',
        lastWasChaos: variant !== 'normal',
        game: {
          ...prev.game,
          secretWord: word,
          categoryName: category.nombre,
          players,
          currentPlayer: 0,
          showRole: false,
          start: null,
          variant,
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
        const shuffled = shuffle(prev.game.players);
        return {
          ...prev,
          gameState: 'playing',
          game: {
            ...prev.game,
            playingOrder: shuffled,
            showRole: false,
            start:
              prev.config.orderMode === 'circulo'
                ? {
                    name: shuffled[0].name,
                    dir: Math.random() < 0.5 ? 'horario' : 'antihorario',
                  }
                : null,
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
      lastWasChaos: prev.lastWasChaos,
      game: {
        ...initialGameData.game,
        playerNames: prev.game.playerNames,
      },
    }));
  };

  /** Para los ajustes que no vienen de un `<input name=...>`: interruptores y elecciones. */
  const updateConfig = (patch: Partial<GameData['config']>) =>
    setGameData(prev => ({ ...prev, config: { ...prev.config, ...patch } }));

  const handleBack = () => router.back();

  const handleShowRole = () => {
    setGameData(prev => ({
      ...prev,
      game: { ...prev.game, showRole: true }
    }));
  };

  const handleEndGame = () => {
    setGameData(prev => ({ ...prev, gameState: 'ended' }));
  };

  const handleIncrement = (field: NumericConfigField, max: number, step: number = 1) => {
    const currentValue = gameData.config[field];
    if (currentValue < max) {
      const newValue = Math.min(currentValue + step, max);
      handleChange({ target: { name: field, value: String(newValue) } });
    }
  };

  const handleDecrement = (field: NumericConfigField, min: number, step: number = 1) => {
    const currentValue = gameData.config[field];
    if (currentValue > min) {
      const newValue = Math.max(currentValue - step, min);
      handleChange({ target: { name: field, value: String(newValue) } });
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-slate-900 font-vt323 selection:bg-pink-600 selection:text-white"
         style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      <div className="relative bg-slate-800 border-[6px] border-cyan-800 shadow-[0_0_30px_rgba(34,211,238,0.15)] p-4 sm:p-8 w-full max-w-2xl text-center z-10 m-4">
        <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600"></div>
        <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600"></div>
        <div className="absolute inset-4 border-2 border-slate-700/50 pointer-events-none"></div>

        <div className="relative z-10">
          {gameData.gameState === 'names' && (
            <NamesState
              gameData={gameData}
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
              updateConfig={updateConfig}
              onBack={() => setGameData(prev => ({ ...prev, gameState: 'names' }))}
              onContinue={startGame}
            />
          )}

          {gameData.gameState === 'reveal' && (
            <RevealState
              key={gameData.game.currentPlayer}
              gameData={gameData}
              setShowRole={handleShowRole}
              onNextPlayer={nextPlayer}
            />
          )}

          {gameData.gameState === 'playing' && (
            <PlayingState
              gameData={gameData}
              onEndGame={handleEndGame}
            />
          )}

          {gameData.gameState === 'ended' && (
            <EndedState
              secretWord={gameData.game.secretWord}
              players={gameData.game.players}
              variant={gameData.game.variant}
              onResetGame={resetGame}
            />
          )}
        </div>
      </div>
    </div>
  );
}
