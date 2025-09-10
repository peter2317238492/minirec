# 部署指南

## 🚀 部署概览

本指南详细说明了如何在不同环境中部署推荐系统。

## 🛠️ 环境要求

### 基础环境
- **Node.js**: >= 16.0.0
- **Python**: >= 3.8
- **MongoDB**: >= 4.4
- **内存**: 最少 2GB RAM
- **磁盘**: 最少 5GB 可用空间

### 开发工具
- **Git**: 版本控制
- **npm/yarn**: Node.js 包管理器
- **pip**: Python 包管理器

## 🏠 本地开发环境

### 1. 克隆项目
```bash
git clone https://github.com/peter2317238492/minirec.git
cd recommendation-system
```

### 2. 安装MongoDB

**Windows:**
1. 下载并安装 MongoDB Community Server
2. 启动MongoDB服务:
```cmd
net start MongoDB
```

**macOS (使用Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 3. 配置环境变量

在 `backend` 目录下创建 `.env` 文件:
```env
# 服务端口
PORT=5000

# MongoDB连接字符串  
MONGODB_URI=mongodb://localhost:27017/recommendation_system

# JWT密钥(生产环境请使用强密钥)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 环境标识
NODE_ENV=development

# 机器学习服务URL
ML_SERVICE_URL=http://localhost:8000

# 跨域配置
CORS_ORIGIN=http://localhost:3000
```

### 4. 安装依赖并启动服务

**后端服务:**
```bash
cd backend
npm install
npm run dev
```

**前端服务:**  
```bash
cd frontend
npm install
npm start
```

**机器学习服务:**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 初始化数据
```bash
cd backend
npm run seed
```

### 6. 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:5000  
- ML服务: http://localhost:8000
- API文档: http://localhost:8000/docs

## 🐳 Docker容器化部署

### 1. Docker配置文件

**前端 Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**后端 Dockerfile:**
```dockerfile
# backend/Dockerfile  
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 5000

CMD ["npm", "start"]
```

**机器学习服务 Dockerfile:**
```dockerfile
# ml-service/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN adduser --disabled-password --gecos '' appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Docker Compose配置

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # MongoDB数据库
  mongodb:
    image: mongo:6.0
    container_name: recommendation-db
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      MONGO_INITDB_DATABASE: recommendation_system
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    networks:
      - recommendation-network

  # Redis缓存(可选)
  redis:
    image: redis:7-alpine
    container_name: recommendation-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - recommendation-network

  # 后端API服务
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: recommendation-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb://admin:password123@mongodb:27017/recommendation_system?authSource=admin
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ML_SERVICE_URL=http://ml-service:8000
    volumes:
      - ./backend/logs:/app/logs
    networks:
      - recommendation-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # 机器学习服务
  ml-service:
    build:
      context: ./ml-service
      dockerfile: Dockerfile
    container_name: recommendation-ml
    restart: unless-stopped
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://admin:password123@mongodb:27017/recommendation_system?authSource=admin
      - PYTHONPATH=/app
    volumes:
      - ./ml-service/models:/app/models
      - ./ml-service/logs:/app/logs
    networks:
      - recommendation-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: recommendation-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    networks:
      - recommendation-network

volumes:
  mongodb_data:
  redis_data:

networks:
  recommendation-network:
    driver: bridge
```

**环境变量文件 (.env):**
```env
# 生产环境配置
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
MONGO_ROOT_PASSWORD=your-secure-mongodb-password
REDIS_PASSWORD=your-secure-redis-password
```

### 3. 启动Docker服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down

# 完全清理(包括数据卷)
docker-compose down -v --remove-orphans
```

## ☁️ 云服务器部署

### 1. 服务器配置

**推荐配置:**
- **CPU**: 2核心以上
- **内存**: 4GB RAM以上  
- **存储**: 20GB SSD
- **网络**: 5Mbps带宽
- **操作系统**: Ubuntu 20.04 LTS

### 2. 服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git build-essential

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Python和pip
sudo apt install -y python3 python3-pip

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Nginx
sudo apt install -y nginx

# 配置防火墙
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 3. Nginx反向代理配置

**/etc/nginx/sites-available/recommendation:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/recommendation-frontend;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ML服务代理
    location /ml/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
}
```

**启用站点配置:**
```bash
sudo ln -s /etc/nginx/sites-available/recommendation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL证书配置(Let's Encrypt)

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 验证自动续期
sudo certbot renew --dry-run
```

### 5. 进程管理(PM2)

**安装PM2:**
```bash
sudo npm install -g pm2
```

**PM2配置文件(ecosystem.config.js):**
```javascript
module.exports = {
  apps: [
    {
      name: 'recommendation-backend',
      script: './backend/dist/app.js',
      cwd: '/opt/recommendation-system',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/recommendation_system',
        JWT_SECRET: process.env.JWT_SECRET
      },
      log_file: './logs/app.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      time: true,
      max_memory_restart: '500M',
      node_args: '--max_old_space_size=1024'
    },
    {
      name: 'recommendation-ml',
      script: 'python3',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8000',
      cwd: '/opt/recommendation-system/ml-service',
      interpreter: 'none',
      env: {
        PYTHONPATH: '/opt/recommendation-system/ml-service'
      }
    }
  ]
};
```

**启动服务:**
```bash
# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# 监控
pm2 monit
```

## 🔧 生产环境优化

### 1. 数据库优化

**MongoDB配置(/etc/mongod.conf):**
```yaml
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # 设置合适的缓存大小
    collectionConfig:
      blockCompressor: snappy

processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp
```

**创建数据库索引:**
```javascript
// mongo shell命令
use recommendation_system

// 项目集合索引
db.items.createIndex({ "category": 1, "rating": -1 })
db.items.createIndex({ "location.city": 1 })
db.items.createIndex({ "tags": 1 })
db.items.createIndex({ "location.coordinates": "2dsphere" })
db.items.createIndex({ 
  "name": "text", 
  "description": "text", 
  "tags": "text" 
}, { 
  "default_language": "none" 
})

// 用户集合索引
db.users.createIndex({ "email": 1 }, { "unique": true })
db.users.createIndex({ "username": 1 }, { "unique": true })
```

### 2. 缓存策略

**Redis配置(/etc/redis/redis.conf):**
```conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

**应用级缓存实现:**
```typescript
// backend/src/cache/redisClient.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export const cacheService = {
  async get(key: string) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: any, expireSeconds = 3600) {
    try {
      await redis.setex(key, expireSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
};
```

### 3. 日志管理

**Winston日志配置:**
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'recommendation-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

**日志轮转配置(/etc/logrotate.d/recommendation):**
```bash
/opt/recommendation-system/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

## 📊 监控和告警

### 1. 系统监控

**安装监控工具:**
```bash
# 安装htop和iotop
sudo apt install htop iotop

# 安装netdata(实时监控)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 2. 应用监控

**健康检查端点:**
```typescript
// backend/src/routes/health.ts
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  try {
    // 检查数据库连接
    await mongoose.connection.db.admin().ping();
    health.checks.database = 'connected';
  } catch (error) {
    health.checks.database = 'disconnected';
    health.message = 'Database connection failed';
  }

  const httpCode = health.checks.database === 'connected' ? 200 : 503;
  res.status(httpCode).json(health);
});

