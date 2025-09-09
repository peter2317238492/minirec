# API 接口文档

## 📋 接口概览

推荐系统提供RESTful API，支持用户认证、项目管理、推荐算法等功能。

**基础信息:**
- 基础URL: `http://localhost:5000`
- 数据格式: JSON
- 认证方式: JWT Bearer Token
- 字符编码: UTF-8

## 🔐 认证说明

大部分接口需要在请求头中包含JWT认证令牌：

```http
Authorization: Bearer <your-jwt-token>
```

## 📝 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 🔑 用户认证接口

### 用户注册
**POST** `/api/users/register`

注册新用户账号。

**请求参数:**
```json
{
  "username": "string",     // 用户名，3-30字符
  "email": "string",        // 邮箱地址
  "password": "string"      // 密码，最少6位
}
```

**响应示例:**
```json
{
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8b2e4c123456789abcdef",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**错误码:**
- `400` - 用户名或邮箱已存在
- `400` - 参数验证失败

### 用户登录
**POST** `/api/users/login`

用户登录验证。

**请求参数:**
```json
{
  "username": "string",     // 用户名
  "password": "string"      // 密码
}
```

**响应示例:**
```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8b2e4c123456789abcdef",
    "username": "testuser",
    "email": "test@example.com",
    "preferences": {
      "categories": ["attraction", "food"],
      "tags": ["文化", "历史"]
    }
  }
}
```

**错误码:**
- `401` - 用户名或密码错误

### 更新用户偏好
**PUT** `/api/users/{userId}/preferences` 🔐

更新用户的偏好设置。

**请求参数:**
```json
{
  "categories": ["attraction", "food", "hotel"],  // 偏好类别
  "tags": ["文化", "历史", "自然"],                // 偏好标签
  "priceRange": [0, 500]                       // 价格区间
}
```

**响应示例:**
```json
{
  "message": "偏好更新成功",
  "preferences": {
    "categories": ["attraction", "food"],
    "tags": ["文化", "历史"],
    "priceRange": [0, 500]
  }
}
```

### 记录购买历史
**POST** `/api/users/{userId}/purchase` 🔐

记录用户的购买行为。

**请求参数:**
```json
{
  "itemId": "string",       // 项目ID
  "itemName": "string",     // 项目名称
  "category": "string",     // 项目类别
  "price": 100             // 购买价格
}
```

**响应示例:**
```json
{
  "message": "购买记录成功"
}
```

## 📦 项目管理接口

### 获取项目列表
**GET** `/api/items`

获取项目列表，支持筛选和搜索。

**查询参数:**
- `category` (string): 类别筛选 (`attraction`/`food`/`hotel`/`all`)
- `tags` (string): 标签筛选，多个标签用逗号分隔
- `minPrice` (number): 最低价格
- `maxPrice` (number): 最高价格  
- `city` (string): 城市筛选
- `search` (string): 搜索关键词

**示例请求:**
```http
GET /api/items?category=attraction&city=北京&search=故宫&minPrice=0&maxPrice=200
```

**响应示例:**
```json
[
  {
    "_id": "64f8b2e4c123456789abcdef",
    "category": "attraction",
    "name": "故宫博物院",
    "description": "中国明清两代的皇家宫殿...",
    "images": ["http://example.com/image1.jpg"],
    "price": 60,
    "rating": 4.8,
    "location": {
      "city": "北京",
      "address": "北京市东城区景山前街4号"
    },
    "tags": ["历史", "文化", "古建筑"],
    "reviews": [
      {
        "userId": "user123",
        "userName": "张三",
        "rating": 5,
        "comment": "非常震撼的历史建筑",
        "date": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
]
```

### 获取项目详情
**GET** `/api/items/{itemId}`

获取指定项目的详细信息。

**路径参数:**
- `itemId` (string): 项目ID

**响应示例:**
```json
{
  "_id": "64f8b2e4c123456789abcdef",
  "category": "attraction",
  "name": "故宫博物院",
  "description": "中国明清两代的皇家宫殿，世界文化遗产...",
  "images": [
    "http://example.com/image1.jpg",
    "http://example.com/image2.jpg"
  ],
  "price": 60,
  "rating": 4.8,
  "location": {
    "city": "北京",
    "address": "北京市东城区景山前街4号",
    "coordinates": [116.397, 39.917]
  },
  "tags": ["历史", "文化", "古建筑"],
  "details": {
    "openingHours": "08:30-17:00",
    "ticketTypes": ["成人票", "学生票", "老人票"]
  },
  "reviews": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**错误码:**
- `404` - 项目不存在

### 创建新项目
**POST** `/api/items` 🔐

创建新的项目(需要管理员权限)。

**请求参数:**
```json
{
  "category": "attraction",
  "name": "项目名称",
  "description": "项目描述",
  "images": ["图片URL1", "图片URL2"],
  "price": 100,
  "location": {
    "city": "城市名",
    "address": "详细地址",
    "coordinates": [116.397, 39.917]
  },
  "tags": ["标签1", "标签2"],
  "details": {}
}
```

**响应示例:**
```json
{
  "message": "项目创建成功",
  "item": {
    "_id": "64f8b2e4c123456789abcdef",
    "category": "attraction",
    "name": "项目名称",
    // ... 其他字段
  }
}
```

### 添加项目评论
**POST** `/api/items/{itemId}/reviews` 🔐

为指定项目添加用户评论。

**路径参数:**
- `itemId` (string): 项目ID

**请求参数:**
```json
{
  "userId": "string",       // 评论用户ID
  "userName": "string",     // 用户名
  "rating": 5,             // 评分1-5
  "comment": "string"      // 评论内容
}
```

**响应示例:**
```json
{
  "message": "评论添加成功",
  "item": {
    "_id": "64f8b2e4c123456789abcdef",
    "name": "项目名称",
    "rating": 4.6,  // 更新后的平均评分
    "reviews": [
      // 包含新评论的评论列表
    ]
  }
}
```

## 🤖 推荐系统接口

### 获取个性化推荐
**GET** `/api/recommendations/{userId}` 🔐

基于用户偏好和历史行为获取个性化推荐。

**路径参数:**
- `userId` (string): 用户ID

**查询参数:**
- `limit` (number): 推荐数量，默认10

**响应示例:**
```json
[
  {
    "_id": "64f8b2e4c123456789abcdef",
    "category": "attraction",
    "name": "推荐景点1",
    "description": "基于您的偏好推荐...",
    "price": 80,
    "rating": 4.7,
    "location": {
      "city": "北京",
      "address": "..."
    },
    "tags": ["文化", "历史"],
    "matchScore": 0.95  // 推荐匹配分数
  }
]
```

**错误码:**
- `404` - 用户不存在

## 🧠 机器学习服务接口

### 获取ML推荐
**POST** `/ml/recommend`

调用机器学习服务获取推荐结果。

**请求参数:**
```json
{
  "userId": "string",
  "preferences": {
    "categories": ["attraction"],
    "tags": ["文化", "历史"]
  },
  "purchaseHistory": [
    {
      "itemId": "item123",
      "itemName": "项目名",
      "category": "attraction",
      "price": 100,
      "purchaseDate": "2024-01-15T10:00:00Z"
    }
  ],
  "viewHistory": [
    {
      "itemId": "item456",
      "viewDate": "2024-01-15T10:30:00Z",
      "duration": 120
    }
  ],
  "topN": 10
}
```

**响应示例:**
```json
{
  "userId": "user123",
  "recommendations": [
    {
      "_id": "1",
      "category": "attraction",
      "name": "推荐景点1",
      "tags": ["文化", "历史"],
      "price": 100,
      "rating": 4.5,
      "score": 0.95
    }
  ],
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### 训练推荐模型
**POST** `/ml/train`

触发推荐模型的训练或更新。

**请求参数:**
```json
{
  "trainingData": {
    "users": [...],
    "items": [...],
    "interactions": [...]
  },
  "modelConfig": {
    "algorithm": "hybrid",
    "parameters": {...}
  }
}
```

**响应示例:**
```json
{
  "status": "success",
  "message": "Model training completed",
  "timestamp": "2024-01-15T12:00:00Z",
  "metrics": {
    "accuracy": 0.89,
    "precision": 0.85,
    "recall": 0.82
  }
}
```

## 🔍 数据模型说明

### Item (项目)
```typescript
interface Item {
  _id: string;                          // 项目ID
  category: 'attraction'|'food'|'hotel'; // 项目类别
  name: string;                         // 项目名称
  description: string;                  // 详细描述
  images: string[];                     // 图片URL数组
  price: number;                        // 价格
  rating: number;                       // 平均评分 0-5
  location: {
    city: string;                       // 城市
    address: string;                    // 详细地址
    coordinates?: [number, number];     // 坐标[经度,纬度]
  };
  tags: string[];                       // 标签数组
  details: any;                         // 扩展信息
  reviews: Review[];                    // 用户评论
  createdAt: Date;                     // 创建时间
  updatedAt: Date;                     // 更新时间
}
```

### User (用户)
```typescript
interface User {
  _id: string;                         // 用户ID
  username: string;                    // 用户名
  email: string;                       // 邮箱
  password: string;                    // 加密密码
  preferences: {
    categories: string[];              // 偏好类别
    tags: string[];                    // 偏好标签
    priceRange: [number, number];      // 价格区间
  };
  purchaseHistory: Purchase[];         // 购买历史
  createdAt: Date;                    // 注册时间
  updatedAt: Date;                    // 更新时间
}
```

### Review (评论)
```typescript
interface Review {
  userId: string;                      // 评论用户ID
  userName: string;                    // 用户名
  rating: number;                      // 评分 1-5
  comment: string;                     // 评论内容
  date: Date;                         // 评论时间
}
```

### Purchase (购买记录)
```typescript
interface Purchase {
  itemId: string;                      // 项目ID
  itemName: string;                    // 项目名称
  category: string;                    // 项目类别
  price: number;                      // 购买价格
  purchaseDate: Date;                 // 购买时间
}
```

## ⚠️ 错误码说明

### HTTP状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权/认证失败
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器内部错误

### 业务错误码
```typescript
enum ErrorCode {
  // 用户相关
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // 项目相关
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_EXISTS = 'ITEM_EXISTS',
  
  // 认证相关
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // 验证相关
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // 系统相关
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

## 📚 使用示例

### JavaScript/TypeScript 客户端

```typescript
// 安装axios: npm install axios

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 自动添加认证令牌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 使用示例
class RecommendationAPI {
  // 用户登录
  async login(username: string, password: string) {
    const response = await api.post('/users/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  }
  
  // 获取推荐
  async getRecommendations(userId: string) {
    const response = await api.get(`/recommendations/${userId}`);
    return response.data;
  }
  
  // 获取项目列表
  async getItems(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const response = await api.get('/items', { params: filters });
    return response.data;
  }
  
  // 添加评论
  async addReview(itemId: string, review: {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }) {
    const response = await api.post(`/items/${itemId}/reviews`, review);
    return response.data;
  }
}

// 使用API
const recAPI = new RecommendationAPI();

// 登录并获取推荐
try {
  const { user } = await recAPI.login('testuser', 'password123');
  const recommendations = await recAPI.getRecommendations(user.id);
  console.log('推荐结果:', recommendations);
} catch (error) {
  console.error('操作失败:', error.response?.data?.message);
}
```

### Python 客户端

```python
# pip install requests

import requests
from typing import Dict, List, Optional

class RecommendationAPI:
    def __init__(self, base_url: str = "http://localhost:5000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def set_token(self, token: str):
        """设置认证令牌"""
        self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def login(self, username: str, password: str) -> Dict:
        """用户登录"""
        response = self.session.post(f'{self.base_url}/users/login', 
                                   json={'username': username, 'password': password})
        response.raise_for_status()
        data = response.json()
        self.set_token(data['token'])
        return data
    
    def get_items(self, **filters) -> List[Dict]:
        """获取项目列表"""
        response = self.session.get(f'{self.base_url}/items', params=filters)
        response.raise_for_status()
        return response.json()
    
    def get_recommendations(self, user_id: str) -> List[Dict]:
        """获取推荐"""
        response = self.session.get(f'{self.base_url}/recommendations/{user_id}')
        response.raise_for_status()
        return response.json()

# 使用示例
api = RecommendationAPI()

# 登录
login_result = api.login('testuser', 'password123')
user_id = login_result['user']['id']

# 获取推荐
recommendations = api.get_recommendations(user_id)
print(f"获取到 {len(recommendations)} 个推荐项目")

# 搜索景点
attractions = api.get_items(category='attraction', search='故宫')
print(f"找到 {len(attractions)} 个相关景点")
```

## 🚀 测试工具

### Postman 集合

可以导入以下Postman集合来快速测试API：

```json
{
  "info": {
    "name": "推荐系统API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "用户认证",
      "item": [
        {
          "name": "用户注册",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/api/users/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "users", "register"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

### cURL 命令示例

```bash
# 用户注册
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'

# 用户登录
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# 获取项目列表
curl -X GET "http://localhost:5000/api/items?category=attraction&city=北京"

# 获取推荐(需要认证)
curl -X GET http://localhost:5000/api/recommendations/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

这份API文档提供了推荐系统所有接口的详细说明，包括请求参数、响应格式、错误处理和使用示例，方便前端开发者和第三方集成使用。
