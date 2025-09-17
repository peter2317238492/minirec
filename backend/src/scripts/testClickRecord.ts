// backend/src/scripts/testClickRecord.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

async function testClickRecord() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system';
    await mongoose.connect(mongoUri);
    console.log('✅ 已连接到数据库');

    // 查找一个用户进行测试
    const user = await User.findOne();
    if (!user) {
      console.log('❌ 没有找到用户');
      return;
    }

    console.log(`📋 测试用户: ${user.username} (ID: ${user._id})`);
    console.log(`📊 当前clickHistory: `, user.clickHistory);

    // 模拟添加点击记录
    const testItemId = '507f1f77bcf86cd799439011'; // 示例商品ID
    
    // 查找是否已有此商品的点击记录
    const existingClickIndex = user.clickHistory.findIndex(
      (click: any) => click.itemId === testItemId
    );

    if (existingClickIndex !== -1) {
      // 增加点击次数
      user.clickHistory[existingClickIndex].clickCount += 1;
      user.clickHistory[existingClickIndex].lastClickDate = new Date();
      console.log(`🔄 更新现有点击记录，新的点击次数: ${user.clickHistory[existingClickIndex].clickCount}`);
    } else {
      // 添加新的点击记录
      user.clickHistory.push({
        itemId: testItemId,
        clickCount: 1,
        lastClickDate: new Date()
      });
      console.log('➕ 添加新的点击记录');
    }

    // 保存到数据库
    await user.save();
    console.log('💾 点击记录已保存到数据库');

    // 验证保存结果
    const updatedUser = await User.findById(user._id);
    console.log(`📈 更新后的clickHistory: `, updatedUser?.clickHistory);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 数据库连接已关闭');
  }
}

// 运行测试
testClickRecord();