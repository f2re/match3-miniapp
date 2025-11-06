import { GameDataModel, GameDataRow } from '../models/GameData';
import { GameData } from '../../../../shared/types';

export class GameDataService {
  static async createGameData(gameData: Omit<GameData, 'id' | 'lastPlayed'>): Promise<GameDataRow> {
    return await GameDataModel.create(gameData);
  }

  static async getGameDataByUserId(userId: string): Promise<GameDataRow | null> {
    return await GameDataModel.findByUserId(userId);
  }

  static async updateGameData(userId: string, gameData: Partial<GameData>): Promise<GameDataRow | null> {
    return await GameDataModel.updateByUserId(userId, gameData);
  }

  static async deleteGameDataByUserId(userId: string): Promise<boolean> {
    return await GameDataModel.deleteByUserId(userId);
  }
}