import { Request, Response } from 'express';
import { GameDataService } from '../services/GameDataService';
import { GameData as SharedGameData } from '@shared/types';

export const GameDataController = {
  // Get game data by user ID
  async getGameDataByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const gameData = await GameDataService.getGameDataByUserId(userId);
      
      if (!gameData) {
        return res.status(404).json({ success: false, error: 'Game data not found' });
      }
      
      res.json({ success: true, data: gameData });
    } catch (error) {
      console.error('Error fetching game data:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Save or update game data
  async saveGameData(req: Request, res: Response) {
    try {
      const { userId, score, level, moves, board, achievements } = req.body;
      
      // Check if game data already exists for this user
      const existingData = await GameDataService.getGameDataByUserId(userId);
      
      let result;
      if (existingData) {
        // Update existing game data
        result = await GameDataService.updateGameData(userId, {
          score,
          level,
          moves,
          board,
          achievements
        });
      } else {
        // Create new game data
        result = await GameDataService.createGameData({
          userId,
          score,
          level,
          moves,
          board,
          achievements,
          gameMode: 'classic', // default game mode
          difficulty: 'medium' // default difficulty
        });
      }
      
      if (!result) {
        return res.status(400).json({ success: false, error: 'Failed to save game data' });
      }
      
      res.status(existingData ? 200 : 201).json({ success: true, data: result });
    } catch (error) {
      console.error('Error saving game data:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Delete game data by user ID
  async deleteGameDataByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const deleted = await GameDataService.deleteGameDataByUserId(userId);
      
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Game data not found' });
      }
      
      res.json({ success: true, message: 'Game data deleted successfully' });
    } catch (error) {
      console.error('Error deleting game data:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};