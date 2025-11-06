import { UserModel, UserRow, CreateUserData, UpdateUserData } from '../models/User';
import { GameDataModel } from '../models/GameData';
import type { User as UserType, GameData as SharedGameData } from '@shared/types';

export class UserService {
  static async createUser(userData: CreateUserData): Promise<UserRow> {
    // Check if user already exists
    const existingUser = await UserModel.findByTelegramId(userData.telegramId);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    return await UserModel.create(userData);
  }

  static async getUserByTelegramId(telegramId: string): Promise<UserRow | null> {
    return await UserModel.findByTelegramId(telegramId);
  }

  static async getUserById(userId: string): Promise<UserRow | null> {
    return await UserModel.findById(userId);
  }

  static async getUserWithGameStats(userId: string): Promise<{ user: UserRow, gameData?: any, stats?: any } | null> {
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }

    // Get game data and statistics
    const [gameData, stats] = await Promise.all([
      GameDataModel.findByUserId(userId),
      UserModel.getUserStats(userId)
    ]);
    
    return { user, gameData, stats };
  }

  static async updateUser(id: string, userData: UpdateUserData): Promise<UserRow | null> {
    return await UserModel.update(id, userData);
  }

  static async updateUserScore(id: string, newScore: number): Promise<UserRow | null> {
    return await UserModel.updateScore(id, newScore);
  }

  static async addCoins(id: string, amount: number): Promise<UserRow | null> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    return await UserModel.addCoins(id, amount);
  }

  static async spendCoins(id: string, amount: number): Promise<UserRow | null> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    const user = await UserModel.findById(id);
    if (!user || user.coins < amount) {
      throw new Error('Insufficient coins');
    }
    
    return await UserModel.spendCoins(id, amount);
  }

  static async updateLives(id: string, lives: number): Promise<UserRow | null> {
    return await UserModel.updateLives(id, lives);
  }

  static async getLeaderboard(limit: number = 10): Promise<UserRow[]> {
    return await UserModel.getLeaderboard(limit);
  }

  static async deleteUser(id: string): Promise<boolean> {
    // First delete associated game data
    try {
      await GameDataModel.deleteByUserId(id);
    } catch (error) {
      console.warn('Error deleting game data for user:', error);
    }
    
    // Then delete the user
    return await UserModel.delete(id);
  }

  static async getAllUsers(limit: number = 100, offset: number = 0): Promise<UserRow[]> {
    return await UserModel.getAll(limit, offset);
  }

  static async findOrCreateUser(telegramData: {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserRow> {
    // Try to find existing user
    let user = await UserModel.findByTelegramId(telegramData.telegramId);
    
    if (!user) {
      // Create new user with default values
      user = await UserModel.create({
        telegramId: telegramData.telegramId,
        username: telegramData.username,
        firstName: telegramData.firstName,
        lastName: telegramData.lastName,
        score: 0,
        level: 1,
        lives: 5,
        coins: 100
      });
    } else {
      // Update user info if it has changed
      const updateData: UpdateUserData = {};
      let needsUpdate = false;
      
      if (user.username !== telegramData.username) {
        updateData.username = telegramData.username;
        needsUpdate = true;
      }
      
      if (user.first_name !== telegramData.firstName) {
        updateData.firstName = telegramData.firstName;
        needsUpdate = true;
      }
      
      if (user.last_name !== telegramData.lastName) {
        updateData.lastName = telegramData.lastName;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        user = await UserModel.update(user.id, updateData) || user;
      }
    }
    
    return user;
  }
}