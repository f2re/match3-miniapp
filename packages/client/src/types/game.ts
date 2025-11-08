// Tile types enum
export enum TileType {
  EMPTY = 'empty',
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
  SPECIAL_BOMB = 'bomb',
  SPECIAL_ROCKET = 'rocket',
  SPECIAL_RAINBOW = 'rainbow'
}

// Special tile effects
export enum SpecialTileEffect {
  NONE = 'none',
  BOMB = 'bomb',           // Destroys 3x3 area
  ROCKET_H = 'rocket_h',   // Destroys entire row
  ROCKET_V = 'rocket_v',   // Destroys entire column
  RAINBOW = 'rainbow'      // Destroys all tiles of selected color
}

// Grid position interface
export interface GridPosition {
  x: number;
  y: number;
}

// Game tile interface
export interface GameTile {
  type: TileType;
  id: string;
  special?: SpecialTileEffect;
  falling?: boolean;
  matched?: boolean;
  locked?: boolean;
  multiplier?: number;
}

// Match result interface
export interface MatchResult {
  tiles: GridPosition[];
  type: TileType;
  direction: 'horizontal' | 'vertical' | 'l-shape' | 't-shape';
  length: number;
  score: number;
  special?: SpecialTileEffect;
}

// Animation interface for falling tiles
export interface TileAnimation {
  tile: GameTile & { x: number; y: number };
  toX: number;
  toY: number;
  duration: number;
  delay?: number;
}

// Game state interface
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
  combo?: number;
  timeLeft?: number; // For timed modes
  obstacles?: GridPosition[]; // For levels with obstacles
}

// Level configuration
export interface LevelConfig {
  level: number;
  targetScore: number;
  maxMoves: number;
  timeLimit?: number; // For timed levels
  gridWidth: number;
  gridHeight: number;
  tileTypes: TileType[];
  obstacles?: GridPosition[];
  specialTileSpawnRate?: number;
  difficultyModifiers?: {
    cascadeMultiplier: number;
    comboMultiplier: number;
    specialTileBonus: number;
  };
}

// Game statistics
export interface GameStats {
  totalScore: number;
  bestScore: number;
  totalMatches: number;
  totalGames: number;
  avgScore: number;
  longestCombo: number;
  specialTilesCreated: number;
  achievements: Achievement[];
}

// Score configuration
export interface ScoreConfig {
  basePoints: Record<TileType, number>;
  matchMultipliers: Record<number, number>;
  comboMultiplier: number;
  levelBonus: number;
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  reward?: {
    coins?: number;
    lives?: number;
    boosters?: string[];
  };
}

// Power-up/Booster types
export enum BoosterType {
  HAMMER = 'hammer',        // Remove single tile
  BOMB = 'bomb',           // Remove 3x3 area
  ROCKET = 'rocket',       // Remove row/column
  RAINBOW = 'rainbow',     // Remove all tiles of one color
  SHUFFLE = 'shuffle',     // Shuffle board
  EXTRA_MOVES = 'moves'    // Add extra moves
}

export interface Booster {
  type: BoosterType;
  count: number;
  cost: number; // In coins
  description: string;
  icon: string;
}

// Game events for communication between scenes
export interface GameEvent {
  type: 'score_updated' | 'level_complete' | 'game_over' | 'moves_updated' | 'special_created' | 'achievement_unlocked';
  data?: any;
}

// Sound configuration
export interface SoundConfig {
  enabled: boolean;
  volume: number;
  effects: {
    match: boolean;
    swap: boolean;
    fall: boolean;
    special: boolean;
    levelComplete: boolean;
    gameOver: boolean;
  };
}

// Visual effects configuration
export interface EffectsConfig {
  particles: boolean;
  screenShake: boolean;
  tileGlow: boolean;
  cascadeEffects: boolean;
  qualityLevel: 'low' | 'medium' | 'high';
}

// Game mode definitions
export enum GameMode {
  CLASSIC = 'classic',     // Standard move-based gameplay
  TIMED = 'timed',        // Time-limited gameplay
  ENDLESS = 'endless',    // No move limit, play until no moves
  PUZZLE = 'puzzle',      // Specific objectives per level
  CHALLENGE = 'challenge' // Daily/weekly challenges
}

// Leaderboard entry
export interface LeaderboardEntry {
  userId: number;
  username: string;
  firstName: string;
  lastName?: string;
  score: number;
  level: number;
  rank: number;
  avatar?: string;
  country?: string;
}

// Export utility functions types
export type GridValidator = (grid: GameTile[][]) => boolean;
export type MatchFinder = (grid: GameTile[][]) => MatchResult[];
export type ScoreCalculator = (matches: MatchResult[], combo: number) => number;
export type TileGenerator = (excludeTypes?: TileType[]) => TileType;
export type AnimationCallback = () => void;

// Re-export commonly used types
export type { GameTile as Tile };
export type { GridPosition as Position };
export type { MatchResult as Match };
export type { GameState as State };
export type { LevelConfig as Level };