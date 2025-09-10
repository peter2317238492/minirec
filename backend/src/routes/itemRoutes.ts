// backend/src/routes/itemRoutes.ts
import express from 'express';
import { itemController } from '../controllers/itemController';
import { authMiddleware } from '../middleware/auth';


const router = express.Router();

router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.post('/', authMiddleware, itemController.createItem);
//router.post('/:id/reviews', authMiddleware, itemController.addReview);
router.post('/:id/reviews', itemController.addReview);   // 双写入口
router.get('/:id/reviews', itemController.listReviews);  // 分页读取

export default router;