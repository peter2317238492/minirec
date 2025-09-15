// backend/src/services/recommendationService.ts
import axios from 'axios';
import User from '../models/User';
import Item from '../models/Item';

export class RecommendationService {
  private mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  // 获取个性化推荐（预留ML模型接口）
  async getPersonalizedRecommendations(userId: string) {
    try {
      // 获取用户数据
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 使用基本推荐算法
      const recommendations = await this.getBasicRecommendations(user);
      return recommendations;
    } catch (error) {
      console.error('获取推荐失败:', error);
      // 返回默认推荐
      return this.getDefaultRecommendations();
    }
  }

  // 基础推荐算法（临时使用）
  private async getBasicRecommendations(user: any) {
    const filter: any = {};
    
    if (user.preferences.categories.length > 0) {
      filter.category = { $in: user.preferences.categories };
    }
    
    if (user.preferences.tags.length > 0) {
      filter.tags = { $in: user.preferences.tags };
    }
    
    const items = await Item.find(filter)
      .sort({ rating: -1 })
      .limit(10);
    
    return items;
  }

  // 默认推荐（热门项目）
  private async getDefaultRecommendations() {
    return Item.find()
      .sort({ rating: -1, 'reviews.length': -1 })
      .limit(10);
  }

  // 导出用户数据用于模型训练
  async exportUserDataForTraining(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      userId,
      preferences: user.preferences,
      purchaseHistory: user.purchaseHistory,
      viewHistory: user.viewHistory,
      exportDate: new Date()
    };
  }
}