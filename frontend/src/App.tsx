// frontend/src/App.tsx - 简化后的主文件
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

// 导入组件
import SearchBar from './components/SearchBar';
import ReviewModal from './components/ReviewModal';
import ImageGallery from './components/ImageGallery';
import ItemCard from './components/ItemCard';
import ItemDetail from './components/ItemDetail';
import LoginModal from './components/LoginModal';
import PreferencesModal from './components/PreferencesModal';
import StarRating from './components/StarRating';

// 导入类型和服务
import { Item, User } from './types';
import { apiService } from './services/api';

// 配置axios
axios.defaults.baseURL = 'minirec-production.up.railway.app:8080';

function App() {
  // 状态管理
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegister, setIsRegister] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 初始化
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    loadItems();
  }, []);

  // 监听类别和搜索变化
  useEffect(() => {
    loadItems();
  }, [selectedCategory, searchQuery]);

  // 监听用户登录状态
  useEffect(() => {
    if (user && token) {
      loadRecommendations();
    }
  }, [user, token]);

const loadItems = async () => {
  setLoading(true);
  console.log('====== 前端loadItems开始 ======');
  console.log('当前状态 - selectedCategory:', selectedCategory);
  console.log('当前状态 - searchQuery:', searchQuery, 'type:', typeof searchQuery);
  
  try {
    const params: any = {};
    
    // 处理类别筛选
    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
      console.log('添加category参数:', selectedCategory);
    }
    
    // 处理搜索查询
    if (searchQuery && searchQuery.trim() !== '') {
      params.search = searchQuery.trim();
      console.log('添加search参数:', params.search);
    }
    
    console.log('最终请求参数:', params);
    console.log('请求URL将是:', '/api/items', params);
    
    const response = await axios.get('/api/items', { params });
    console.log('响应数据长度:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('第一个结果:', response.data[0].name);
    }
    
    setItems(response.data);
    console.log('====== 前端loadItems结束 ======\n');
  } catch (error) {
    console.error('加载项目失败:', error);
    setItems([]);
  } finally {
    setLoading(false);
  }
};

  // 加载推荐
  const loadRecommendations = async () => {
    if (!user || !token) return;
    try {
      const data = await apiService.getRecommendations(user.id, token);
      setRecommendations(data);
    } catch (error) {
      console.error('加载推荐失败:', error);
    }
  };

  // 获取项目详情
  const fetchItemById = async (id: string) => {
    try {
      const data = await apiService.getItemById(id);
      setSelectedItem(data);
    } catch (error) {
      console.error('获取项目详情失败:', error);
    }
  };

  // 处理登录
  const handleLogin = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  // 处理登出
  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setRecommendations([]);
  };

  // 处理购买
  const handlePurchase = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
  
    if (selectedItem) {
      try {
        console.log('发起购买请求:', {
          userId: user.id,
          itemId: selectedItem._id,
          itemName: selectedItem.name,
          category: selectedItem.category,
          price: selectedItem.price
        });
      
        const response = await axios.post(
          `/api/users/${user.id}/purchase`,
          {
            itemId: selectedItem._id,
            itemName: selectedItem.name,
            category: selectedItem.category,
            price: selectedItem.price
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
              }
            }
          );

        console.log('购买响应:', response.data);
      
        if (response.data.success) {
          alert('购买成功！即将跳转到支付页面...');
          // 重新加载项目以更新购买人数
          await fetchItemById(selectedItem._id);
          loadItems();
        }
      } catch (error: any) {
        console.error('购买失败 - 详细错误:', error.response || error);
      
        // 更详细的错误提示
        if (error.response?.status === 401) {
          alert('登录已过期，请重新登录');
          handleLogout();
        } else if (error.response?.status === 404) {
          alert('用户信息错误，请重新登录');
        } else {
          alert(error.response?.data?.message || '购买失败，请重试');
        }
      }
    }
  };

  // 处理偏好保存
  const handleSavePreferences = (preferences: any) => {
    if (user) {
      setUser({ ...user, preferences });
      loadRecommendations();
    }
  };

  // 处理评论提交
  const handleReviewSubmit = async (payload: any) => {
    if (!selectedItem || !user) return;
    try {
      await apiService.addReview(selectedItem._id, {
        userId: user.id,
        userName: user.username,
        ...payload
      });
      
      // 重新获取详情以更新评论
      await fetchItemById(selectedItem._id);
      setShowReviewModal(false);
      alert('评论提交成功！');
    } catch (error) {
      console.error('提交评论失败', error);
      alert('评论提交失败，请重试');
    }
  };

