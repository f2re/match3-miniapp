// Game tile types and colors
export enum TileType {
  EMPTY = 0,
  RED = 1,
  BLUE = 2,
  GREEN = 3,
  YELLOW = 4,
  PURPLE = 5,
  ORANGE = 6
}

// Game tile interface
export interface GameTile {
  type: TileType;
  x: number;
  y: number;
  sprite?: Phaser.GameObjects.Sprite;
  falling?: boolean;
  matched?: boolean;
  id: string;
}

// Grid position
export interface GridPosition {
  x: number;
  y: number;
}

// Match result
export interface MatchResult {
  tiles: GridPosition[];
  type: TileType;
  direction: 'horizontal' | 'vertical';
  length: number;
}

// Game state
export interface GameState {
  grid: GameTile[][];
  score: number;
  moves: number;
  level: number;
  targetScore: number;
  maxMoves: number;
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'levelComplete';
  selectedTile: GridPosition | null;
  animating: boolean;
}

// Level configuration
export interface LevelConfig {
  level: number;
  targetScore: number;
  maxMoves: number;
  gridWidth: number;
  gridHeight: number;
  tileTypes: TileType[];
  specialRules?: {
    blockedCells?: GridPosition[];
    objectiveTiles?: { type: TileType; count: number }[];
  };
}

// Animation types
export interface TileAnimation {
  tile: GameTile;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration: number;
  type: 'fall' | 'swap' | 'match' | 'spawn';
}

// Game events
export type GameEvent = 
  | { type: 'TILE_SELECTED'; payload: GridPosition }
  | { type: 'TILES_SWAPPED'; payload: { from: GridPosition; to: GridPosition } }
  | { type: 'MATCH_FOUND'; payload: MatchResult[] }
  | { type: 'TILES_FALLING'; payload: TileAnimation[] }
  | { type: 'SCORE_UPDATED'; payload: number }
  | { type: 'MOVE_MADE'; payload: number }
  | { type: 'LEVEL_COMPLETE'; payload: { score: number; stars: number } }
  | { type: 'GAME_OVER'; payload: { finalScore: number } };

// Score calculation
export interface ScoreConfig {
  basePoints: { [key in TileType]?: number };
  matchMultipliers: { [length: number]: number };
  comboMultiplier: number;
  levelBonus: number;
}

// Power-ups and special tiles
export enum PowerUpType {
  BOMB = 'bomb',
  ROW_CLEAR = 'row_clear',
  COLUMN_CLEAR = 'column_clear',
  COLOR_BOMB = 'color_bomb'
}

export interface PowerUp {
  type: PowerUpType;
  position: GridPosition;
  activated: boolean;
}
