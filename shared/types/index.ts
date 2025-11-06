export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  score: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameData {
  userId: string;
  score: number;
  level: number;
  moves: number;
  board: number[][];
  achievements: string[];
  lastPlayed: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}