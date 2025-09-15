import Merchant, { IMerchantDoc, MerchantPermission } from '../models/Merchant';

export interface PermissionTemplate {
  name: string;
  description: string;
  permissions: MerchantPermission;
}

export class PermissionService {
  /**
   * 预定义的权限模板
   */
  static getPermissionTemplates(): PermissionTemplate[] {
    return [
      {
        name: '基础版',
        description: '适合小型商家，包含基本功能',
        permissions: {
          // 商品管理权限
          canAddItems: true,
          canEditItems: true,
          canDeleteItems: false,
          canManageCategories: false,
          
          // 数据分析权限
          canViewAnalytics: true,
          canViewRevenue: true,
          canExportData: false,
          
          // 订单管理权限
          canManageOrders: true,
          canProcessRefunds: false,
          canViewCustomerInfo: true,
          
          // 评价管理权限
          canRespondToReviews: true,
          canDeleteReviews: false,
          canViewReviewAnalytics: true,
          
          // 店铺管理权限
          canUpdateShopInfo: true,
          canManageBusinessHours: true,
          canUploadImages: true,
          
          // 营销推广权限
          canCreatePromotions: false,
          canManageDiscounts: false,
          canViewMarketingStats: true,
          
          // 系统设置权限
          canManageUsers: false,
          canViewSystemLogs: false,
          canManageApiKeys: false,
        }
      },
      {
        name: '专业版',
        description: '适合中型商家，包含更多高级功能',
        permissions: {
          // 商品管理权限
          canAddItems: true,
          canEditItems: true,
          canDeleteItems: true,
          canManageCategories: true,
          
          // 数据分析权限
          canViewAnalytics: true,
          canViewRevenue: true,
          canExportData: true,
          
          // 订单管理权限
          canManageOrders: true,
          canProcessRefunds: true,
          canViewCustomerInfo: true,
          
          // 评价管理权限
          canRespondToReviews: true,
          canDeleteReviews: true,
          canViewReviewAnalytics: true,
          
          // 店铺管理权限
          canUpdateShopInfo: true,
          canManageBusinessHours: true,
          canUploadImages: true,
          
          // 营销推广权限
          canCreatePromotions: true,
          canManageDiscounts: true,
          canViewMarketingStats: true,
          
          // 系统设置权限
          canManageUsers: true,
          canViewSystemLogs: false,
          canManageApiKeys: true,
        }
      },
      {
        name: '企业版',
        description: '适合大型商家，包含所有功能',
        permissions: {
          // 商品管理权限
          canAddItems: true,
          canEditItems: true,
          canDeleteItems: true,
          canManageCategories: true,
          
          // 数据分析权限
          canViewAnalytics: true,
          canViewRevenue: true,
          canExportData: true,
          
          // 订单管理权限
          canManageOrders: true,
          canProcessRefunds: true,
          canViewCustomerInfo: true,
          
          // 评价管理权限
          canRespondToReviews: true,
          canDeleteReviews: true,
          canViewReviewAnalytics: true,
          
          // 店铺管理权限
          canUpdateShopInfo: true,
          canManageBusinessHours: true,
          canUploadImages: true,
          
          // 营销推广权限
          canCreatePromotions: true,
          canManageDiscounts: true,
          canViewMarketingStats: true,
          
          // 系统设置权限
          canManageUsers: true,
          canViewSystemLogs: true,
          canManageApiKeys: true,
        }
      }
    ];
  }

  /**
   * 根据商家状态和类型分配默认权限
   */
  static assignDefaultPermissions(merchant: IMerchantDoc): MerchantPermission {
    const templates = this.getPermissionTemplates();
    
    // 根据商家状态选择权限模板
    if (merchant.merchantInfo.status === 'pending') {
      // 待审核商家使用基础版权限
      return { ...templates[0].permissions };
    } else if (merchant.merchantInfo.status === 'approved') {
      // 已审核商家使用专业版权限
      return { ...templates[1].permissions };
    } else if (merchant.merchantInfo.status === 'suspended') {
      // 被暂停商家使用最小权限
      return {
        canAddItems: false,
        canEditItems: false,
        canDeleteItems: false,
        canManageCategories: false,
        canViewAnalytics: false,
        canViewRevenue: false,
        canExportData: false,
        canManageOrders: false,
        canProcessRefunds: false,
        canViewCustomerInfo: false,
        canRespondToReviews: false,
        canDeleteReviews: false,
        canViewReviewAnalytics: false,
        canUpdateShopInfo: false,
        canManageBusinessHours: false,
        canUploadImages: false,
        canCreatePromotions: false,
        canManageDiscounts: false,
        canViewMarketingStats: false,
        canManageUsers: false,
        canViewSystemLogs: false,
        canManageApiKeys: false,
      };
    }
    
    // 默认使用基础版权限
    return { ...templates[0].permissions };
  }

