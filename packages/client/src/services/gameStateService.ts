interface SavedGameState {
  score: number;
  level: number;
  lives: number;
  coins: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  lastPlayed?: string;
}

interface GameProgress {
  userId: number;
  currentLevel: number;
  totalScore: number;
  gamesPlayed: number;
  highScore: number;
  achievements: string[];
}

interface LeaderboardEntry {
  userId: number;
  username: string;
  firstName: string;
  score: number;
  level: number;
  rank: number;
}

class GameStateService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  private readonly STORAGE_KEY = 'match3_game_state';

  // Local storage methods for offline functionality
  saveGameStateLocally(userId: number, gameState: SavedGameState): void {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const stateWithTimestamp = {
        ...gameState,
        lastPlayed: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(stateWithTimestamp));
    } catch (error) {
      console.error('Failed to save game state locally:', error);
    }
  }

  loadGameStateLocally(userId: number): SavedGameState | null {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load game state locally:', error);
      return null;
    }
  }

  // Server API methods
  async saveGameState(userId: number, gameState: SavedGameState): Promise<void> {
    try {
      // Always save locally first
      this.saveGameStateLocally(userId, gameState);

      // Try to sync with server
      const response = await fetch(`${this.API_BASE_URL}/api/game/save-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameState: {
            ...gameState,
            lastPlayed: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to save game state to server, using local storage:', error);
    }
  }

  async loadGameState(userId: number): Promise<SavedGameState | null> {
    try {
      // Try to fetch from server first
      const response = await fetch(`${this.API_BASE_URL}/api/game/load-state/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.gameState;
      }
    } catch (error) {
      console.warn('Failed to load game state from server, using local storage:', error);
    }

    // Fallback to local storage
    return this.loadGameStateLocally(userId);
  }

  async submitScore(userId: number, score: number, level: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/game/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          score,
          level,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Store locally for later sync
      const pendingScores = this.getPendingScores();
      pendingScores.push({ userId, score, level, timestamp: new Date().toISOString() });
      localStorage.setItem('pending_scores', JSON.stringify(pendingScores));
    }
  }

  private getPendingScores(): Array<{userId: number; score: number; level: number; timestamp: string}> {
    try {
      const pending = localStorage.getItem('pending_scores');
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  }

  async syncPendingScores(): Promise<void> {
    const pendingScores = this.getPendingScores();
    
    if (pendingScores.length === 0) return;

    for (const scoreData of pendingScores) {
      try {
        await this.submitScore(scoreData.userId, scoreData.score, scoreData.level);
      } catch (error) {
        console.error('Failed to sync pending score:', error);
        return; // Stop syncing on first failure
      }
    }

    // Clear pending scores after successful sync
    localStorage.removeItem('pending_scores');
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/game/leaderboard?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.leaderboard || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async getUserProgress(userId: number): Promise<GameProgress | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/game/progress/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.progress;
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      return null;
    }
  }

  async unlockAchievement(userId: number, achievementId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/game/achievement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          achievementId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  }

  // Utility methods
  clearLocalData(userId: number): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const gameStateService = new GameStateService();
export type { SavedGameState, GameProgress, LeaderboardEntry };