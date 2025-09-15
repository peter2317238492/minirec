// backend/src/routes/itemRoutes.ts
import express from 'express';
import Item from '../models/Item';
import { itemController } from '../controllers/itemController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 防止用户输入 . * + ? 等触发“全匹配”
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/items
 * 支持：
 *  - ?category=all | attraction | food | hotel
 *  - ?search=关键词（按 name/description 模糊匹配，不区分大小写）
 *  - ?minPrice=数字（最低价格）
 *  - ?maxPrice=数字（最高价格）
 * 返回按 rating / purchaseCount 倒序
 */
router.get('/', async (req, res) => {
  try {
    const category =
      typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const minPrice =
      typeof req.query.minPrice === 'string' ? Number(req.query.minPrice) : undefined;
    const maxPrice =
      typeof req.query.maxPrice === 'string' ? Number(req.query.maxPrice) : undefined;

    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      const q = escapeRegex(search);
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        // 如需扩展可放开下面这行：
        // { 'location.city': { $regex: q, $options: 'i' } },
        // { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    // 价格筛选
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    console.log('--- [/api/items] 最终过滤条件:', JSON.stringify(filter));
    const count = await Item.countDocuments(filter);
    console.log('--- 预计数量(CountDocuments):', count);

    const items = await Item.find(filter)
      .sort({ rating: -1, purchaseCount: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error('查询 items 失败:', err);
    res.status(500).json({ message: '查询失败', error: err });
  }
});

// 其他 items 相关接口仍走 controller（不会与上面冲突）
router.get('/:id', itemController.getItemById);
router.post('/', authMiddleware, itemController.createItem);

// 平台产品和商家产品接口
router.get('/platform/list', itemController.getPlatformItems);  // 获取平台产品列表
router.post('/merchant/add', authMiddleware, itemController.addPlatformItemsToMerchant);  // 商家添加平台产品
router.get('/merchant', authMiddleware, itemController.getMerchantItems);  // 获取商家产品列表

// 评价接口
router.post('/:id/reviews', itemController.addReview);   // 提交评论
router.get('/:id/reviews', itemController.listReviews);  // 评论分页

export default router;
