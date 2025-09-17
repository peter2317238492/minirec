// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const userController = {
  // 用户注册
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: '用户名或邮箱已存在' });
      }
      
      // 创建新用户
      const user = new User({ username, email, password });
      await user.save();
      
      // 生成JWT
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: '注册失败', error });
    }
  },

  // 用户登录
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      
      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      // 验证密码
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      // 生成JWT
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.json({
        message: '登录成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          preferences: user.preferences
        }
      });
    } catch (error) {
      res.status(500).json({ message: '登录失败', error });
    }
  },

  // 更新用户偏好
  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { categories, tags, priceRange } = req.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          preferences: { categories, tags, priceRange }
        },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      res.json({ message: '偏好更新成功', preferences: user.preferences });
    } catch (error) {
      res.status(500).json({ message: '更新偏好失败', error });
    }
  },

  // 记录购买历史
  async recordPurchase(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { itemId, itemName, category, price } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      user.purchaseHistory.push({
        itemId,
        itemName,
        category,
        price,
        purchaseDate: new Date()
      });
      
      await user.save();
      res.json({ message: '购买记录成功' });
    } catch (error) {
      res.status(500).json({ message: '记录购买失败', error });
    }
  },

  // 记录浏览历史
  async recordView(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { itemId, duration } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      user.viewHistory.push({
        itemId,
        viewDate: new Date(),
        duration: duration || 0
      });
      
      await user.save();
      res.json({ message: '浏览记录成功' });
    } catch (error) {
      res.status(500).json({ message: '记录浏览失败', error });
    }
  },

  // 记录商品点击
  async recordClick(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { itemId } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      // 查找是否已有此商品的点击记录
      const existingClickIndex = user.clickHistory.findIndex(
        (click) => click.itemId === itemId
      );

      if (existingClickIndex !== -1) {
        // 增加点击次数
        user.clickHistory[existingClickIndex].clickCount += 1;
        user.clickHistory[existingClickIndex].lastClickDate = new Date();
      } else {
        // 添加新的点击记录
        user.clickHistory.push({
          itemId,
          clickCount: 1,
          lastClickDate: new Date()
        });
      }

      await user.save();
      res.json({ 
        message: '点击记录成功',
        clickCount: existingClickIndex !== -1 
          ? user.clickHistory[existingClickIndex].clickCount 
          : 1
      });
    } catch (error) {
      res.status(500).json({ message: '记录点击失败', error });
    }
  },

  // 获取用户点击统计
  async getClickStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('clickHistory');
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      // 按点击次数排序
      const sortedClicks = user.clickHistory
        .sort((a, b) => b.clickCount - a.clickCount)
        .slice(0, 20); // 返回前20个最多点击的商品

      res.json(sortedClicks);
    } catch (error) {
      res.status(500).json({ message: '获取点击统计失败', error });
    }
  }
};
