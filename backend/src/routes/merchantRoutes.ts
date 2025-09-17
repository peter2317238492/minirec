// backend/src/routes/merchantRoutes.ts
import { Router } from 'express';
import { merchantController } from '../controllers/merchantController';
import { merchantAuthMiddleware } from '../middleware/auth';

const router = Router();

// 商家注册
router.post('/register', merchantController.register);

// 商家登录
router.post('/login', merchantController.login);

// 第三方登录
router.post('/third-party-login', merchantController.thirdPartyLogin);

// 获取商家信息（需要认证）
router.get('/info', merchantAuthMiddleware, merchantController.getMerchantInfo);

// 更新商家信息（需要认证）
router.put('/info', merchantAuthMiddleware, merchantController.updateMerchantInfo);

// 获取登录历史（需要认证）
router.get('/login-history', merchantAuthMiddleware, merchantController.getLoginHistory);

// 获取登录统计信息（需要认证）
router.get('/login-stats', merchantAuthMiddleware, merchantController.getLoginStats);

// 获取今日登录日志（需要认证）
router.get('/login-logs', merchantAuthMiddleware, merchantController.getTodayLoginLogs);

// 获取权限模板列表（需要认证）
router.get('/permission-templates', merchantAuthMiddleware, merchantController.getPermissionTemplates);

// 获取商家权限摘要（需要认证）
router.get('/permission-summary', merchantAuthMiddleware, merchantController.getPermissionSummary);

// 更新商家权限（需要认证）
router.put('/permissions', merchantAuthMiddleware, merchantController.updatePermissions);

// 应用权限模板（需要认证）
router.post('/apply-permission-template', merchantAuthMiddleware, merchantController.applyPermissionTemplate);

// 获取商家商品评论（需要认证）
router.get('/reviews', merchantAuthMiddleware, merchantController.getReviews);

// 回复用户评论（需要认证）
router.post('/reviews/respond', merchantAuthMiddleware, merchantController.respondToReview);

export default router;