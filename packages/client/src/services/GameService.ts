// services/GameService.ts
import { User, GameData } from '../../../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class GameService {
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${telegramId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getGameDataByUserId(userId: string): Promise<GameData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game-data/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching game data:', error);
      return null;
    }
  }

  async saveGameData(gameData: Omit<GameData, 'id' | 'lastPlayed'>): Promise<GameData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error saving game data:', error);
      return null;
    }
  }
}

export default new GameService();