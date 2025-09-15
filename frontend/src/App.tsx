// frontend/src/App.tsx - 简化后的主文件
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './index.css';

// 导入类型和服务
import { Item, User, Merchant, MerchantLoginInfo } from './types';
import { apiService } from './services/api';
import { getUserLocation } from './utils/location';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';

// 导入组件
const SearchBar = lazy(() => import('./components/SearchBar'));
const ReviewModal = lazy(() => import('./components/ReviewModal'));
const ItemCard = lazy(() => import('./components/ItemCard'));
const ItemDetail = lazy(() => import('./components/ItemDetail'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const PreferencesModal = lazy(() => import('./components/PreferencesModal'));
const MerchantLoginModal = lazy(() => import('./components/MerchantLoginModal'));
const MerchantDashboard = lazy(() => import('./components/MerchantDashboard'));
const PriceFilter = lazy(() => import('./components/PriceFilter'));

// 加载状态组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// 配置axios
axios.defaults.baseURL = 'http://localhost:5000'; // 替换为你的后端地址

function App() {
  // 状态管理
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [token, setToken] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMerchantLoginModal, setShowMerchantLoginModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegister, setIsRegister] = useState(false);
  const [isMerchantRegister, setIsMerchantRegister] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage] = useState(8);
  const [loginInfo, setLoginInfo] = useState<MerchantLoginInfo | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // 初始化
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedMerchant = localStorage.getItem('merchant');
    const savedToken = localStorage.getItem('token');
    const savedLoginInfo = localStorage.getItem('loginInfo');
    
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      if (parsedUser.preferences?.priceRange) {
        setPriceRange(parsedUser.preferences.priceRange);
      }
    } else if (savedMerchant && savedToken) {
      setMerchant(JSON.parse(savedMerchant));
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      if (savedLoginInfo) {
        setLoginInfo(JSON.parse(savedLoginInfo));
      }
    }
    
    loadItems();
    
    // 获取用户位置
    getUserLocation().catch((error) => {
      console.log('获取用户位置失败:', error);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听类别、搜索和价格变化
  useEffect(() => {
    setCurrentPage(1);
    setItems([]);
    setHasMore(true);
    loadItems(true);
  }, [selectedCategory, searchQuery, priceRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听用户登录状态
  useEffect(() => {
    if (user && token) {
      loadRecommendations();
    }
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

// 无限滚动处理函数
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !selectedItem) {
      setCurrentPage(prev => prev + 1);
      setTimeout(() => loadItems(), 100);
    }
  }, [loading, hasMore, selectedItem]); // eslint-disable-line react-hooks/exhaustive-deps

  // 使用useMemo优化计算
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    });
  }, [items, selectedCategory]);

  const displayRecommendations = useMemo(() => {
    return recommendations.slice(0, 4);
  }, [recommendations]);

  // 使用无限滚动hook
  useInfiniteScroll(handleLoadMore, { threshold: 200 });

  const loadItems = async (reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoading(true);
    }
  
  console.log('====== 前端loadItems开始 ======');
  console.log('当前状态 - selectedCategory:', selectedCategory);
  console.log('当前状态 - searchQuery:', searchQuery, 'type:', typeof searchQuery);
  console.log('当前状态 - currentPage:', currentPage);
  console.log('当前状态 - priceRange:', priceRange);
  
  try {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage
    };
    
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
    
    // 处理价格筛选
    if (priceRange && priceRange[0] >= 0 && priceRange[1] > 0) {
      params.minPrice = priceRange[0];
      params.maxPrice = priceRange[1];
      console.log('添加价格参数:', params.minPrice, '-', params.maxPrice);
    }
    
    console.log('最终请求参数:', params);
    console.log('请求URL将是:', '/api/items', params);
    
    const response = await axios.get('/api/items', { params });
    console.log('响应数据长度:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('第一个结果:', response.data[0].name);
    }
    
    // 检查是否还有更多数据
    if (response.data.length < itemsPerPage) {
      setHasMore(false);
    }
    
    if (reset) {
      setItems(response.data);
    } else {
      setItems(prev => [...prev, ...response.data]);
    }
    
    console.log('====== 前端loadItems结束 ======\n');
  } catch (error) {
    console.error('加载项目失败:', error);
    setHasMore(false);
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
    setMerchant(null);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.removeItem('merchant');
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  // 处理商家登录
  const handleMerchantLogin = (loggedInMerchant: Merchant, authToken: string, loginInfo?: MerchantLoginInfo) => {
    setMerchant(loggedInMerchant);
    setUser(null);
    setToken(authToken);
    localStorage.setItem('merchant', JSON.stringify(loggedInMerchant));
    localStorage.removeItem('user');
    localStorage.setItem('token', authToken);
    if (loginInfo) {
      localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
      setLoginInfo(loginInfo);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setShowMerchantLoginModal(false);
  };

  // 处理登出
  const handleLogout = () => {
    setUser(null);
    setMerchant(null);
    setToken('');
    setLoginInfo(null);
    setPriceRange([0, 10000]);
    localStorage.removeItem('user');
    localStorage.removeItem('merchant');
    localStorage.removeItem('token');
    localStorage.removeItem('loginInfo');
    delete axios.defaults.headers.common['Authorization'];
    setRecommendations([]);
  };

  // 处理商家登出
  const handleMerchantLogout = () => {
    setMerchant(null);
    setToken('');
    setLoginInfo(null);
    localStorage.removeItem('merchant');
    localStorage.removeItem('token');
    localStorage.removeItem('loginInfo');
    delete axios.defaults.headers.common['Authorization'];
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
      if (preferences.priceRange) {
        setPriceRange(preferences.priceRange);
      }
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
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          >
            智能推荐系统
          </motion.h1>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
          >
            <AnimatePresence mode="wait">
              {merchant ? (
                <motion.div 
                  key="merchant-logged-in"
                  className="flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {merchant.username[0].toUpperCase()}
                    </motion.div>
                    <span className="text-gray-700 font-medium">商家, {merchant.username}</span>
                  </motion.div>
                  <motion.button 
                    onClick={handleMerchantLogout}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "#f9fafb"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    退出
                  </motion.button>
                </motion.div>
              ) : user ? (
                <motion.div 
                  key="user-logged-in"
                  className="flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {user.username[0].toUpperCase()}
                    </motion.div>
                    <span className="text-gray-700 font-medium">欢迎, {user.username}</span>
                  </motion.div>
                  <motion.button 
                    onClick={() => setShowPreferencesModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    设置偏好
                  </motion.button>
                  <motion.button 
                    onClick={handleLogout}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "#f9fafb"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    退出
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-buttons"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.button
                    onClick={() => {
                      setIsRegister(false);
                      setShowLoginModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    用户登录
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsMerchantRegister(false);
                      setShowMerchantLoginModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-md"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    商家登录
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.header>

      {/* Category Tabs */}
      <motion.div 
        className="bg-white border-b"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 py-2">
            {[
              { value: 'all', label: '全部推荐' },
              { value: 'attraction', label: '景点推荐' },
              { value: 'food', label: '美食推荐' },
              { value: 'hotel', label: '酒店推荐' }
            ].map((cat, index) => (
              <motion.button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  // 切换类别时清除搜索
                  if (searchQuery) {
                    setSearchQuery('');
                  }
                }}
                className={`px-5 py-2 rounded-lg mx-1 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ 
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.1 * index, 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Search Bar */}
      {!selectedItem && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-8">
          <div className="container mx-auto px-4">
            <Suspense fallback={<LoadingFallback />}>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="搜索景点、美食、酒店..."
              />
            </Suspense>
            
            {/* 搜索结果提示 */}
            {searchQuery && (
              <div className="mt-6 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <p className="text-gray-700 font-medium">
                  {items.length > 0 
                    ? `搜索 "${searchQuery}" 找到 ${items.length} 个结果`
                    : `搜索 "${searchQuery}" 没有找到结果`}
                </p>
                <button 
                  onClick={clearSearch}
                  className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm bg-blue-50 rounded-lg transition-colors"
                >
                  清除搜索
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <motion.main 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {merchant ? (
            <Suspense fallback={<LoadingFallback />}>
              <MerchantDashboard 
                merchant={merchant} 
                token={token} 
                loginInfo={loginInfo || undefined}
                onLogout={handleMerchantLogout}
              />
            </Suspense>
          ) : selectedItem ? (
            <motion.div
              key="item-detail"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <ItemDetail 
                  item={selectedItem} 
                  onBack={() => setSelectedItem(null)}
                  onPurchase={handlePurchase}
                  onReview={() => setShowReviewModal(true)}
                />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="item-list"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <>
            {/* Recommendations Section */}
            <AnimatePresence>
              {user && recommendations.length > 0 && !searchQuery && (
                <motion.div 
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div 
                    className="flex items-center mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <motion.h2 
                      className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      为您推荐
                    </motion.h2>
                    <motion.div 
                      className="ml-3 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 48 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    ></motion.div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayRecommendations.map((item, index) => (
                      <motion.div 
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                        whileHover={{ y: -10 }}
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <ItemCard 
                            item={item} 
                            onClick={() => fetchItemById(item._id)}
                          />
                        </Suspense>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* All Items */}
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* 价格筛选器 */}
              <Suspense fallback={<LoadingFallback />}>
                <PriceFilter 
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                />
              </Suspense>
              
              {!searchQuery && (
                <motion.div 
                  className="flex items-center mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.h2 
                    className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {selectedCategory === 'all' ? '全部推荐' : 
                     selectedCategory === 'attraction' ? '景点推荐' :
                     selectedCategory === 'food' ? '美食推荐' : '酒店推荐'}
                  </motion.h2>
                  <motion.div 
                    className="ml-3 w-12 h-1 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 48 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  ></motion.div>
                </motion.div>
              )}
              
              {loading ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                  <motion.p 
                    className="mt-4 text-gray-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    加载中...
                  </motion.p>
                </motion.div>
              ) : items.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {filteredItems.map((item, index) => (
                        <motion.div 
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: 0.05 * index, duration: 0.3 }}
                          layout
                        >
                          <Suspense fallback={<LoadingFallback />}>
                            <ItemCard 
                              item={item} 
                              onClick={() => fetchItemById(item._id)}
                            />
                          </Suspense>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* 加载更多按钮 */}
                  {hasMore && (
                    <motion.div 
                      className="text-center mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <button
                        onClick={() => {
                          setCurrentPage(prev => prev + 1);
                          setTimeout(() => loadItems(), 100);
                        }}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            加载中...
                          </span>
                        ) : (
                          '加载更多'
                        )}
                      </button>
                    </motion.div>
                  )}
                  
                  {!hasMore && items.length > 0 && (
                    <motion.div 
                      className="text-center mt-8 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p>已加载全部内容</p>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div 
                  className="text-center py-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.svg 
                    className="mx-auto h-16 w-16 text-gray-400 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                  <motion.p 
                    className="text-gray-600 font-medium text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    暂无数据
                  </motion.p>
                  {searchQuery && (
                    <motion.p 
                      className="mt-2 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      试试其他搜索词或清除搜索
                    </motion.p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Modals */}
      <Suspense fallback={<LoadingFallback />}>
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          isRegister={isRegister}
          setIsRegister={setIsRegister}
        />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <MerchantLoginModal 
          isOpen={showMerchantLoginModal}
          onClose={() => setShowMerchantLoginModal(false)}
          onLogin={handleMerchantLogin}
          isRegister={isMerchantRegister}
          setIsRegister={setIsMerchantRegister}
        />
      </Suspense>
      
      {user && (
        <>
          <Suspense fallback={<LoadingFallback />}>
            <PreferencesModal
              isOpen={showPreferencesModal}
              onClose={() => setShowPreferencesModal(false)}
              onSave={handleSavePreferences}
              currentPreferences={user?.preferences}
              userId={user.id}
              token={token}
            />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <ReviewModal
              isOpen={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              item={selectedItem}
              user={user}
              onSubmit={handleReviewSubmit}
              category={selectedItem?.category as 'food' | 'hotel' | 'attraction'}
            />
          </Suspense>
        </>
      )}
    </motion.div>
  );
}

export default App;