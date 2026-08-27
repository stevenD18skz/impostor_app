export interface Player {
  isImpostor: boolean;
  name: string;
}

export interface GameData {
  gameState: 'names' | 'setup' | 'reveal' | 'playing' | 'ended';
  config: {
    numPlayers: number;
    numImpostors: number;
    selectedCategory: string;
  };
  game: {
    players: Player[];
    playerNames: string[];
    secretWord: string;
    playingOrder: Player[];
    currentPlayer: number;
    showRole: boolean;
  };
}
