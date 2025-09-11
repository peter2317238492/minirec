import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import Item from './models/Item';
import User from './models/User';
import itemRoutes from './routes/itemRoutes';

dotenv.config();

const app = express();

/** ========= 全局中间件顺序 ========= */
// 放最前，确保每个请求都能被记录
app.use((req, _res, next) => {
  console.log('[REQ]', req.method, req.originalUrl, req.query || {});
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** ========= 鉴权中间件（供用户相关路由使用） ========= */
interface AuthRequest extends Request {
  userId?: string;
}
const authMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未提供认证令牌' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: '认证令牌无效' });
  }
};

/** ========= 路由挂载 ========= */
// ⚠️ 这里挂载 items 路由，app.ts 里不要再定义 /api/items，避免冲突
app.use('/api/items', itemRoutes);

/** ========= 用户相关路由 ========= */

// 用户注册
app.post('/api/users/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error });
  }
});

// 用户登录
app.post('/api/users/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: '用户名或密码错误' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

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
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error });
  }
});

// 更新用户偏好
app.put(
  '/api/users/:userId/preferences',
  authMiddleware as any,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const { categories, tags, priceRange } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { preferences: { categories, tags, priceRange } },
        { new: true }
      );

      if (!user) return res.status(404).json({ message: '用户不存在' });

      res.json({ message: '偏好更新成功', preferences: user.preferences });
    } catch (error) {
      res.status(500).json({ message: '更新偏好失败', error });
    }
  }
);

// 记录购买历史
app.post('/api/users/:userId/purchase', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { itemId, itemName, category, price } = req.body;

    let user = await User.findById(userId);
    if (!user) user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: '用户不存在' });

    user.purchaseHistory.push({
      itemId,
      itemName,
      category,
      price,
      purchaseDate: new Date(),
    });
    await user.save();

    const item = await Item.findByIdAndUpdate(
      itemId,
      { $inc: { purchaseCount: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: '购买记录成功',
      purchaseCount: item?.purchaseCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '记录购买失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// 个性化推荐
app.get(
  '/api/recommendations/:userId',
  authMiddleware as any,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: '用户不存在' });

      const filter: any = {};
      if (user.preferences?.categories?.length) {
        filter.category = { $in: user.preferences.categories };
      }
      if (user.preferences?.tags?.length) {
        filter.tags = { $in: user.preferences.tags };
      }

      let recommendations = await Item.find(filter)
        .sort({ rating: -1 })
        .limit(10);

      if (recommendations.length < 4) {
        const additional = await Item.find({
          _id: { $nin: recommendations.map((r) => r._id) },
        })
          .sort({ rating: -1 })
          .limit(4 - recommendations.length);
        recommendations = [...recommendations, ...additional];
      }

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: '获取推荐失败', error });
    }
  }
);

// 默认路由
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '推荐系统后端API运行中',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      users: '/api/users',
      recommendations: '/api/recommendations/:userId',
    },
  });
});

/** ========= 数据库连接&启动 ========= */
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.warn('MONGODB_URI 未设置，使用本地数据库');
  MONGODB_URI = 'mongodb://localhost:27017/recommendation_system';
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch((err) => console.error('❌ MongoDB连接失败:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`📍 访问: http://localhost:${PORT}`);
  console.log(`📝 如需初始化测试数据: npm run seed`);
});

export default app;
