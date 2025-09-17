// backend/src/controllers/merchantController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Merchant from '../models/Merchant';
import Item from '../models/Item';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';
import { loginLogger } from '../services/loginLogger';
import { PermissionService, permissionService } from '../services/permissionService';

export const merchantController = {
  // 第三方登录（扩展功能）
  async thirdPartyLogin(req: Request, res: Response) {
    const startTime = Date.now();
    const loginTimeout = setTimeout(() => {
      console.error(`商家第三方登录请求超时: ${req.body.provider}`);
    }, 2000);
    
    try {
      const { provider, accessToken, merchantId } = req.body;
      
      // 1. 商家服务模块接收第三方登录请求
      console.log(`商家服务模块接收第三方登录请求: ${provider}`);
      
      // 2. 认证鉴权子系统验证第三方令牌
      // 这里应该根据不同的第三方提供商进行验证
      // 示例：验证微信、支付宝等第三方令牌
      let merchant;
      if (provider === 'wechat' && merchantId) {
        merchant = await Merchant.findById(merchantId);
      } else {
        // 其他第三方登录逻辑
        clearTimeout(loginTimeout);
        return res.status(400).json({ 
          message: '不支持的第三方登录方式',
          processingTime: `${Date.now() - startTime}ms`,
          loginStatus: 'failed',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统'
        });
      }
      
      if (!merchant) {
        clearTimeout(loginTimeout);
        return res.status(404).json({ 
          message: '商家不存在',
          processingTime: `${Date.now() - startTime}ms`,
          loginStatus: 'failed',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统'
        });
      }
      
      // 检查商家账号是否被禁用
      if (!merchant.isActive) {
        clearTimeout(loginTimeout);
        return res.status(403).json({ 
          message: '商家账号已被禁用',
          processingTime: `${Date.now() - startTime}ms`,
          loginStatus: 'failed',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统'
        });
      }
      
      // 3. 加载商家店铺信息和权限配置
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      // 确保商家有正确的权限配置
      const defaultPermissions = PermissionService.assignDefaultPermissions(merchant);
      if (JSON.stringify(merchant.permissions) !== JSON.stringify(defaultPermissions)) {
        merchant.permissions = defaultPermissions;
        await merchant.save();
      }
      
      // 记录第三方登录信息
      await merchant.recordLogin('third_party', ipAddress, userAgent);
      
      // 生成JWT
      const token = jwt.sign(
        { 
          merchantId: merchant._id, 
          username: merchant.username,
          role: 'merchant'
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      // 检查处理时间
      const processingTime = Date.now() - startTime;
      if (processingTime > 2000) {
        console.warn(`商家第三方登录处理时间超过2秒: ${processingTime}ms`);
      }
      
      // 格式化登录日期
      const loginDate = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
      
      clearTimeout(loginTimeout);
      
      // 记录第三方登录日志
      await loginLogger.logLogin(
        req,
        merchant._id.toString(),
        merchant.username,
        '第三方登录',
        `${processingTime}ms`,
        'success'
      );
      
      // 4. 返回登录结果
      res.json({
        message: '第三方登录成功',
        token,
        merchant: {
          id: merchant._id,
          username: merchant.username,
          email: merchant.email,
          merchantInfo: merchant.merchantInfo,
          permissions: merchant.permissions
        },
        loginInfo: {
          date: loginDate,
          loginType: '第三方登录',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统',
          description: '校验商家账号有效性，加载商家店铺信息和权限配置',
          processingTime: `${processingTime}ms`,
          submitter: '商家'
        },
        loginStatus: 'success'
      });
    } catch (error) {
      clearTimeout(loginTimeout);
      const processingTime = Date.now() - startTime;
      res.status(500).json({ 
        message: '第三方登录失败', 
        error,
        processingTime: `${processingTime}ms`,
        loginStatus: 'failed',
        receiver: '商家服务模块',
        handler: '认证鉴权子系统'
      });
    }
  },

  // 商家注册
  async register(req: Request, res: Response) {
    try {
      const { 
        username, 
        email, 
        password,
        shopName,
        description,
        address,
        phone,
        businessHours,
        category
      } = req.body;
      
      // 检查商家是否已存在
      const existingMerchant = await Merchant.findOne({ $or: [{ email }, { username }] });
      if (existingMerchant) {
        return res.status(400).json({ message: '用户名或邮箱已存在' });
      }
      
      // 创建新商家
      const merchant = new Merchant({
        username,
        email,
        password,
        merchantInfo: {
          shopName,
          description,
          address,
          phone,
          email,
          businessHours,
          category,
          images: []
        }
      });
      
      await merchant.save();
      
      // 生成JWT
      const token = jwt.sign(
        { 
          merchantId: merchant._id, 
          username: merchant.username,
          role: 'merchant'
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        message: '商家注册成功，等待审核',
        token,
        merchant: {
          id: merchant._id,
          username: merchant.username,
          email: merchant.email,
          merchantInfo: merchant.merchantInfo
        }
      });
    } catch (error) {
      res.status(500).json({ message: '注册失败', error });
    }
  },

  // 商家登录
  async login(req: Request, res: Response) {
    const startTime = Date.now();
    const loginTimeout = setTimeout(() => {
      console.error(`商家登录请求超时: ${req.body.username}`);
      // 这里可以添加超时处理逻辑，比如记录日志或发送通知
    }, 2000); // 2秒超时
    
    try {
      const { username, password } = req.body;
      
      // 1. 商家服务模块接收登录请求
      console.log(`商家服务模块接收登录请求: ${username}`);
      
      // 2. 认证鉴权子系统验证商家账号有效性
      const merchant = await Merchant.findOne({ username });
      if (!merchant) {
        const processingTime = Date.now() - startTime;
        clearTimeout(loginTimeout);
        
        // 记录登录失败日志
        await loginLogger.logLogin(
          req,
          undefined,
          username,
          '账号密码登录',
          `${processingTime}ms`,
          'failed',
          '用户名或密码错误'
        );
        
        return res.status(401).json({ 
          message: '用户名或密码错误',
          processingTime: `${processingTime}ms`,
          loginStatus: 'failed',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统'
        });
      }
      
      // 检查商家账号是否被禁用
      if (!merchant.isActive) {
        const processingTime = Date.now() - startTime;
        clearTimeout(loginTimeout);
        
        // 记录登录失败日志
        await loginLogger.logLogin(
          req,
          merchant._id.toString(),
          merchant.username,
          '账号密码登录',
          `${processingTime}ms`,
          'failed',
          '商家账号已被禁用'
        );
        
        return res.status(403).json({ 
          message: '商家账号已被禁用',
          processingTime: `${processingTime}ms`,
          loginStatus: 'failed',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统'
        });
      }
      
      // 验证密码
      const isPasswordValid = await merchant.comparePassword(password);
      if (!isPasswordValid) {
        const processingTime = Date.now() - startTime;
        clearTimeout(loginTimeout);
        
        // 记录登录失败日志
        await loginLogger.logLogin(
          req,
          merchant._id.toString(),
          merchant.username,
          '账号密码登录',
          `${processingTime}ms`,
          'failed',
          '用户名或密码错误'
        );
        
        return res.status(401).json({ 
          message: '用户名或密码错误',
          processingTime: `${processingTime}ms`,
          loginStatus: 'failed',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统'
        });
      }
      
      // 3. 加载商家店铺信息和权限配置
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      // 确保商家有正确的权限配置
      const defaultPermissions = PermissionService.assignDefaultPermissions(merchant);
      if (JSON.stringify(merchant.permissions) !== JSON.stringify(defaultPermissions)) {
        merchant.permissions = defaultPermissions;
        await merchant.save();
      }
      
      // 记录登录信息
      await merchant.recordLogin('password', ipAddress, userAgent);
      
      // 生成JWT
      const token = jwt.sign(
        { 
          merchantId: merchant._id, 
          username: merchant.username,
          role: 'merchant'
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      // 检查处理时间
      const processingTime = Date.now() - startTime;
      if (processingTime > 2000) {
        console.warn(`商家登录处理时间超过2秒: ${processingTime}ms`);
      }
      
      // 格式化登录日期
      const loginDate = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
      
      clearTimeout(loginTimeout);
      
      // 记录登录日志
      await loginLogger.logLogin(
        req,
        merchant._id.toString(),
        merchant.username,
        '账号密码登录',
        `${processingTime}ms`,
        'success'
      );
      
      // 4. 返回登录结果
      res.json({
        message: '登录成功',
        token,
        merchant: {
          id: merchant._id,
          username: merchant.username,
          email: merchant.email,
          merchantInfo: merchant.merchantInfo,
          permissions: merchant.permissions
        },
        loginInfo: {
          date: loginDate,
          loginType: '账号密码登录',
          receiver: '商家服务模块',
          handler: '认证鉴权子系统',
          description: '校验商家账号有效性，加载商家店铺信息和权限配置',
          processingTime: `${processingTime}ms`,
          submitter: '商家'
        },
        loginStatus: 'success'
      });
    } catch (error) {
      clearTimeout(loginTimeout);
      const processingTime = Date.now() - startTime;
      
      // 记录登录失败日志
      await loginLogger.logLogin(
        req,
        undefined,
        req.body.username || '未知用户',
        '账号密码登录',
        `${processingTime}ms`,
        'failed',
        error instanceof Error ? error.message : '未知错误'
      );
      
      res.status(500).json({ 
        message: '登录失败', 
        error,
        processingTime: `${processingTime}ms`,
        loginStatus: 'failed',
        receiver: '商家服务模块',
        handler: '认证鉴权子系统'
      });
    }
  },

  // 获取商家信息
  async getMerchantInfo(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const merchant = await Merchant.findById(merchantId).select('-password');
      
      if (!merchant) {
        return res.status(404).json({ message: '商家不存在' });
      }
      
      res.json({
        merchant: {
          id: merchant._id,
          username: merchant.username,
          email: merchant.email,
          merchantInfo: merchant.merchantInfo,
          permissions: merchant.permissions,
          lastLoginAt: merchant.lastLoginAt
        }
      });
    } catch (error) {
      res.status(500).json({ message: '获取商家信息失败', error });
    }
  },

  // 更新商家信息
  async updateMerchantInfo(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const { merchantInfo } = req.body;
      
      const merchant = await Merchant.findByIdAndUpdate(
        merchantId,
        { merchantInfo },
        { new: true }
      ).select('-password');
      
      if (!merchant) {
        return res.status(404).json({ message: '商家不存在' });
      }
      
      res.json({
        message: '商家信息更新成功',
        merchant: {
          id: merchant._id,
          username: merchant.username,
          email: merchant.email,
          merchantInfo: merchant.merchantInfo,
          permissions: merchant.permissions
        }
      });
    } catch (error) {
      res.status(500).json({ message: '更新商家信息失败', error });
    }
  },

  // 获取商家登录历史
  async getLoginHistory(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const merchant = await Merchant.findById(merchantId)
        .select('loginHistory')
        .lean();
      
      if (!merchant) {
        return res.status(404).json({ message: '商家不存在' });
      }
      
      res.json({
        loginHistory: merchant.loginHistory
      });
    } catch (error) {
      res.status(500).json({ message: '获取登录历史失败', error });
    }
  },

  // 获取登录统计信息（管理员功能）
  async getLoginStats(req: AuthRequest, res: Response) {
    try {
      // 这里可以添加管理员权限验证
      const stats = await loginLogger.getLoginStats();
      
      res.json({
        message: '获取登录统计成功',
        stats,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      res.status(500).json({ message: '获取登录统计失败', error });
    }
  },

  // 获取今日登录日志（管理员功能）
  async getTodayLoginLogs(req: AuthRequest, res: Response) {
    try {
      // 这里可以添加管理员权限验证
      const logs = await loginLogger.getTodayLogs();
      
      res.json({
        message: '获取今日登录日志成功',
        logs,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      res.status(500).json({ message: '获取今日登录日志失败', error });
    }
  },

  // 获取权限模板列表
  async getPermissionTemplates(req: AuthRequest, res: Response) {
    try {
      const templates = PermissionService.getPermissionTemplates();
      
      res.json({
        message: '获取权限模板成功',
        templates
      });
    } catch (error) {
      res.status(500).json({ message: '获取权限模板失败', error });
    }
  },

  // 获取商家权限摘要
  async getPermissionSummary(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const summary = await PermissionService.getPermissionSummary(merchantId);
      
      res.json({
        message: '获取权限摘要成功',
        summary
      });
    } catch (error) {
      res.status(500).json({ message: '获取权限摘要失败', error });
    }
  },

  // 更新商家权限
  async updatePermissions(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const { permissions } = req.body;
      
      const merchant = await PermissionService.updateMerchantPermissions(merchantId, permissions);
      
      if (!merchant) {
        return res.status(404).json({ message: '商家不存在' });
      }
      
      res.json({
        message: '更新权限成功',
        merchant: {
          id: merchant._id,
          username: merchant.username,
          permissions: merchant.permissions
        }
      });
    } catch (error) {
      res.status(500).json({ message: '更新权限失败', error });
    }
  },

  // 应用权限模板
  async applyPermissionTemplate(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }
      
      const { templateName } = req.body;
      
      const merchant = await PermissionService.applyPermissionTemplate(merchantId, templateName);
      
      if (!merchant) {
        return res.status(404).json({ message: '商家不存在或模板不存在' });
      }
      
      res.json({
        message: '应用权限模板成功',
        merchant: {
          id: merchant._id,
          username: merchant.username,
          permissions: merchant.permissions
        }
      });
    } catch (error) {
      res.status(500).json({ message: '应用权限模板失败', error });
    }
  },

  // 获取商家商品的所有评论和评分
  async getReviews(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const itemId = req.query.itemId as string;
      const sortBy = req.query.sortBy as string || 'date';
      const sortOrder = req.query.sortOrder as string === 'asc' ? 1 : -1;

      // 查找商家所有商品
      
      // 只查找商家专属商品
      const query: any = { merchantId };
      if (itemId) {
        query._id = itemId;
      }
      
      const merchantItems = await Item.find(query).select('_id name category');
      const itemIds = merchantItems.map((item: any) => item._id.toString());
      
      if (itemIds.length === 0) {
        return res.json({
          reviews: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          },
          summary: {
            averageRating: 0,
            totalReviews: 0,
            // 按类别分组的评分
            attraction: {
              averageRating: 0,
              averageTaste: 0,
              averageService: 0,
              averageEnvironment: 0,
              averageComfort: 0,
              averageLocation: 0,
              averageScenery: 0,
              averageTransportation: 0,
              totalReviews: 0
            },
            food: {
              averageRating: 0,
              averageTaste: 0,
              averageService: 0,
              averageEnvironment: 0,
              averageComfort: 0,
              averageLocation: 0,
              averageScenery: 0,
              averageTransportation: 0,
              totalReviews: 0
            },
            hotel: {
              averageRating: 0,
              averageTaste: 0,
              averageService: 0,
              averageEnvironment: 0,
              averageComfort: 0,
              averageLocation: 0,
              averageScenery: 0,
              averageTransportation: 0,
              totalReviews: 0
            }
          }
        });
      }

      // 获取评论
      const reviewsQuery: any = { itemId: { $in: itemIds } };
      
      const total = await Review.countDocuments(reviewsQuery);
      const reviews = await Review.find(reviewsQuery)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // 获取商品名称映射
      const itemMap = new Map();
      const itemCategoryMap = new Map();
      merchantItems.forEach((item: any) => {
        itemMap.set(item._id.toString(), item.name);
        itemCategoryMap.set(item._id.toString(), item.category);
      });

      // 添加商品名称到评论中
      const reviewsWithItemName = reviews.map((review: any) => ({
        ...review,
        itemName: itemMap.get(review.itemId.toString()) || '未知商品',
        itemCategory: itemCategoryMap.get(review.itemId.toString()) || 'unknown'
      }));

      // 计算统计数据
      const allReviews = await Review.find(reviewsQuery).lean();
      
      // 按类别分组的评论
      const reviewsByCategory = {
        attraction: allReviews.filter((review: any) => 
          itemCategoryMap.get(review.itemId.toString()) === 'attraction'
        ),
        food: allReviews.filter((review: any) => 
          itemCategoryMap.get(review.itemId.toString()) === 'food'
        ),
        hotel: allReviews.filter((review: any) => 
          itemCategoryMap.get(review.itemId.toString()) === 'hotel'
        )
      };

      // 计算总体统计数据
      const summary = {
        averageRating: 0,
        totalReviews: allReviews.length,
        // 按类别分组的评分
        attraction: {
          averageRating: 0,
          averageTaste: 0,
          averageService: 0,
          averageEnvironment: 0,
          averageComfort: 0,
          averageLocation: 0,
          averageScenery: 0,
          averageTransportation: 0,
          totalReviews: 0
        },
        food: {
          averageRating: 0,
          averageTaste: 0,
          averageService: 0,
          averageEnvironment: 0,
          averageComfort: 0,
          averageLocation: 0,
          averageScenery: 0,
          averageTransportation: 0,
          totalReviews: 0
        },
        hotel: {
          averageRating: 0,
          averageTaste: 0,
          averageService: 0,
          averageEnvironment: 0,
          averageComfort: 0,
          averageLocation: 0,
          averageScenery: 0,
          averageTransportation: 0,
          totalReviews: 0
        }
      };

      // 计算总体平均评分
      if (allReviews.length > 0) {
        const sum = allReviews.reduce((acc: any, review: any) => {
          acc.rating += review.rating || 0;
          return acc;
        }, { rating: 0 });
        summary.averageRating = Number((sum.rating / allReviews.length).toFixed(2));
      }

      // 计算各类别评分
      ['attraction', 'food', 'hotel'].forEach(category => {
        const categoryReviews = reviewsByCategory[category as keyof typeof reviewsByCategory];
        const categorySummary = summary[category as keyof typeof summary] as any;
        categorySummary.totalReviews = categoryReviews.length;
        
        if (categoryReviews.length > 0) {
          const sum = categoryReviews.reduce((acc: any, review: any) => {
            acc.rating += review.rating || 0;
            acc.taste += review.taste || 0;
            acc.service += review.service || 0;
            acc.environment += review.environment || 0;
            acc.comfort += review.comfort || 0;
            acc.location += review.location || 0;
            acc.scenery += review.scenery || 0;
            acc.transportation += review.transportation || 0;
            return acc;
          }, { rating: 0, taste: 0, service: 0, environment: 0, comfort: 0, location: 0, scenery: 0, transportation: 0 });

          categorySummary.averageRating = Number((sum.rating / categoryReviews.length).toFixed(2));
          categorySummary.averageTaste = Number((sum.taste / categoryReviews.filter((r: any) => r.taste).length).toFixed(2)) || 0;
          categorySummary.averageService = Number((sum.service / categoryReviews.filter((r: any) => r.service).length).toFixed(2)) || 0;
          categorySummary.averageEnvironment = Number((sum.environment / categoryReviews.filter((r: any) => r.environment).length).toFixed(2)) || 0;
          categorySummary.averageComfort = Number((sum.comfort / categoryReviews.filter((r: any) => r.comfort).length).toFixed(2)) || 0;
          categorySummary.averageLocation = Number((sum.location / categoryReviews.filter((r: any) => r.location).length).toFixed(2)) || 0;
          categorySummary.averageScenery = Number((sum.scenery / categoryReviews.filter((r: any) => r.scenery).length).toFixed(2)) || 0;
          categorySummary.averageTransportation = Number((sum.transportation / categoryReviews.filter((r: any) => r.transportation).length).toFixed(2)) || 0;
        }
      });

      res.json({
        reviews: reviewsWithItemName,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary
      });
    } catch (error) {
      console.error('获取商家评论失败:', error);
      res.status(500).json({ message: '获取评论失败', error });
    }
  },

  // 回复用户评论
  async respondToReview(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.merchant?.merchantId;
      
      if (!merchantId) {
        return res.status(401).json({ message: '未授权访问' });
      }

      const { reviewId, response } = req.body;
      
      if (!reviewId || !response) {
        return res.status(400).json({ message: '评论ID和回复内容不能为空' });
      }

      // 检查商家是否有回复权限
      const merchant = await Merchant.findById(merchantId);
      if (!merchant || !merchant.permissions.canRespondToReviews) {
        return res.status(403).json({ message: '没有回复评论的权限' });
      }

      // 检查评论是否属于商家的商品
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: '评论不存在' });
      }

      const item = await Item.findOne({ _id: review.itemId, merchantId });
      if (!item) {
        return res.status(403).json({ message: '只能回复自己商品的评论' });
      }

      // 更新评论，添加商家回复
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { 
          merchantResponse: response,
          merchantResponseDate: new Date()
        },
        { new: true }
      ).lean();

      res.json({
        message: '回复成功',
        review: updatedReview
      });
    } catch (error) {
      console.error('回复评论失败:', error);
      res.status(500).json({ message: '回复评论失败', error });
    }
  }
};