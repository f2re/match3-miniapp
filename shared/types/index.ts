// User-related types
export * from './user';

// Game-related types
export * from './game';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Common API types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GameData {
  userId: string;
  score: number;
  level: number;
  moves: number;
  board: number[][];
  achievements: string[];
  lastPlayed: Date;
  gameMode: 'classic' | 'timed' | 'endless';
  difficulty: 'easy' | 'medium' | 'hard';
  gameState?: any; // Serialized game state
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  level: number;
  moves: number;
  gameMode: string;
  completed: boolean;
  duration?: number; // in seconds
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  firstName: string;
  lastName?: string;
  score: number;
  level: number;
  rank: number;
  avatar?: string;
  isCurrentUser?: boolean;
  countryCode?: string;
  lastActive?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'level' | 'special' | 'streak' | 'challenge';
  requirement: {
    type: 'score' | 'level' | 'matches' | 'streak' | 'special_tiles' | 'games_played';
    value: number;
  };
  reward: {
    coins?: number;
    lives?: number;
    experience?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked?: boolean;
  unlockedAt?: Date;
  progress?: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

// Database-related types
export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Configuration types
export interface ServerConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  database: DatabaseConnection;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  telegram: {
    botToken: string;
    webhookUrl?: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

// Request/Response types for API endpoints
export interface CreateUserRequest {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  level?: number;
  lives?: number;
  coins?: number;
}

export interface SaveGameStateRequest {
  userId: string;
  gameState: {
    score: number;
    level: number;
    lives: number;
    coins: number;
    soundEnabled: boolean;
    musicEnabled: boolean;
    vibrationEnabled: boolean;
    lastPlayed: string;
  };
}

export interface SubmitScoreRequest {
  userId: string;
  score: number;
  level: number;
  gameMode?: string;
  moves?: number;
  timeSpent?: number;
}

export interface GetLeaderboardRequest {
  limit?: number;
  offset?: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all';
}

// Utility types
export type RequestHandler<T = any> = (req: any, res: any, next: any) => Promise<T> | T;
export type Middleware = (req: any, res: any, next: any) => void | Promise<void>;
export type ValidationSchema = Record<string, any>;

// Export utility type helpers
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Re-export all types from submodules for easy importing
export type { User, UserProfile, TelegramUser } from './user';
export type { 
  GameTile, 
  TileType, 
  GameState, 
  LevelConfig, 
  MatchResult,
  TileAnimation,
  SpecialTileEffect,
  GridPosition
} from './game';