// Shared types for Match-3 game

export interface Tile {
  id: string;
  type: TileType;
  x: number;
  y: number;
  isSelected: boolean;
  isMatched: boolean;
  isFalling: boolean;
}

export enum TileType {
  RED = 0,
  BLUE = 1,
  GREEN = 2,
  YELLOW = 3,
  PURPLE = 4,
  ORANGE = 5,
  SPECIAL = 6,
  EMPTY = -1
}

export interface GameState {
  grid: Tile[][];
  score: number;
  moves: number;
  level: number;
  isGameActive: boolean;
  selectedTile: Tile | null;
  combo: number;
  timeLeft?: number;
}

export interface Match {
  tiles: Tile[];
  type: 'horizontal' | 'vertical' | 'l-shape' | 't-shape';
  length: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  tileTypes: number;
  initialMoves: number;
  scoreTargets: number[];
  timeLimit?: number;
}

export interface LevelConfig extends GameConfig {
  id: number;
  name: string;
  description: string;
  objectives: LevelObjective[];
}

export interface LevelObjective {
  type: 'score' | 'tiles' | 'time';
  target: number;
  current: number;
  completed: boolean;
}

export interface GameStats {
  totalMatches: number;
  longestCombo: number;
  totalScore: number;
  perfectMoves: number;
  specialTilesCreated: number;
}

export interface PlayerProgress {
  currentLevel: number;
  unlockedLevels: number[];
  totalScore: number;
  gamesPlayed: number;
  bestCombo: number;
  achievements: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}