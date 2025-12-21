export interface Player {
  isImpostor: boolean;
  name: string;
}

export interface GameData {
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

