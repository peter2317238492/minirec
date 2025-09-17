// backend/src/scripts/runMigration.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import migrateClickHistory from './migrateClickHistory';

// 加载环境变量
dotenv.config();

async function runMigration() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system';
    await mongoose.connect(mongoUri);
    console.log('✅ 已连接到数据库');

    // 运行迁移
    await migrateClickHistory();
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('📪 数据库连接已关闭');
    process.exit(0);
  }
}

// 运行迁移
runMigration();