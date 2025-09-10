import express from 'express';
import { RecommendationService } from '../services/recommendationService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const recommendationService = new RecommendationService();

router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const recommendations = await recommendationService.getPersonalizedRecommendations(req.params.userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: '获取推荐失败', error });
  }
});

router.get('/:userId/export', authMiddleware, async (req, res) => {
  try {
    const data = await recommendationService.exportUserDataForTraining(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: '导出数据失败', error });
  }
});

export default router;