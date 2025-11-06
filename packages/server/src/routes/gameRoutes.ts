import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../middleware/auth';
import { validateTelegramData } from '../middleware/telegram';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Game state management
router.post('/save-state', validateTelegramData, GameController.saveGameState);
router.get('/load-state/:userId', authMiddleware, GameController.loadGameState);

// Score submission and leaderboard
router.post('/submit-score', validateTelegramData, GameController.submitScore);
router.get('/leaderboard', GameController.getLeaderboard);
router.get('/progress/:userId', authMiddleware, GameController.getUserProgress);

// Achievements
router.post('/achievement', validateTelegramData, GameController.unlockAchievement);
router.get('/achievements/:userId', authMiddleware, GameController.getUserAchievements);

// User management
router.post('/user/create', validateTelegramData, GameController.createOrUpdateUser);
router.get('/user/:telegramId', GameController.getUserByTelegramId);
router.put('/user/:userId', authMiddleware, GameController.updateUser);

// Coins and lives management
router.post('/user/:userId/coins/add', authMiddleware, GameController.addCoins);
router.post('/user/:userId/coins/spend', authMiddleware, GameController.spendCoins);
router.put('/user/:userId/lives', authMiddleware, GameController.updateLives);

// Daily challenges and bonuses
router.get('/daily-challenge/:userId', authMiddleware, GameController.getDailyChallenge);
router.post('/daily-challenge/complete', validateTelegramData, GameController.completeDailyChallenge);
router.post('/daily-bonus/claim', validateTelegramData, GameController.claimDailyBonus);

export default router;