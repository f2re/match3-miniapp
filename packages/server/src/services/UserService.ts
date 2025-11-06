import { User, UserRow } from '../models/User';
import { GameDataModel } from '../models/GameData';
import { User as UserType, GameData } from '../../../../shared/types';

export class UserService {
  static async createUser(userData: Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow> {
    return await User.create(userData);
  }

  static async getUserByTelegramId(telegramId: string): Promise<UserRow | null> {
    return await User.findByTelegramId(telegramId);
  }

  static async getUserWithGameStats(userId: string): Promise<{ user: UserRow, gameData?: any } | null> {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    const gameData = await GameDataModel.findByUserId(userId);
    return { user, gameData };
  }

  static async updateUser(id: string, userData: Partial<UserType>): Promise<UserRow | null> {
    return await User.update(id, userData);
  }

  static async deleteUser(id: string): Promise<boolean> {
    // First delete associated game data
    await GameDataModel.deleteByUserId(id);
    // Then delete the user
    return await User.delete(id);
  }
}