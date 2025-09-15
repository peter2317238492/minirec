import React, { useState, useEffect } from 'react';
import './index.css';
import SearchBar from './components/SearchBar'; 
import ImageGallery from './components/ImageGallery';
import ReviewModal from './components/ReviewModal';
import Pagination from './components/Pagination';

const [isRegister, setIsRegister] = useState(false);
const [showReviewModal, setShowReviewModal] = useState(false);

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

// 分页响应接口
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
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

// 导入外部 API 服务
import { apiService } from './services/api';

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
  // 调试输出
  useEffect(() => {
    console.log(`ItemCard渲染 - ${item.name}:`, {
      purchaseCount: item.purchaseCount,
      hasPurchaseCount: 'purchaseCount' in item
    });
  }, [item]);



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
                className="mt-2 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
              >
                立即购买
              </button>
            </div>
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
  onLogin: (user: User, token: string) => void;
  isRegister: boolean;
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isOpen, onClose, onLogin, isRegister, setIsRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = isRegister 
        ? await apiService.register(formData.username, formData.email, formData.password)
        : await apiService.login(formData.username, formData.password);
      
      if (result.token) {
        onLogin(result.user, result.token);
        onClose();
      }
    } catch (error) {
      console.error('登录/注册失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">{isRegister ? '注册' : '登录'}</h2>
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
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-500 hover:underline ml-1"
          >
            {isRegister ? '立即登录' : '立即注册'}
          </button>
        </p>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const PreferencesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
  currentPreferences?: any;
}> = ({ isOpen, onClose, onSave, currentPreferences }) => {
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
            onClick={() => {
              onSave(preferences);
              onClose();
            }}
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
export default function App() {
  console.log('========== 组件加载了 ==========');
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0); 

  useEffect(() => {
    loadItems();
  }, [selectedCategory, currentPage, searchQuery]);

  useEffect(() => {
    if (user && token) {
      loadRecommendations();
    }
  }, [user, token]);

  const loadItems = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await apiService.getItems(params);
      
      // 处理分页响应
      if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
        const paginatedResponse = response as PaginatedResponse<Item>;
        setItems(paginatedResponse.data);
        setTotalItems(paginatedResponse.pagination.total);
        setTotalPages(paginatedResponse.pagination.totalPages);
      } else if (Array.isArray(response)) {
        // 如果API返回的是数组，则使用旧逻辑
        const itemsArray = response as Item[];
        setItems(itemsArray);
        setTotalItems(itemsArray.length);
        setTotalPages(Math.ceil(itemsArray.length / itemsPerPage));
      } else {
        // 其他情况，使用空数组
        setItems([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
      // 使用模拟数据
      const mockData = getMockItems();
      setItems(mockData);
      setTotalItems(mockData.length);
      setTotalPages(Math.ceil(mockData.length / itemsPerPage));
    }
  };

  const loadRecommendations = async () => {
    if (!user || !token) return;
    try {
      const response = await apiService.getRecommendations(user.id, token);
      
      // 处理推荐响应
      if (Array.isArray(response)) {
        setRecommendations(response);
      } else if (response && typeof response === 'object' && 'data' in response) {
        setRecommendations(response.data);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('加载推荐失败:', error);
      setRecommendations([]);
    }
  };

  const handleLogin = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setRecommendations([]);
  };

  const handlePurchase = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (selectedItem) {
      try {
        const purchaseData = {
          itemId: selectedItem._id,
          itemName: selectedItem.name,
          category: selectedItem.category,
          price: selectedItem.price
        };
        await apiService.recordPurchase(user.id, purchaseData, token);
        alert('购买成功！即将跳转到支付页面...');
      } catch (error) {
        console.error('记录购买失败:', error);
      }
    }
  };

  const fetchItemById = async (id: string) => {
    try {
      const response = await apiService.getItemById(id);
      setSelectedItem(response);
    } catch (e) {
      console.error('获取项目详情失败:', e);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 切换类别时重置到第一页
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // 搜索时重置到第一页
  };
  
  const handleSavePreferences = async (preferences: any) => {
    if (!user || !token) return;
    try {
      await apiService.updatePreferences(user.id, preferences, token);
      setUser({ ...user, preferences });
      loadRecommendations();
    } catch (error) {
      console.error('保存偏好失败:', error);
    }
  };
  const getMockItems = (): Item[] => [
    {
      _id: '1',
      category: 'attraction',
      name: '故宫博物院',
      description: '世界五大博物馆之一，中国明清两代的皇家宫殿',
      images: [],
      price: 60,
      rating: 4.8,
      purchaseCount: 125,
      location: { city: '北京', address: '东城区景山前街4号' },
      tags: ['历史', '文化', '建筑'],
      reviews: []
    },
    {
      _id: '2',
      category: 'food',
      name: '全聚德烤鸭',
      description: '百年老字号，正宗北京烤鸭',
      images: [],
      price: 268,
      rating: 4.5,
      location: { city: '北京', address: '前门大街30号' },
      tags: ['美食', '老字号', '烤鸭'],
      reviews: []
    },
    {
      _id: '3',
      category: 'hotel',
      name: '北京王府井希尔顿酒店',
      description: '位于市中心，交通便利，设施齐全',
      images: [],
      price: 880,
      rating: 4.6,
      location: { city: '北京', address: '王府井东街8号' },
      tags: ['豪华', '商务', '市中心'],
      reviews: []
    }
  ];

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
                onClick={() => handleCategoryChange(cat.value)}
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
            onSearch={handleSearch}
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
                      onClick={() => fetchItemById(item._id)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map(item => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    onClick={() => fetchItemById(item._id)}
                  />
                ))}
              </div>
              
              {/* 分页组件 */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
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
      
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handleSavePreferences}
        currentPreferences={user?.preferences}
      />
    </div>
  );
}