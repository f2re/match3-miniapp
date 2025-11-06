import { Router } from 'express';
import { GameDataController } from '../controllers/GameDataController';

const router = Router();

// Get game data by user ID
router.get('/:userId', GameDataController.getGameDataByUserId);

// Save or update game data
router.post('/', GameDataController.saveGameData);

// Delete game data by user ID
router.delete('/:userId', GameDataController.deleteGameDataByUserId);

export default router;