export default router;
```

### 3. 自动化部署脚本

**deploy.sh:**
```bash
#!/bin/bash

set -e

echo "🚀 开始部署推荐系统..."

# 检查环境
if [ ! -f .env ]; then
    echo "❌ 未找到.env文件"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 构建前端
echo "🔨 构建前端..."
cd frontend
npm ci
npm run build
sudo cp -r build/* /var/www/recommendation-frontend/
cd ..

# 构建后端
echo "🔨 构建后端..."
cd backend
npm ci
npm run build
cd ..

# 重启服务
echo "🔄 重启服务..."
pm2 restart recommendation-backend
pm2 restart recommendation-ml

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🏥 进行健康检查..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)

if [ $response -eq 200 ]; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署失败，健康检查未通过"
    exit 1
fi

echo "🎉 部署完成！"
```

## 🔐 安全配置

### 1. 防火墙配置
```bash
# 配置UFW防火墙
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 2. 安全头部配置
```typescript
// 安全中间件
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. 限流配置
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: 'Too many requests, please try again later.'
  }
});

app.use('/api/', limiter);
```

## 📈 性能优化

### 1. 数据库查询优化
- 使用合适的索引
- 实施查询分页
- 使用字段投影减少数据传输
- 监控慢查询

### 2. 缓存策略
- Redis缓存热点数据
- CDN加速静态资源
- 浏览器缓存优化

### 3. 代码优化
- 使用连接池
- 实施代码分割
- 压缩静态资源
- 启用Gzip压缩

---

这份部署指南提供了从本地开发到生产环境的完整部署方案，包括Docker容器化、云服务器配置、监控告警和安全加固等各个方面的详细说明。
