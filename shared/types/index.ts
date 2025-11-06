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
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'level' | 'special' | 'streak' | 'challenge';
  requirement: {
    type: 'score' | 'level' | 'matches' | 'streak' | 'special_tiles';
    value: number;
  };
  reward: {
    coins?: number;
    lives?: number;
    experience?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}