  /**
   * 更新商家权限
   */
  static async updateMerchantPermissions(
    merchantId: string,
    permissions: Partial<MerchantPermission>
  ): Promise<IMerchantDoc | null> {
    try {
      const merchant = await Merchant.findByIdAndUpdate(
        merchantId,
        { $set: { 'permissions': permissions } },
        { new: true }
      );
      
      return merchant;
    } catch (error) {
      console.error('更新商家权限失败:', error);
      return null;
    }
  }

  /**
   * 应用权限模板到商家
   */
  static async applyPermissionTemplate(
    merchantId: string,
    templateName: string
  ): Promise<IMerchantDoc | null> {
    try {
      const templates = this.getPermissionTemplates();
      const template = templates.find(t => t.name === templateName);
      
      if (!template) {
        throw new Error(`权限模板 "${templateName}" 不存在`);
      }
      
      const merchant = await Merchant.findByIdAndUpdate(
        merchantId,
        { $set: { 'permissions': template.permissions } },
        { new: true }
      );
      
      return merchant;
    } catch (error) {
      console.error('应用权限模板失败:', error);
      return null;
    }
  }

  /**
   * 检查商家是否有特定权限
   */
  static async hasPermission(
    merchantId: string,
    permission: keyof MerchantPermission
  ): Promise<boolean> {
    try {
      const merchant = await Merchant.findById(merchantId).select('permissions');
      
      if (!merchant) {
        return false;
      }
      
      return merchant.permissions[permission] || false;
    } catch (error) {
      console.error('检查权限失败:', error);
      return false;
    }
  }

  /**
   * 获取商家权限摘要
   */
  static async getPermissionSummary(merchantId: string): Promise<{
    totalPermissions: number;
    grantedPermissions: number;
    permissionGroups: {
      itemManagement: number;
      analytics: number;
      orderManagement: number;
      reviewManagement: number;
      shopManagement: number;
      marketing: number;
      systemSettings: number;
    };
  }> {
    try {
      const merchant = await Merchant.findById(merchantId).select('permissions');
      
      if (!merchant) {
        throw new Error('商家不存在');
      }
      
      const permissions = merchant.permissions;
      
      // 计算权限组
      const permissionGroups = {
        itemManagement: [
          permissions.canAddItems,
          permissions.canEditItems,
          permissions.canDeleteItems,
          permissions.canManageCategories
        ].filter(Boolean).length,
        
        analytics: [
          permissions.canViewAnalytics,
          permissions.canViewRevenue,
          permissions.canExportData
        ].filter(Boolean).length,
        
        orderManagement: [
          permissions.canManageOrders,
          permissions.canProcessRefunds,
          permissions.canViewCustomerInfo
        ].filter(Boolean).length,
        
        reviewManagement: [
          permissions.canRespondToReviews,
          permissions.canDeleteReviews,
          permissions.canViewReviewAnalytics
        ].filter(Boolean).length,
        
        shopManagement: [
          permissions.canUpdateShopInfo,
          permissions.canManageBusinessHours,
          permissions.canUploadImages
        ].filter(Boolean).length,
        
        marketing: [
          permissions.canCreatePromotions,
          permissions.canManageDiscounts,
          permissions.canViewMarketingStats
        ].filter(Boolean).length,
        
        systemSettings: [
          permissions.canManageUsers,
          permissions.canViewSystemLogs,
          permissions.canManageApiKeys
        ].filter(Boolean).length
      };
      
      const totalPermissions = Object.values(permissionGroups).reduce((sum, count) => sum + count, 0);
      const grantedPermissions = totalPermissions;
      
      return {
        totalPermissions: 21, // 总权限数
        grantedPermissions,
        permissionGroups
      };
    } catch (error) {
      console.error('获取权限摘要失败:', error);
      throw error;
    }
  }
}

export const permissionService = new PermissionService();