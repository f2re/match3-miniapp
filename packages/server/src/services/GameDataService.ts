import { GameDataModel, GameDataRow } from '../models/GameData';
import { GameStatesModel, GameStatePayload } from '../models/GameStates';
import { GameData as SharedGameData } from '@shared/types';

export class GameDataService {
  static async createGameData(gameData: Omit<SharedGameData, 'id' | 'lastPlayed'>): Promise<GameDataRow> {
    return await GameDataModel.create(gameData);
  }

  static async getGameDataByUserId(userId: string): Promise<GameDataRow | null> {
    return await GameDataModel.findByUserId(userId);
  }

  static async updateGameData(userId: string, gameData: Partial<SharedGameData>): Promise<GameDataRow | null> {
    return await GameDataModel.updateByUserId(userId, gameData);
  }

  static async deleteGameDataByUserId(userId: string): Promise<boolean> {
    return await GameDataModel.deleteByUserId(userId);
  }

  // Game state methods
  static async saveGameState(userId: string, gameState: GameStatePayload): Promise<void> {
    await GameStatesModel.saveGameState(userId, gameState);
  }

  static async getGameState(userId: string): Promise<any> {
    return await GameStatesModel.getGameState(userId);
  }

  static async updateGameState(userId: string, gameState: Partial<GameStatePayload>): Promise<void> {
    await GameStatesModel.updateGameState(userId, gameState);
  }

  static async deleteGameState(userId: string): Promise<boolean> {
    return await GameStatesModel.deleteGameState(userId);
  }
}