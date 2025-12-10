import { useState, useEffect } from 'react';
import { categorias } from '@/app/lib/data';
import SetupState from '@/app/local/components/SetupState';
import NamesState from '@/app/local/components/NamesState';
import RevealState from '@/app/local/components/RevealState';
import PlayingState from '@/app/local/components/PlayingState';
import EndedState from '@/app/local/components/EndedState';

interface Player {
  isImpostor: boolean;
  name: string;
}

interface LocalGameProps {
  onBack: () => void;
}

export default function LocalGame({ onBack }: LocalGameProps) {
  const [gameState, setGameState] = useState('setup'); // setup, names, reveal, playing, ended
  const [numPlayers, setNumPlayers] = useState(4);
  const [numImpostors, setNumImpostors] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('comida');
  const [timeLimit, setTimeLimit] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [playingOrder, setPlayingOrder] = useState<Player[]>([]);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const goToNames = () => {
    if (playerNames.length !== numPlayers) {
      setPlayerNames(Array(numPlayers).fill(''));
    }
    setGameState('names');
  };

  const startGame = () => {
    // @ts-ignore
    const palabras: string[] = categorias[selectedCategory].palabras;
    const word = palabras[Math.floor(Math.random() * palabras.length)];
    setSecretWord(word);

    const playerRoles = Array(numPlayers).fill(false);
    const impostorIndices: number[] = [];

    while (impostorIndices.length < numImpostors) {
      const idx = Math.floor(Math.random() * numPlayers);
      if (!impostorIndices.includes(idx)) {
        impostorIndices.push(idx);
        playerRoles[idx] = true;
      }
    }

    setPlayers(playerRoles.map((isImpostor, idx) => ({
      isImpostor,
      name: playerNames[idx] || `Jugador ${idx + 1}`
    })));
    setGameState('reveal');
    setCurrentPlayer(0);
    setShowRole(false);
    setTimeLeft(timeLimit);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const nextPlayer = () => {
    if (currentPlayer < numPlayers - 1) {
      setCurrentPlayer(currentPlayer + 1);
      setShowRole(false);
    } else {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      setPlayingOrder(shuffled);
      setGameState('playing');
      setIsTimerRunning(true);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentPlayer(0);
    setShowRole(false);
    setPlayers([]);
    setSecretWord('');
    setTimeLeft(timeLimit);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-8 w-full max-w-2xl">
      {gameState === 'setup' && (
        <SetupState
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          numPlayers={numPlayers}
          setNumPlayers={setNumPlayers}
          numImpostors={numImpostors}
          setNumImpostors={setNumImpostors}
          timeLimit={timeLimit}
          setTimeLimit={setTimeLimit}
          onBack={onBack}
          onContinue={goToNames}
        />
      )}

      {gameState === 'names' && (
        <NamesState
          numPlayers={numPlayers}
          playerNames={playerNames}
          updatePlayerName={updatePlayerName}
          onBack={() => setGameState('setup')}
          onStartGame={startGame}
        />
      )}

      {gameState === 'reveal' && (
        <RevealState
          players={players}
          currentPlayer={currentPlayer}
          showRole={showRole}
          setShowRole={setShowRole}
          secretWord={secretWord}
          numPlayers={numPlayers}
          onNextPlayer={nextPlayer}
        />
      )}

      {gameState === 'playing' && (
        <PlayingState
          selectedCategory={selectedCategory}
          timeLeft={timeLeft}
          formatTime={formatTime}
          playingOrder={playingOrder}
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
          onEndGame={() => setGameState('ended')}
          onResetGame={resetGame}
        />
      )}

      {gameState === 'ended' && (
        <EndedState
          secretWord={secretWord}
          players={players}
          onResetGame={resetGame}
        />
      )}
    </div>
  );
}
