import { Request } from 'express';
import fs from 'fs';
import path from 'path';

export interface LoginLogEntry {
  timestamp: string;
  date: string;
  loginType: '账号密码登录' | '第三方登录';
  receiver: '商家服务模块';
  handler: '认证鉴权子系统';
  description: '校验商家账号有效性，加载商家店铺信息和权限配置';
  processingTime: string;
  submitter: '商家';
  merchantId?: string;
  username?: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'timeout';
  errorMessage?: string;
}

class LoginLogger {
  private logFilePath: string;

  constructor() {
    // 确保logs目录存在
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // 按日期创建日志文件
    const today = new Date().toISOString().split('T')[0];
    this.logFilePath = path.join(logsDir, `merchant-login-${today}.log`);
  }

  /**
   * 记录商家登录日志
   */
  async logLogin(
    req: Request,
    merchantId?: string,
    username?: string,
    loginType: '账号密码登录' | '第三方登录' = '账号密码登录',
    processingTime: string = '0ms',
    status: 'success' | 'failed' | 'timeout' = 'success',
    errorMessage?: string
  ): Promise<void> {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
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
      
      const logEntry: LoginLogEntry = {
        timestamp: new Date().toISOString(),
        date: loginDate,
        loginType,
        receiver: '商家服务模块',
        handler: '认证鉴权子系统',
        description: '校验商家账号有效性，加载商家店铺信息和权限配置',
        processingTime,
        submitter: '商家',
        merchantId,
        username,
        ipAddress,
        userAgent,
        status,
        errorMessage
      };

      // 写入日志文件
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFilePath, logLine);
      
      // 同时输出到控制台
      console.log(`[商家登录日志] ${username || merchantId} - ${status} - ${processingTime}`);
      
    } catch (error) {
      console.error('写入登录日志失败:', error);
    }
  }

  /**
   * 获取今日登录日志
   */
  async getTodayLogs(): Promise<LoginLogEntry[]> {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return [];
      }
      
      const logContent = fs.readFileSync(this.logFilePath, 'utf8');
      const logLines = logContent.trim().split('\n');
      
      return logLines
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      console.error('读取登录日志失败:', error);
      return [];
    }
  }

  /**
   * 获取登录统计信息
   */
  async getLoginStats(): Promise<{
    total: number;
    success: number;
    failed: number;
    timeout: number;
    averageProcessingTime: number;
    slowLogins: number; // 超过2秒的登录次数
  }> {
    try {
      const logs = await this.getTodayLogs();
      
      const stats = {
        total: logs.length,
        success: 0,
        failed: 0,
        timeout: 0,
        averageProcessingTime: 0,
        slowLogins: 0
      };
      
      let totalProcessingTime = 0;
      let validProcessingTimes = 0;
      
      logs.forEach(log => {
        // 统计状态
        if (log.status === 'success') stats.success++;
        else if (log.status === 'failed') stats.failed++;
        else if (log.status === 'timeout') stats.timeout++;
        
        // 统计处理时间
        const processingTimeMs = parseInt(log.processingTime.replace('ms', ''));
        if (!isNaN(processingTimeMs)) {
          totalProcessingTime += processingTimeMs;
          validProcessingTimes++;
          
          if (processingTimeMs > 2000) {
            stats.slowLogins++;
          }
        }
      });
      
      // 计算平均处理时间
      if (validProcessingTimes > 0) {
        stats.averageProcessingTime = Math.round(totalProcessingTime / validProcessingTimes);
      }
      
      return stats;
    } catch (error) {
      console.error('获取登录统计失败:', error);
      return {
        total: 0,
        success: 0,
        failed: 0,
        timeout: 0,
        averageProcessingTime: 0,
        slowLogins: 0
      };
    }
  }

  /**
   * 清理旧日志文件（保留最近30天）
   */
  async cleanupOldLogs(): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      const files = fs.readdirSync(logsDir);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      files.forEach(file => {
        if (file.startsWith('merchant-login-') && file.endsWith('.log')) {
          const filePath = path.join(logsDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            console.log(`已删除旧日志文件: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('清理旧日志失败:', error);
    }
  }
}

// 创建单例实例
export const loginLogger = new LoginLogger();

// 每天凌晨清理一次旧日志
setInterval(async () => {
  await loginLogger.cleanupOldLogs();
}, 24 * 60 * 60 * 1000);