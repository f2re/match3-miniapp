import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { User as UserType } from '../../../../shared/types';

export const UserController = {
  // Get user by Telegram ID
  async getUserByTelegramId(req: Request, res: Response) {
    try {
      const { telegramId } = req.params;
      const user = await UserService.getUserByTelegramId(telegramId);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Create new user
  async createUser(req: Request, res: Response) {
    try {
      const { telegramId, username, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await UserService.getUserByTelegramId(telegramId);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'User already exists' });
      }
      
      const newUser = await UserService.createUser({
        telegramId,
        username,
        firstName,
        lastName,
        score: 0,
        level: 1
      });
      
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Get user with game stats
  async getUserWithStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await UserService.getUserWithGameStats(userId);
      
      if (!result) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching user with stats:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userData = req.body;
      
      const updatedUser = await UserService.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const deleted = await UserService.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};