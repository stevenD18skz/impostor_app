import type { CategoryWords } from '@/lib/categories';
import type { Direction, OrderMode, Variant } from '@/lib/room';

export interface Player {
  isImpostor: boolean;
  name: string;
}

export interface GameData {
  gameState: 'names' | 'setup' | 'reveal' | 'playing' | 'ended';
  config: {
    numPlayers: number;
    numImpostors: number;
    /** Clave dentro de `categorias`. Se ignora si hay `custom`. */
    selectedCategory: string;
    /** Categoría inventada, guardada en este navegador. */
    custom: CategoryWords | null;
    orderMode: OrderMode;
    chaos: boolean;
    /** Si en partida se puede volver a mirar la propia carta. */
    allowPeek: boolean;
  };
  game: {
    players: Player[];
    playerNames: string[];
    secretWord: string;
    /** El nombre legible de la categoría con la que se está jugando. */
    categoryName: string;
    playingOrder: Player[];
    currentPlayer: number;
    showRole: boolean;
    /** Solo en modo círculo: quién abre y hacia dónde sigue. */
    start: { name: string; dir: Direction } | null;
    /** Qué clase de ronda tocó. No se destapa hasta el final. */
    variant: Variant;
  };
  /** Para no encadenar dos rondas caóticas seguidas. */
  lastWasChaos: boolean;
}

/**
 * Lo mínimo que necesita un manejador de cambio de campo.
 *
 * Un `ChangeEvent` de React encaja aquí tal cual, y los botones de más y menos
 * pueden llamarlo con un objeto normal en vez de fabricar un evento falso.
 */
export type FieldChange = { target: { name: string; value: string } };

/** Los ajustes que son un número: los únicos con botones de más y menos. */
export type NumericConfigField = 'numPlayers' | 'numImpostors';
