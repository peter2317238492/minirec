# ml-service/api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json

app = FastAPI()

# 数据模型
class UserPreferences(BaseModel):
    categories: List[str]
    tags: List[str]
    priceRange: List[float] = None

class PurchaseHistory(BaseModel):
    itemId: str
    itemName: str
    category: str
    price: float
    purchaseDate: datetime

class ViewHistory(BaseModel):
    itemId: str
    viewDate: datetime
    duration: int

class UserData(BaseModel):
    userId: str
    preferences: UserPreferences
    purchaseHistory: List[PurchaseHistory]
    viewHistory: List[ViewHistory]

class RecommendationRequest(BaseModel):
    userId: str
    preferences: UserPreferences
    purchaseHistory: List[PurchaseHistory]
    viewHistory: List[ViewHistory]
    topN: int = 10

# 简单的推荐模型类（示例）
class SimpleRecommendationModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.item_features = {}
        
    def train(self, items_data):
        """训练模型（这里是一个简单的示例）"""
        # 在实际应用中，这里会是复杂的机器学习模型训练过程
        pass
    
    def predict(self, user_data: UserData, items, top_n=10):
        """生成推荐"""
        # 简单的基于标签匹配的推荐逻辑
        user_tags = set(user_data.preferences.tags)
        user_categories = set(user_data.preferences.categories)
        
        scores = []
        for item in items:
            score = 0
            # 类别匹配
            if item.get('category') in user_categories:
                score += 3
            
            # 标签匹配
            item_tags = set(item.get('tags', []))
            matching_tags = user_tags.intersection(item_tags)
            score += len(matching_tags) * 2
            
            # 评分权重
            score += item.get('rating', 0) * 0.5
            
            # 价格范围匹配
            if user_data.preferences.priceRange:
                price = item.get('price', 0)
                if user_data.preferences.priceRange[0] <= price <= user_data.preferences.priceRange[1]:
                    score += 1
            
            scores.append((item, score))
        
        # 按分数排序并返回前N个
        scores.sort(key=lambda x: x[1], reverse=True)
        return [item for item, _ in scores[:top_n]]

# 初始化模型
model = SimpleRecommendationModel()

@app.get("/")
def read_root():
    return {"message": "ML Recommendation Service", "status": "running"}

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    """
    获取个性化推荐
    """
    try:
        # 这里应该从数据库获取所有可推荐的项目
        # 为了示例，我们返回模拟数据
        mock_items = [
            {
                "_id": "1",
                "category": "attraction",
                "name": "推荐景点1",
                "tags": request.preferences.tags[:2] if request.preferences.tags else [],
                "price": 100,
                "rating": 4.5
            }
        ]
        
        # 使用模型生成推荐
        user_data = UserData(
            userId=request.userId,
            preferences=request.preferences,
            purchaseHistory=request.purchaseHistory,
            viewHistory=request.viewHistory
        )
        
        recommendations = model.predict(user_data, mock_items, request.topN)
        
        return {
            "userId": request.userId,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(data: Dict[str, Any]):
    """
    训练/更新推荐模型
    """
    try:
        # 这里应该包含实际的模型训练逻辑
        # 可以使用用户的历史数据来训练协同过滤、深度学习等模型
        
        return {
            "status": "success",
            "message": "Model training completed",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user-data/import")
async def import_user_data(user_data: UserData):
    """
    导入用户数据用于离线训练
    """
    try:
        # 保存用户数据到文件或数据库
        # 这些数据将用于批量训练模型
        
        filename = f"user_data/{user_data.userId}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # 实际应用中应该保存到数据库或分布式存储
        # with open(filename, 'w') as f:
        #     json.dump(user_data.dict(), f)
        
        return {
            "status": "success",
            "message": f"User data imported for {user_data.userId}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    """健康检查端点"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