const handleSearch = (query: string) => {
  console.log('====== handleSearch被调用 ======');
  console.log('接收到的搜索词:', query);
  console.log('搜索词类型:', typeof query);
  console.log('搜索词长度:', query.length);
  
  setSearchQuery(query);
  
  // 确保搜索时显示所有类别的结果
  if (query && query.trim() !== '') {
    console.log('有搜索词，切换到全部类别');
    setSelectedCategory('all');
  }
  
  console.log('更新后的searchQuery将是:', query);
  console.log('====== handleSearch结束 ======\n');
};

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">智能推荐系统</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700">欢迎, {user.username}</span>
                <button 
                  onClick={() => setShowPreferencesModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  设置偏好
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  退出
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setIsRegister(false);
                  setShowLoginModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                登录/注册
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6">
            {[
              { value: 'all', label: '全部' },
              { value: 'attraction', label: '景点' },
              { value: 'food', label: '美食' },
              { value: 'hotel', label: '酒店' }
            ].map(cat => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  // 切换类别时清除搜索
                  if (searchQuery) {
                    setSearchQuery('');
                  }
                }}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  selectedCategory === cat.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      {!selectedItem && (
        <div className="bg-white py-6">
          <div className="container mx-auto px-4">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="搜索景点、美食、酒店..."
            />
            
            {/* 搜索结果提示 */}
            {searchQuery && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-600">
                  {items.length > 0 
                    ? `搜索 "${searchQuery}" 找到 ${items.length} 个结果`
                    : `搜索 "${searchQuery}" 没有找到结果`}
                </p>
                <button 
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  清除搜索
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {selectedItem ? (
          <ItemDetail 
            item={selectedItem} 
            onBack={() => setSelectedItem(null)}
            onPurchase={handlePurchase}
            onReview={() => setShowReviewModal(true)}
          />
        ) : (
          <>
            {/* Recommendations Section */}
            {user && recommendations.length > 0 && !searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">为您推荐</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.slice(0, 4).map(item => (
                    <ItemCard 
                      key={item._id} 
                      item={item} 
                      onClick={() => fetchItemById(item._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Items */}
            <div>
              {!searchQuery && (
                <h2 className="text-2xl font-bold mb-4">
                  {selectedCategory === 'all' ? '全部推荐' : 
                   selectedCategory === 'attraction' ? '景点推荐' :
                   selectedCategory === 'food' ? '美食推荐' : '酒店推荐'}
                </h2>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map(item => (
                    <ItemCard 
                      key={item._id} 
                      item={item} 
                      onClick={() => fetchItemById(item._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>暂无数据</p>
                  {searchQuery && (
                    <p className="mt-2 text-sm">试试其他搜索词或清除搜索</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        isRegister={isRegister}
        setIsRegister={setIsRegister}
      />
      
      {user && (
        <>
          <PreferencesModal
            isOpen={showPreferencesModal}
            onClose={() => setShowPreferencesModal(false)}
            onSave={handleSavePreferences}
            currentPreferences={user?.preferences}
            userId={user.id}
            token={token}
          />
          
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            item={selectedItem}
            user={user}
            onSubmit={handleReviewSubmit}
            category={selectedItem?.category as 'food' | 'hotel' | 'attraction'}
          />
        </>
      )}
    </div>
  );
}

export default App;