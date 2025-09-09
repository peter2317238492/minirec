// backend/src/controllers/itemController.ts
import { Request, Response } from 'express';
import Item from '../models/Item';

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
      if (!item) {
        return res.status(404).json({ message: '项目不存在' });
      }
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

  // 添加评论
  async addReview(req: Request, res: Response) {
    try {
      const { userId, userName, rating, comment } = req.body;
      const item = await Item.findById(req.params.id);
      
      if (!item) {
        return res.status(404).json({ message: '项目不存在' });
      }
      
      item.reviews.push({
        userId,
        userName,
        rating,
        comment,
        date: new Date()
      });
      
      // 更新平均评分
      const totalRating = item.reviews.reduce((sum, review) => sum + review.rating, 0);
      item.rating = totalRating / item.reviews.length;
      
      await item.save();
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: '添加评论失败', error });
    }
  }
};
