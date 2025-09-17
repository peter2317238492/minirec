// backend/src/scripts/migrateClickHistory.ts
import mongoose from 'mongoose';
import User from '../models/User';

async function migrateClickHistory() {
  try {
    // 查找所有没有clickHistory字段的用户
    const usersWithoutClickHistory = await User.find({
      $or: [
        { clickHistory: { $exists: false } },
        { clickHistory: null }
      ]
    });

    console.log(`📊 找到 ${usersWithoutClickHistory.length} 个需要迁移clickHistory字段的用户`);

    if (usersWithoutClickHistory.length === 0) {
      console.log('✅ 所有用户都已有clickHistory字段');
      return;
    }

    // 批量更新用户，添加空的clickHistory数组
    const updateResult = await User.updateMany(
      {
        $or: [
          { clickHistory: { $exists: false } },
          { clickHistory: null }
        ]
      },
      {
        $set: {
          clickHistory: []
        }
      }
    );

    console.log(`✅ 成功为 ${updateResult.modifiedCount} 个用户添加了clickHistory字段`);

    // 验证迁移结果
    const totalUsers = await User.countDocuments();
    const usersWithClickHistory = await User.countDocuments({
      clickHistory: { $exists: true }
    });

    if (totalUsers === usersWithClickHistory) {
      console.log('🎉 clickHistory字段迁移完成！');
    } else {
      console.log(`⚠️  迁移可能不完整: ${usersWithClickHistory}/${totalUsers} 用户有clickHistory字段`);
    }

  } catch (error) {
    console.error('❌ clickHistory字段迁移失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateClickHistory()
    .then(() => {
      console.log('🏁 迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 迁移脚本执行失败:', error);
      process.exit(1);
    });
}

export default migrateClickHistory;