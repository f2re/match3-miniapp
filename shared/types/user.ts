export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  score: number;
  level: number;
  lives: number;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalGames: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  totalMatches: number;
  specialTilesCreated: number;
  achievementsUnlocked: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  language: string;
  theme: 'auto' | 'light' | 'dark';
}

export interface UserProgress {
  currentLevel: number;
  experience: number;
  nextLevelExperience: number;
  completedLevels: number[];
  unlockedAchievements: string[];
  dailyChallengesCompleted: number;
  weeklyStreak: number;
}