import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import Item from './models/Item';
import User from './models/User';
import itemRoutes from './routes/itemRoutes';
import merchantRoutes from './routes/merchantRoutes';
import userRoutes from './routes/userRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import migrateClickHistory from './scripts/migrateClickHistory';

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



/** ========= 路由挂载 ========= */
// ⚠️ 这里挂载 items 路由，app.ts 里不要再定义 /api/items，避免冲突
app.use('/api/items', itemRoutes);

// 商家路由
app.use('/api/merchants', merchantRoutes);

// 用户路由
app.use('/api/users', userRoutes);

// 推荐路由
app.use('/api/recommendations', recommendationRoutes);



// 默认路由
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '推荐系统后端API运行中',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      users: '/api/users',
      merchants: '/api/merchants',
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
  .then(async () => {
    console.log('✅ MongoDB连接成功');
    
    // 自动运行clickHistory字段迁移
    try {
      console.log('🔄 检查是否需要迁移clickHistory字段...');
      await migrateClickHistory();
    } catch (error) {
      console.error('⚠️  clickHistory迁移失败:', error);
      // 不阻止服务器启动，只记录错误
    }
  })
  .catch((err) => console.error('❌ MongoDB连接失败:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`📍 访问: http://localhost:${PORT}`);
  console.log(`📝 如需初始化测试数据: npm run seed`);
});

export default app;
