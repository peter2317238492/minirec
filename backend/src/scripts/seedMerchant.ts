// backend/src/scripts/seedMerchant.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Merchant from '../models/Merchant';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation_system';

const seedMerchants = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('已连接到数据库');

    // 清除现有商家数据
    await Merchant.deleteMany({});
    console.log('已清除现有商家数据');

    // 创建测试商家
    const testMerchant = new Merchant({
      username: 'merchant_test',
      email: 'merchant@test.com',
      password: 'merchant123',
      merchantInfo: {
        shopName: '测试商家店铺',
        description: '这是一个用于测试的商家店铺',
        address: '测试地址123号',
        phone: '13800138000',
        email: 'merchant@test.com',
        businessHours: {
          open: '09:00',
          close: '22:00'
        },
        category: 'food',
        images: [],
        status: 'approved'
      },
      permissions: {
        canAddItems: true,
        canEditItems: true,
        canDeleteItems: true,
        canViewAnalytics: true,
        canManageOrders: true,
        canRespondToReviews: true
      },
      isActive: true
    });

    await testMerchant.save();
    console.log('测试商家创建成功');
    console.log('商家信息:');
    console.log('用户名: merchant_test');
    console.log('密码: merchant123');

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
};

seedMerchants();