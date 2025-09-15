// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  merchant?: {
    merchantId: string;
    username: string;
    role: 'merchant';
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    // 检查是用户还是商家
    if (decoded.userId) {
      req.userId = decoded.userId;
    } else if (decoded.merchantId && decoded.role === 'merchant') {
      req.merchant = {
        merchantId: decoded.merchantId,
        username: decoded.username,
        role: 'merchant'
      };
    } else {
      return res.status(401).json({ message: '认证令牌无效' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: '认证令牌无效' });
  }
};

export const merchantAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    if (decoded.merchantId && decoded.role === 'merchant') {
      req.merchant = {
        merchantId: decoded.merchantId,
        username: decoded.username,
        role: 'merchant'
      };
      next();
    } else {
      return res.status(403).json({ message: '需要商家权限' });
    }
  } catch (error) {
    return res.status(401).json({ message: '认证令牌无效' });
  }
};
