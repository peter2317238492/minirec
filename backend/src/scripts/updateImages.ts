// backend/src/scripts/updateImages.ts
// 这个脚本用于更新现有项目的图片URL为真实可用的图片

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../models/Item';

dotenv.config();

// 真实的图片URL映射 - 添加索引签名
const imageUrls: { [key: string]: string[] } = {
  // 景点图片
  '故宫博物院': [
    'https://images.unsplash.com/photo-1608037521244-f1c6c7635194?w=800&q=80',
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
    'https://images.unsplash.com/photo-1537410093041-a7c593eff0ac?w=800&q=80'
  ],
  '长城-八达岭': [
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    'https://images.unsplash.com/photo-1574125967928-dbb3e56e0b78?w=800&q=80'
  ],
  '颐和园': [
    'https://images.unsplash.com/photo-1595445364671-15205e6c380c?w=800&q=80',
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80'
  ],
  '天坛公园': [
    'https://images.unsplash.com/photo-1646821827547-430e6e3e5808?w=800&q=80',
    'https://images.unsplash.com/photo-1535924196820-534d5016809f?w=800&q=80'
  ],
  '798艺术区': [
    'https://images.unsplash.com/photo-1523554888454-84137e72c3ce?w=800&q=80',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80'
  ],
  '圆明园': [
    'https://images.unsplash.com/photo-1600298881974-6be191ceeda8?w=800&q=80'
  ],
  '北海公园': [
    'https://images.unsplash.com/photo-1569154941061-e231d68b7850?w=800&q=80'
  ],
  
  // 美食图片
  '全聚德烤鸭店': [
    'https://images.unsplash.com/photo-1588347818036-558601350947?w=800&q=80',
    'https://images.unsplash.com/photo-1623653392124-ff4e645dce3c?w=800&q=80'
  ],
  '东来顺涮羊肉': [
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
    'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80'
  ],
  '姚记炒肝店': [
    'https://images.unsplash.com/photo-1617093718144-c6761337d3a6?w=800&q=80'
  ],
  '护国寺小吃': [
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'
  ],
  '海底捞火锅': [
    'https://images.unsplash.com/photo-1552566626-52fd8ef8c6b3?w=800&q=80',
    'https://images.unsplash.com/photo-1563245372-f0edb0411b1d?w=800&q=80'
  ],
  
  // 酒店图片
  '北京王府井希尔顿酒店': [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
  ],
  '北京四季酒店': [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
  ],
  '如家快捷酒店(天安门店)': [
    'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&q=80'
  ],
  '北京国贸大酒店': [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80'
  ],
  '7天连锁酒店': [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'
  ]
};

// 备用通用图片（当找不到特定图片时使用）- 添加索引签名
const fallbackImages: { [key: string]: string[] } = {
  'attraction': [
    'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80', // 中国建筑
    'https://images.unsplash.com/photo-1569154941061-e231d68b7850?w=800&q=80'  // 中式园林
  ],
  'food': [
    'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&q=80', // 中餐
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'  // 美食
  ],
  'hotel': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', // 酒店外观
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80'  // 酒店房间
  ]
};

const updateImages = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system');
    console.log('✅ 数据库连接成功');

    // 获取所有项目
    const items = await Item.find({});
    console.log(`📊 找到 ${items.length} 个项目需要更新图片`);

    // 更新每个项目的图片
    for (const item of items) {
      // 先尝试获取特定的图片
      let updatedImages = imageUrls[item.name];
      
      // 如果没有特定图片，使用类别对应的备用图片
      if (!updatedImages || updatedImages.length === 0) {
        // 将 category 转换为字符串来访问 fallbackImages
        const categoryKey = item.category as string;
        updatedImages = fallbackImages[categoryKey];
        
        // 如果连备用图片都没有，使用默认图片
        if (!updatedImages) {
          updatedImages = [
            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80'
          ];
        }
      }
      
      // 更新图片URL
      item.images = updatedImages;
      await item.save();
      
      console.log(`✅ 更新 ${item.name} 的图片 (${updatedImages.length} 张)`);
    }

    console.log('\n✅ 所有图片URL已更新完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新图片失败:', error);
    process.exit(1);
  }
};

// 执行更新
updateImages();