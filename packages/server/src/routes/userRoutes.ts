import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

// Get user by Telegram ID
router.get('/:telegramId', UserController.getUserByTelegramId);

// Create new user
router.post('/', UserController.createUser);

// Get user with game stats
router.get('/stats/:userId', UserController.getUserWithStats);

// Update user
router.put('/:userId', UserController.updateUser);

// Delete user
router.delete('/:userId', UserController.deleteUser);

export default router;