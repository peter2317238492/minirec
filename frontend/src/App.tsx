import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import SearchBar from './components/SearchBar';
import ReviewModal from './components/ReviewModal';
import ImageGallery from './components/ImageGallery';
// 配置axios默认设置
axios.defaults.baseURL = 'http://localhost:5000';

// Types
interface Item {
  _id: string;
  category: 'attraction' | 'food' | 'hotel';
  name: string;
  description: string;
  images: string[];
  price: number;
  rating: number;
  purchaseCount?: number;
  location: {
    city: string;
    address: string;
  };
  tags: string[];
  reviews: Review[];
}

interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  preferences?: {
    categories: string[];
    tags: string[];
  };
}

// Components
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

const ItemCard: React.FC<{ item: Item; onClick: () => void }> = ({ item, onClick }) => {
  const categoryColors = {
    attraction: 'bg-blue-100 text-blue-800',
    food: 'bg-green-100 text-green-800',
    hotel: 'bg-purple-100 text-purple-800'
  };

  const categoryLabels = {
    attraction: '景点',
    food: '美食',
    hotel: '酒店'
  };

    // 格式化购买人数显示
  const formatPurchaseCount = (count: number = 0) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万+`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return count.toString();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-200 relative">
        <img
        src={item.images?.[0] || 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400&q=80'}
        alt={item.name}
        className="w-full h-full object-cover"
        onError={(e)=>{
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400&q=80';
        }}
        loading="lazy"
        />
        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${categoryColors[item.category]}`}>
          {categoryLabels[item.category]}
        </span>
        
        {item.purchaseCount && item.purchaseCount >100 && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold">
            🔥 热门
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mb-2">
          <StarRating rating={item.rating} />
          <span className="text-lg font-bold text-red-500">¥{item.price}</span>
        </div>


        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location.city}
          </div>

          <div className="flex items-center text-orange-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-medium">{formatPurchaseCount(item.purchaseCount)}人购买</span>
          </div>
        </div>
        


        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ItemDetail: React.FC<{ item: Item; onBack: () => void; onPurchase: () => void; onReview: () => void }> = ({ item, onBack, onPurchase, onReview }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回列表
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ImageGallery images={item.images} title={item.name} />
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
              <div className="flex items-center gap-4">
               <StarRating rating={item.rating} />
               <span className="text-sm text-orange-500">
                  <svg className="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {item.purchaseCount || 0}人已购买
               </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-red-500">¥{item.price}</p>
              <button 
                onClick={onPurchase}
                className="w-32 mt-2 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
              >
                立即购买
              </button>
            </div>
          </div>

          {/* 新增评分评论按钮 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onReview}
              className="w-32 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
            >
              评分/评论
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">简介</h2>
            <p className="text-gray-700">{item.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">位置信息</h2>
            <p className="text-gray-700">
              <span className="font-medium">城市：</span>{item.location.city}<br />
              <span className="font-medium">地址：</span>{item.location.address}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">标签</h2>
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">用户评价 ({item.reviews.length})</h2>
            {item.reviews.length > 0 ? (
              <div className="space-y-4">
                {item.reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">{review.userName}</span>
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-gray-500 ml-auto">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无评价</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (user: User, token: string) => void 
  isRegister: boolean;
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isOpen, onClose, onLogin, isRegister, setIsRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
      const response = await axios.post(endpoint, formData);
      
      if (response.data.token) {
        onLogin(response.data.user, response.data.token);
        onClose();
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-4">{isRegister ? '注册' : '登录'}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="用户名"
            className="w-full p-2 border rounded mb-3"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          {isRegister && (
            <input
              type="email"
              placeholder="邮箱"
              className="w-full p-2 border rounded mb-3"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          )}
          <input
            type="password"
            placeholder="密码"
            className="w-full p-2 border rounded mb-3"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isRegister ? '注册' : '登录'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-blue-500 hover:underline ml-1"
          >
            {isRegister ? '立即登录' : '立即注册'}
          </button>
        </p>
      </div>
    </div>
  );
};

const PreferencesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
  currentPreferences?: any;
  userId: string;
  token: string;
}> = ({ isOpen, onClose, onSave, currentPreferences, userId, token }) => {
  const [preferences, setPreferences] = useState({
    categories: currentPreferences?.categories || [],
    tags: currentPreferences?.tags || []
  });

  if (!isOpen) return null;

  const allCategories = [
    { value: 'attraction', label: '景点' },
    { value: 'food', label: '美食' },
    { value: 'hotel', label: '酒店' }
  ];

  const allTags = ['历史', '文化', '自然', '购物', '娱乐', '亲子', '情侣', '商务', '经济', '豪华'];

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleTag = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/users/${userId}/preferences`, preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSave(preferences);
      onClose();
    } catch (error) {
      console.error('保存偏好失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">设置偏好</h2>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">选择感兴趣的类别</h3>
          <div className="space-y-2">
            {allCategories.map(cat => (
              <label key={cat.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.categories.includes(cat.value)}
                  onChange={() => toggleCategory(cat.value)}
                  className="mr-2"
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">选择感兴趣的标签</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  preferences.tags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
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

    useEffect(() => {
    // 检查本地存储的登录信息
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedCategory,searchQuery]);

  useEffect(() => {
    if (user && token) {
      loadRecommendations();
    }
  }, [user, token]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
    
      const response = await axios.get('/api/items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('加载项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user || !token) return;
    try {
      const response = await axios.get(`/api/recommendations/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('加载推荐失败:', error);
    }
  };

  const handleLogin = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setRecommendations([]);
  };

  const handlePurchase = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (selectedItem) {
      try {
        await axios.post(`/api/users/${user.id}/purchase`, {
          itemId: selectedItem._id,
          itemName: selectedItem.name,
          category: selectedItem.category,
          price: selectedItem.price
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('购买成功！即将跳转到支付页面...');
      } catch (error) {
        console.error('记录购买失败:', error);
      }
    }
  };

  const handleSavePreferences = (preferences: any) => {
    if (user) {
      setUser({ ...user, preferences });
      loadRecommendations();
    }
  };

    // 提交评分评论
  const handleReviewSubmit = async (payload: {
    rating: number;
    taste: number;
    packaging: number;
    comment: string;
  }) => {
    if (!selectedItem || !user) return;
    try {
      await axios.post(`/api/items/${selectedItem._id}/reviews`, {
        itemId: selectedItem._id, 
        userId: user.id,
        userName: user.username,
        ...payload,
        date: new Date().toISOString()
      });
      setShowReviewModal(false);
      // 可选：刷新详情页或评论列表
    } catch (err) {
      console.error('提交评论失败', err);
      // 可选：弹窗提示
    }
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
                  setIsRegister(false); // 每次打开都重置为登录
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
                onClick={() => setSelectedCategory(cat.value)}
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
      
      {!selectedItem && (
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <SearchBar 
            onSearch={(query:string) => setSearchQuery(query)}
            placeholder="搜索景点、美食、酒店..."
          />
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
            {user && recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">为您推荐</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.slice(0, 4).map(item => (
                    <ItemCard 
                      key={item._id} 
                      item={item} 
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Items */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {selectedCategory === 'all' ? '全部推荐' : 
                 selectedCategory === 'attraction' ? '景点推荐' :
                 selectedCategory === 'food' ? '美食推荐' : '酒店推荐'}
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map(item => (
                    <ItemCard 
                      key={item._id} 
                      item={item} 
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
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
        <PreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          onSave={handleSavePreferences}
          currentPreferences={user.preferences}
          userId={user.id}
          token={token}
        />
      )}

      {/* 评分评论弹窗，直接加在这里 */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        item={selectedItem}
        user={user}
        onSubmit={handleReviewSubmit}
        category={selectedItem?.category as 'food' | 'hotel' | 'attraction'}
      />
    </div>
  );
}

export default App;