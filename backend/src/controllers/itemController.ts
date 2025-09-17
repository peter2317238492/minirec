// backend/src/controllers/itemController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

const MAX_EMBEDDED = 20; // 只在 Item.reviews 里保留最近 N 条

export const itemController = {
  // 获取所有项目
  async getAllItems(req: Request, res: Response) {
    try {
      const { category, tags, minPrice, maxPrice, city } = req.query;
      const filter: any = {};

      if (category) filter.category = category;
      if (tags) filter.tags = { $in: (tags as string).split(',') };
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (city) filter['location.city'] = city;

      const items = await Item.find(filter).sort({ rating: -1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: '获取项目失败', error });
    }
  },

  // 获取单个项目详情
  async getItemById(req: Request, res: Response) {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) return res.status(404).json({ message: '项目不存在' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: '获取项目详情失败', error });
    }
  },

  // 创建新项目
  async createItem(req: Request, res: Response) {
    try {
      const newItem = new Item(req.body);
      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (error) {
      res.status(400).json({ message: '创建项目失败', error });
    }
  },

  /**
   * 添加评论：双写（Review 集合 + Item.reviews 嵌入）
   * - 优先事务；若非副本集则自动降级为无事务
   */
  async addReview(req: Request, res: Response) {
    const itemId = req.params.id || req.body.itemId;
    const { userId, userName, rating, taste, service, environment, comfort, location, scenery, transportation, comment, date } = req.body;


    // 基本校验
    if (!itemId) return res.status(400).json({ message: '缺少 itemId' });
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: '总体评分必须为 1-5 的数字' });
    }
    // 验证可选评分字段
    const optionalRatings = { taste, service, environment, comfort, location, scenery, transportation };
    for (const [key, value] of Object.entries(optionalRatings)) {
      if (value !== undefined && (typeof value !== 'number' || value < 1 || value > 5)) {
        return res.status(400).json({ message: `${key}评分必须为 1-5 的数字` });
      }
    }
    if (!userId || !userName) return res.status(400).json({ message: '缺少用户信息' });
    if (!comment?.trim()) return res.status(400).json({ message: '评论不能为空' });

    // 事务版本
    const session = await mongoose.startSession();
    try {
      let createdReview: any;

      await session.withTransaction(async () => {
        const item = await Item.findById(itemId).session(session);
        if (!item) throw new Error('ITEM_NOT_FOUND');

        // 1) 写入独立 Review 集合
        const reviewData: any = {
          itemId,
          userId,
          userName,
          rating,
          comment: comment.trim(),
          date: date ? new Date(date) : new Date()
        };
        
        // 添加可选的评分类别
        if (taste !== undefined) reviewData.taste = taste;
        if (service !== undefined) reviewData.service = service;
        if (environment !== undefined) reviewData.environment = environment;
        if (comfort !== undefined) reviewData.comfort = comfort;
        if (location !== undefined) reviewData.location = location;
        if (scenery !== undefined) reviewData.scenery = scenery;
        if (transportation !== undefined) reviewData.transportation = transportation;
        
        const [doc] = await Review.create([reviewData], { session });
        createdReview = doc;

        // 2) 同步到 Item.reviews（只保留最近 N 条）
        const embedded: any = {
          // 如果你的 Item 模型新增了 reviewId 字段，这里能关联；没有也不会报错（多余字段会被严格模式丢弃）
          reviewId: doc._id,
          userId,
          userName,
          rating,
          comment: comment.trim(),
          date: doc.date
        };
        
        // 添加可选的评分类别到嵌入式评论
        if (taste !== undefined) embedded.taste = taste;
        if (service !== undefined) embedded.service = service;
        if (environment !== undefined) embedded.environment = environment;
        if (comfort !== undefined) embedded.comfort = comfort;
        if (location !== undefined) embedded.location = location;
        if (scenery !== undefined) embedded.scenery = scenery;
        if (transportation !== undefined) embedded.transportation = transportation;
        item.reviews.push(embedded);
        if (item.reviews.length > MAX_EMBEDDED) {
          item.reviews = item.reviews.slice(-MAX_EMBEDDED);
        }

        // 3) 维护评分统计
        const anyItem: any = item as any;
        if (typeof anyItem.ratingSum === 'number' && typeof anyItem.ratingCount === 'number') {
          anyItem.ratingSum += rating;
          anyItem.ratingCount += 1;
          item.rating = Number((anyItem.ratingSum / anyItem.ratingCount).toFixed(2));
        } else {
          // 向后兼容：没有 sum/count 字段时，用数组求平均
          const total = item.reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0);
          item.rating = Number((total / item.reviews.length).toFixed(2));
        }

        await item.save({ session });
      });

      return res.status(201).json({ message: 'ok', review: createdReview });
    } catch (error: any) {
      // 非副本集环境的事务报错：降级为无事务双写
      const txnNotSupported =
        error?.message?.includes('Transaction') ||
        error?.code === 251 || // NoSuchTransaction / 事务相关
        error?.message?.includes('replica set');

      if (txnNotSupported) {
        try {
          // A: 先写 Review
          const reviewData: any = {
            itemId,
            userId,
            userName,
            rating,
            comment: comment.trim(),
            date: date ? new Date(date) : new Date()
          };
          
          // 添加可选的评分类别
          if (taste !== undefined) reviewData.taste = taste;
          if (service !== undefined) reviewData.service = service;
          if (environment !== undefined) reviewData.environment = environment;
          if (comfort !== undefined) reviewData.comfort = comfort;
          if (location !== undefined) reviewData.location = location;
          if (scenery !== undefined) reviewData.scenery = scenery;
          if (transportation !== undefined) reviewData.transportation = transportation;
          
          const doc = await Review.create(reviewData);

          // B: 再更新 Item
          const item = await Item.findById(itemId);
          if (!item) {
            // 回滚单条 Review
            await Review.findByIdAndDelete(doc._id).catch(() => {});
            return res.status(404).json({ message: '项目不存在' });
          }

          const embedded: any = {
            reviewId: doc._id,
            userId,
            userName,
            rating,
            comment: comment.trim(),
            date: doc.date
          };
          
          // 添加可选的评分类别到嵌入式评论
          if (taste !== undefined) embedded.taste = taste;
          if (service !== undefined) embedded.service = service;
          if (environment !== undefined) embedded.environment = environment;
          if (comfort !== undefined) embedded.comfort = comfort;
          if (location !== undefined) embedded.location = location;
          if (scenery !== undefined) embedded.scenery = scenery;
          if (transportation !== undefined) embedded.transportation = transportation;
          item.reviews.push(embedded);
          if (item.reviews.length > MAX_EMBEDDED) {
            item.reviews = item.reviews.slice(-MAX_EMBEDDED);
          }

          const anyItem: any = item as any;
          if (typeof anyItem.ratingSum === 'number' && typeof anyItem.ratingCount === 'number') {
            anyItem.ratingSum += rating;
            anyItem.ratingCount += 1;
            item.rating = Number((anyItem.ratingSum / anyItem.ratingCount).toFixed(2));
          } else {
            const total = item.reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0);
            item.rating = Number((total / item.reviews.length).toFixed(2));
          }

          await item.save();
          return res.status(201).json({ message: 'ok', review: doc });
        } catch (e) {
          return res.status(500).json({ message: '添加评论失败（降级模式）', error: e });
        }
      }

      if (error?.message === 'ITEM_NOT_FOUND') {
        return res.status(404).json({ message: '项目不存在' });
      }
      return res.status(500).json({ message: '添加评论失败', error });
    } finally {
      session.endSession();
    }
  },

  /**
   * （可选）分页获取某个项目的评论
   * 推荐从独立 Review 集合读取，便于筛选/排序/分页
   * GET /api/items/:id/reviews?page=1&pageSize=10
   */
  async listReviews(req: Request, res: Response) {
    try {
      const itemId = req.params.id;
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(50, Number(req.query.pageSize) || 10);

      const [rows, total] = await Promise.all([
        Review.find({ itemId }).sort({ date: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
        Review.countDocuments({ itemId })
      ]);

      res.json({ total, page, pageSize, rows });
    } catch (error) {
      res.status(500).json({ message: '获取评论失败', error });
    }
  },

  /**
   * 获取平台所有产品（merchantId为null的产品）
   * GET /api/items/platform
   */
  async getPlatformItems(req: Request, res: Response) {
    try {
      const { category, search, page = 1, limit = 20 } = req.query;
      
      const filter: any = { merchantId: null };
      
      if (category && category !== 'all') {
        filter.category = category;
      }
      
      if (search && typeof search === 'string') {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { name: searchRegex },
          { description: searchRegex }
        ];
      }
      
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      
      const [items, total] = await Promise.all([
        Item.find(filter)
          .sort({ rating: -1, purchaseCount: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
        Item.countDocuments(filter)
      ]);
      
      res.json({
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ message: '获取平台产品失败', error });
    }
  },

  /**
   * 商家添加平台产品到自己的店铺
   * POST /api/items/merchant/add
   */
  async addPlatformItemsToMerchant(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const { itemIds } = req.body;
      
      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ message: '请选择要添加的产品' });
      }
      
      // 验证所有产品ID都是有效的ObjectId
      const validItemIds = itemIds.filter(id => 
        mongoose.Types.ObjectId.isValid(id)
      );
      
      if (validItemIds.length === 0) {
        return res.status(400).json({ message: '无效的产品ID' });
      }
      
      // 获取平台产品（merchantId为null）
      const platformItems = await Item.find({
        _id: { $in: validItemIds },
        merchantId: null
      });
      
      if (platformItems.length === 0) {
        return res.status(404).json({ message: '未找到指定的平台产品' });
      }
      
      // 检查商家是否已经添加过这些产品
      const existingItems = await Item.find({
        merchantId,
        _id: { $in: validItemIds }
      });
      
      const existingItemIds = existingItems.map(item => 
        item._id.toString()
      );
      
      // 过滤掉已经添加过的产品
      const newItemIds = validItemIds.filter(id => 
        !existingItemIds.includes(id)
      );
      
      if (newItemIds.length === 0) {
        return res.status(400).json({ 
          message: '所选产品已经添加到您的店铺中' 
        });
      }
      
      // 获取需要添加的平台产品
      const platformItemsToAdd = platformItems.filter(item => 
        newItemIds.includes(item._id.toString())
      );
      
      // 直接将平台产品绑定到商家，不创建副本
      const updatedItems = await Item.updateMany(
        { 
          _id: { $in: newItemIds },
          merchantId: null 
        },
        { 
          merchantId: merchantId,
          updatedAt: new Date()
        }
      );
      
      res.json({
        message: `成功绑定 ${updatedItems.modifiedCount} 个产品到您的店铺`,
        items: platformItemsToAdd
      });
    } catch (error) {
      res.status(500).json({ message: '添加产品失败', error });
    }
  },

  /**
   * 获取商家的产品列表
   * GET /api/items/merchant
   */
  async getMerchantItems(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const items = await Item.find({ merchantId })
        .sort({ createdAt: -1 })
        .lean();
      
      res.json({ items });
    } catch (error) {
      res.status(500).json({ message: '获取商家产品失败', error });
    }
  },

  /**
   * 商家移除产品（将产品归还给平台）
   * DELETE /api/items/merchant/:id
   */
  async removeMerchantItem(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const { id } = req.params;
      
      // 检查产品是否存在且属于该商家
      const item = await Item.findOne({ 
        _id: id, 
        merchantId 
      });
      
      if (!item) {
        return res.status(404).json({ message: '产品不存在或无权限操作' });
      }
      
      // 将产品归还给平台（设置merchantId为null）
      await Item.findByIdAndUpdate(
        id,
        { 
          merchantId: null,
          updatedAt: new Date()
        }
      );
      
      res.json({ message: '产品已成功移除' });
    } catch (error) {
      res.status(500).json({ message: '移除产品失败', error });
    }
  },

  /**
   * 更新商品信息
   * PUT /api/items/:id
   */
  async updateItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      // 检查商品是否存在且属于该商家
      const existingItem = await Item.findOne({ 
        _id: id, 
        merchantId 
      });
      
      if (!existingItem) {
        return res.status(404).json({ message: '商品不存在或无权限修改' });
      }
      
      // 更新商品信息
      const updatedItem = await Item.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: '更新商品失败', error });
    }
  }
};
