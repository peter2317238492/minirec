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
    try {
      // 1. 基于点击次数的推荐（前5个位置）
      const clickBasedRecommendations = await this.getClickBasedRecommendations(user);
      
      // 2. 基于偏好的推荐（后5个位置）
      const preferenceBasedRecommendations = await this.getPreferenceBasedRecommendations(user);
      
      // 3. 构建最终推荐列表
      const finalRecommendations: any[] = [];
      
      // 前5个位置：点击推荐
      const clickRecommendations = clickBasedRecommendations.slice(0, 5);
      finalRecommendations.push(...clickRecommendations);
      console.log(`点击推荐: ${clickRecommendations.length}个商品`);
      
      // 如果点击推荐不足5个，用偏好推荐补充前5个位置
      if (clickRecommendations.length < 5) {
        const clickedItemIds = new Set(clickRecommendations.map(item => item._id.toString()));
        const supplementItems = preferenceBasedRecommendations.filter(
          item => !clickedItemIds.has(item._id.toString())
        ).slice(0, 5 - clickRecommendations.length);
        finalRecommendations.push(...supplementItems);
        console.log(`点击推荐不足，用偏好推荐补充: ${supplementItems.length}个商品`);
      }
      
      // 后5个位置：偏好推荐（排除已在前5个位置的商品）
      const usedItemIds = new Set(finalRecommendations.map(item => item._id.toString()));
      const remainingPreferenceItems = preferenceBasedRecommendations.filter(
        item => !usedItemIds.has(item._id.toString())
      ).slice(0, 5);
      finalRecommendations.push(...remainingPreferenceItems);
      console.log(`偏好推荐: ${remainingPreferenceItems.length}个商品`);
      
      console.log(`最终推荐总数: ${finalRecommendations.length}个商品`);
      
      // 如果还不足10个，用默认推荐补充
      if (finalRecommendations.length < 10) {
        const defaultItems = await this.getDefaultRecommendations();
        const existingIds = new Set(finalRecommendations.map(item => item._id.toString()));
        const uniqueDefaultItems = defaultItems.filter(
          item => !existingIds.has(item._id.toString())
        );
        const stillNeed = 10 - finalRecommendations.length;
        finalRecommendations.push(...uniqueDefaultItems.slice(0, stillNeed));
      }
      
      return finalRecommendations;
    } catch (error) {
      console.error('基础推荐算法错误:', error);
      return this.getDefaultRecommendations();
    }
  }

  // 基于点击次数的推荐
  private async getClickBasedRecommendations(user: any) {
    if (!user.clickHistory || user.clickHistory.length === 0) {
      return [];
    }

    // 筛选点击次数 >= 3 的商品
    const frequentlyClickedItems = user.clickHistory
      .filter((click: any) => click.clickCount >= 3)
      .sort((a: any, b: any) => b.clickCount - a.clickCount)
      .slice(0, 5); // 限制为5个最多点击的（对应第一行）

    if (frequentlyClickedItems.length === 0) {
      return [];
    }

    const itemIds = frequentlyClickedItems.map((click: any) => click.itemId);
    
    // 获取这些商品的详细信息
    const items = await Item.find({ _id: { $in: itemIds } });
    
    // 根据用户点击次数排序
    const sortedItems = items.sort((a, b) => {
      const aClick = frequentlyClickedItems.find((click: any) => click.itemId === a._id.toString());
      const bClick = frequentlyClickedItems.find((click: any) => click.itemId === b._id.toString());
      return (bClick?.clickCount || 0) - (aClick?.clickCount || 0);
    });

    return sortedItems;
  }

  // 基于偏好的推荐
  private async getPreferenceBasedRecommendations(user: any) {
    const filter: any = {};
    
    if (user.preferences?.categories && user.preferences.categories.length > 0) {
      filter.category = { $in: user.preferences.categories };
    }
    
    if (user.preferences?.tags && user.preferences.tags.length > 0) {
      filter.tags = { $in: user.preferences.tags };
    }
    
    // 添加随机排序，让推荐更加多样化
    const items = await Item.find(filter)
      .sort({ 
        rating: -1, 
        purchaseCount: -1,
        createdAt: -1 // 添加时间排序，让新商品有机会被推荐
      })
      .limit(15); // 增加候选数量，确保有足够的商品可选
    
    // 随机打乱部分结果，增加多样性
    if (items.length > 6) {
      const topItems = items.slice(0, 6); // 保留前6个高质量推荐
      const randomItems = items.slice(6).sort(() => Math.random() - 0.5); // 随机打乱后面的
      return [...topItems, ...randomItems].slice(0, 10); // 返回10个供选择
    }
    
    return items;
  }

  // 去重函数
  private removeDuplicateItems(items: any[]) {
    const seen = new Set();
    return items.filter(item => {
      const id = item._id.toString();
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
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