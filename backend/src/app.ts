import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import Item from './models/Item';
import User from './models/User';
import itemRoutes from './routes/itemRoutes';
import Review from './models/Review';

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use('/api/items', itemRoutes);
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  console.log('[REQ]', req.method, req.originalUrl);
  next();
});

// 扩展Request接口
interface AuthRequest extends Request {
  userId?: string;
}

// 认证中间件
const authMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: '认证令牌无效' });
  }
};

// ========== 项目相关路由 ==========

// 获取所有项目
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const { category, tags, minPrice, maxPrice, city, search } = req.query;
    const filter: any = {};
    
    // 分类筛选
    if (category && category !== 'all') filter.category = category;
    
    // 搜索功能 - 搜索名称、描述、标签
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    // 其他筛选条件
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
});

// 获取单个项目
app.get('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: '获取项目详情失败', error });
  }
});

// 创建新项目（需要认证）
app.post('/api/items', authMiddleware as any, async (req: Request, res: Response) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: '创建项目失败', error });
  }
});

// 添加评论（双写：Review 集合 + Item.reviews[]）
/*app.post('/api/items/:id/reviews', authMiddleware as any, async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const { userId, userName, rating, taste, packaging, comment, date } = req.body;

    // —— 基本校验 ——
    if (!itemId) return res.status(400).json({ message: '缺少 itemId' });
    if ([rating, taste, packaging].some((v: any) => typeof v !== 'number' || v < 1 || v > 5)) {
      return res.status(400).json({ message: '评分必须为 1-5 的数字' });
    }
    if (!userId || !userName) return res.status(400).json({ message: '缺少用户信息' });
    if (!comment?.trim()) return res.status(400).json({ message: '评论不能为空' });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: '项目不存在' });

    // 1) 先写独立 Review 集合
    const reviewDoc = await Review.create({
      itemId,
      userId,
      userName,
      rating,
      taste,
      packaging,
      comment: String(comment).trim(),
      date: date ? new Date(date) : new Date()
    });

    // 2) 再把同一条评论嵌入到 Item.reviews（注意包含 reviewId/taste/packaging）
    (item as any).reviews.push({
      reviewId: reviewDoc._id,     // ← 关键：满足 IEmbeddedReview
      userId,
      userName,
      rating,
      taste,
      packaging,
      comment: String(comment).trim(),
      date: reviewDoc.date
    });

    // （可选）只保留最近 N 条，避免文档过大
    const MAX_EMBEDDED = 20;
    if (item.reviews.length > MAX_EMBEDDED) {
      (item as any).reviews = (item as any).reviews.slice(-MAX_EMBEDDED);
    }

    // 3) 维护平均分（如果 Item 里没有 ratingSum/ratingCount，就用数组求平均）
    const anyItem = item as any;
    if (typeof anyItem.ratingSum === 'number' && typeof anyItem.ratingCount === 'number') {
      anyItem.ratingSum += rating;
      anyItem.ratingCount += 1;
      item.rating = Number((anyItem.ratingSum / anyItem.ratingCount).toFixed(2));
    } else {
      const total = (item.reviews as any[]).reduce((s, r) => s + (r.rating || 0), 0);
      item.rating = Number((total / item.reviews.length).toFixed(2));
    }

    await item.save();
    res.status(201).json({ message: 'ok', review: reviewDoc, item });
  } catch (error) {
    console.error('add review error:', error);
    res.status(400).json({ message: '添加评论失败', error });
  }
});*/

// ========== 用户相关路由 ==========

// 用户注册
app.post('/api/users/register', async (req: Request, res: Response) => {
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
});

// 用户登录
app.post('/api/users/login', async (req: Request, res: Response) => {
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
});

// 更新用户偏好
app.put('/api/users/:userId/preferences', authMiddleware as any, async (req: Request, res: Response) => {
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
});

// 记录购买历史（同时更新购买人数）
app.post('/api/users/:userId/purchase', authMiddleware as any, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { itemId, itemName, category, price } = req.body;
    
    // 记录到用户购买历史
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
    
    // 更新项目的购买人数
    await Item.findByIdAndUpdate(
      itemId,
      { $inc: { purchaseCount: 1 } },  // 购买人数加1
      { new: true }
    );
    
    res.json({ message: '购买记录成功' });
  } catch (error) {
    res.status(500).json({ message: '记录购买失败', error });
  }
});

// ========== 推荐相关路由 ==========

// 获取个性化推荐
app.get('/api/recommendations/:userId', authMiddleware as any, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 基础推荐算法
    const filter: any = {};
    
    if (user.preferences.categories && user.preferences.categories.length > 0) {
      filter.category = { $in: user.preferences.categories };
    }
    
    if (user.preferences.tags && user.preferences.tags.length > 0) {
      filter.tags = { $in: user.preferences.tags };
    }
    
    let recommendations = await Item.find(filter)
      .sort({ rating: -1 })
      .limit(10);
    
    // 如果推荐结果太少，补充高评分项目
    if (recommendations.length < 4) {
      const additionalItems = await Item.find({ _id: { $nin: recommendations.map(r => r._id) } })
        .sort({ rating: -1 })
        .limit(4 - recommendations.length);
      recommendations = [...recommendations, ...additionalItems];
    }
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: '获取推荐失败', error });
  }
});

// 默认路由
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '推荐系统后端API运行中',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      users: '/api/users',
      recommendations: '/api/recommendations/:userId'
    }
  });
});

let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.warn('MONGODB_URI 环境变量未设置，使用本地数据库');
  MONGODB_URI = 'mongodb://localhost:27017/recommendation_system';
}

// 数据库连接
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB连接成功');
  })
  .catch(err => {
    console.error('❌ MongoDB连接失败:', err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`📝 使用 npm run seed 初始化测试数据`);
});