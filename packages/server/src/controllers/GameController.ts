import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { GameDataService } from '../services/GameDataService';
import type { ApiResponse } from '../../../../shared/types';

export class GameController {
  // Save game state
  static async saveGameState(req: Request, res: Response) {
    try {
      const { userId, gameState } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      // Save game state to database
      await GameDataService.saveGameState(userId, gameState);
      
      res.json({ success: true, message: 'Game state saved successfully' });
    } catch (error) {
      console.error('Error saving game state:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Load game state
  static async loadGameState(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const gameState = await GameDataService.getGameState(userId);
      
      if (!gameState) {
        return res.status(404).json({ success: false, error: 'Game state not found' });
      }
      
      res.json({ success: true, data: { gameState } });
    } catch (error) {
      console.error('Error loading game state:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Submit score
  static async submitScore(req: Request, res: Response) {
    try {
      const { userId, score, level } = req.body;
      
      if (!userId || score === undefined || !level) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID, score, and level are required' 
        });
      }
      
      // Update user's high score if this is better
      const updatedUser = await UserService.updateUserScore(userId, score);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Award coins based on score
      const coinsEarned = Math.floor(score / 1000);
      if (coinsEarned > 0) {
        await UserService.addCoins(userId, coinsEarned);
      }
      
      res.json({ 
        success: true, 
        data: { 
          newHighScore: updatedUser.score,
          coinsEarned,
          user: updatedUser
        } 
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Get leaderboard
  static async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await UserService.getLeaderboard(limit);
      
      const formattedLeaderboard = leaderboard.map((user, index) => ({
        userId: user.id,
        username: user.username || 'Anonymous',
        firstName: user.first_name,
        lastName: user.last_name,
        score: user.score,
        level: user.level,
        rank: index + 1
      }));
      
      res.json({ success: true, data: { leaderboard: formattedLeaderboard } });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Get user progress
  static async getUserProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const result = await UserService.getUserWithGameStats(userId);
      
      if (!result) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: { progress: result } });
    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Unlock achievement
  static async unlockAchievement(req: Request, res: Response) {
    try {
      const { userId, achievementId } = req.body;
      
      if (!userId || !achievementId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID and achievement ID are required' 
        });
      }
      
      // Here you would implement achievement logic
      // For now, we'll just acknowledge the request
      
      res.json({ success: true, message: 'Achievement unlocked' });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Get user achievements
  static async getUserAchievements(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // For now, return empty achievements array
      // In a full implementation, you'd fetch from database
      
      res.json({ success: true, data: { achievements: [] } });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Create or update user (for Telegram integration)
  static async createOrUpdateUser(req: Request, res: Response) {
    try {
      const { telegramId, username, firstName, lastName } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ success: false, error: 'Telegram ID is required' });
      }
      
      const user = await UserService.findOrCreateUser({
        telegramId,
        username,
        firstName,
        lastName
      });
      
      res.json({ success: true, data: { user } });
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Get user by Telegram ID
  static async getUserByTelegramId(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      
      const user = await UserService.getUserByTelegramId(telegramId);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: { user } });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userData = req.body;
      
      const updatedUser = await UserService.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: { user: updatedUser } });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Add coins
  static async addCoins(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid amount is required' });
      }
      
      const updatedUser = await UserService.addCoins(userId, amount);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: { coins: updatedUser.coins } });
    } catch (error) {
      console.error('Error adding coins:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  // Spend coins
  static async spendCoins(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid amount is required' });
      }
      
      const updatedUser = await UserService.spendCoins(userId, amount);
      
      if (!updatedUser) {
        return res.status(400).json({ success: false, error: 'Insufficient coins or user not found' });
      }
      
      res.json({ success: true, data: { coins: updatedUser.coins } });
    } catch (error) {
      console.error('Error spending coins:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  // Update lives
  static async updateLives(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { lives } = req.body;
      
      if (lives === undefined || lives < 0) {
        return res.status(400).json({ success: false, error: 'Valid lives count is required' });
      }
      
      const updatedUser = await UserService.updateLives(userId, lives);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: { lives: updatedUser.lives } });
    } catch (error) {
      console.error('Error updating lives:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Placeholder methods for daily challenges and bonuses
  static async getDailyChallenge(req: Request, res: Response) {
    res.json({ success: true, data: { challenge: null } });
  }

  static async completeDailyChallenge(req: Request, res: Response) {
    res.json({ success: true, message: 'Daily challenge completed' });
  }

  static async claimDailyBonus(req: Request, res: Response) {
    res.json({ success: true, message: 'Daily bonus claimed' });
  }
}