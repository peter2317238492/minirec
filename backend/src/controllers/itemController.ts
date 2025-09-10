// backend/src/controllers/itemController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item';
import Review from '../models/Review';

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
    const { userId, userName, rating, taste, packaging, comment, date } = req.body;


    // 基本校验
    if (!itemId) return res.status(400).json({ message: '缺少 itemId' });
    if ([rating, taste, packaging].some(v => typeof v !== 'number' || v < 1 || v > 5)) {
      return res.status(400).json({ message: '评分必须为 1-5 的数字' });
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
        const [doc] = await Review.create(
          [{
            itemId,
            userId,
            userName,
            rating,
            taste,
            packaging,
            comment: comment.trim(),
            date: date ? new Date(date) : new Date()
          }],
          { session }
        );
        createdReview = doc;

        // 2) 同步到 Item.reviews（只保留最近 N 条）
        const embedded: any = {
          // 如果你的 Item 模型新增了 reviewId 字段，这里能关联；没有也不会报错（多余字段会被严格模式丢弃）
          reviewId: doc._id,
          userId,
          userName,
          rating,
          taste,
          packaging,
          comment: comment.trim(),
          date: doc.date
        };
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
          const doc = await Review.create({
            itemId,
            userId,
            userName,
            rating,
            taste,
            packaging,
            comment: comment.trim(),
            date: date ? new Date(date) : new Date()
          });

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
            taste,
            packaging,
            comment: comment.trim(),
            date: doc.date
          };
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
  }
};
