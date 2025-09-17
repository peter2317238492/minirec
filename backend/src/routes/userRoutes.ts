// backend/src/routes/userRoutes.ts
import express from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:userId/preferences', authMiddleware, userController.updatePreferences);
router.post('/:userId/purchase', authMiddleware, userController.recordPurchase);
router.post('/:userId/view', authMiddleware, userController.recordView);
router.post('/:userId/click', authMiddleware, userController.recordClick);
router.get('/:userId/click-stats', authMiddleware, userController.getClickStats);

export default router;