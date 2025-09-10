// backend/src/scripts/initPurchaseCount.ts
// 为现有项目初始化购买人数（模拟数据）

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item';

dotenv.config();

const initPurchaseCount = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system');
    console.log('✅ 数据库连接成功');

    // 获取所有项目
    const items = await Item.find({});
    console.log(`📊 找到 ${items.length} 个项目需要初始化购买人数\n`);

    // 为每个项目生成随机的购买人数
    for (const item of items) {
      // 如果已有购买人数，跳过
      if (item.purchaseCount && item.purchaseCount > 0) {
        console.log(`⏭️  ${item.name} 已有购买人数: ${item.purchaseCount}`);
        continue;
      }

      // 根据评分和价格生成合理的购买人数
      let basePurchase = 0;
      
      // 根据类别设置基础购买人数
      switch (item.category) {
        case 'attraction':
          basePurchase = Math.floor(Math.random() * 5000) + 1000; // 1000-6000
          break;
        case 'food':
          basePurchase = Math.floor(Math.random() * 3000) + 500;  // 500-3500
          break;
        case 'hotel':
          basePurchase = Math.floor(Math.random() * 2000) + 300;  // 300-2300
          break;
      }
      
      // 根据评分调整（评分越高，购买人数越多）
      const ratingMultiplier = item.rating / 5;
      basePurchase = Math.floor(basePurchase * (0.5 + ratingMultiplier));
      
      // 根据价格调整（价格越低，购买人数越多）
      if (item.price < 50) {
        basePurchase = Math.floor(basePurchase * 1.5);
      } else if (item.price > 500) {
        basePurchase = Math.floor(basePurchase * 0.7);
      }
      
      // 添加一些随机性
      const finalPurchaseCount = Math.floor(basePurchase * (0.8 + Math.random() * 0.4));
      
      // 更新购买人数
      item.purchaseCount = finalPurchaseCount;
      await item.save();
      
      console.log(`✅ ${item.name}: 设置购买人数为 ${finalPurchaseCount}`);
    }

    // 显示统计
    const stats = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          avgPurchase: { $avg: '$purchaseCount' },
          maxPurchase: { $max: '$purchaseCount' },
          minPurchase: { $min: '$purchaseCount' }
        }
      }
    ]);

    console.log('\n========================================');
    console.log('📈 购买人数统计：');
    stats.forEach(stat => {
      const categoryName = stat._id === 'attraction' ? '景点' : 
                          stat._id === 'food' ? '美食' : '酒店';
      console.log(`\n${categoryName}:`);
      console.log(`  平均: ${Math.floor(stat.avgPurchase)} 人`);
      console.log(`  最高: ${stat.maxPurchase} 人`);
      console.log(`  最低: ${stat.minPurchase} 人`);
    });
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化购买人数失败:', error);
    process.exit(1);
  }
};

// 执行初始化
initPurchaseCount();