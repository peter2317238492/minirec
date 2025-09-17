import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';
import axios from 'axios';

interface Review {
  _id: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  rating: number;
  taste?: number;
  service?: number;
  environment?: number;
  comfort?: number;
  location?: number;
  scenery?: number;
  transportation?: number;
  comment: string;
  date: string;
  merchantResponse?: string;
  merchantResponseDate?: string;
}

interface CategorySummary {
  averageRating: number;
  averageTaste: number;
  averageService: number;
  averageEnvironment: number;
  averageComfort: number;
  averageLocation: number;
  averageScenery: number;
  averageTransportation: number;
  totalReviews: number;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  attraction: CategorySummary;
  food: CategorySummary;
  hotel: CategorySummary;
}

interface MerchantReviewsProps {
  token: string;
}

const MerchantReviews: React.FC<MerchantReviewsProps> = ({ token }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    attraction: {
      averageRating: 0,
      averageTaste: 0,
      averageService: 0,
      averageEnvironment: 0,
      averageComfort: 0,
      averageLocation: 0,
      averageScenery: 0,
      averageTransportation: 0,
      totalReviews: 0
    },
    food: {
      averageRating: 0,
      averageTaste: 0,
      averageService: 0,
      averageEnvironment: 0,
      averageComfort: 0,
      averageLocation: 0,
      averageScenery: 0,
      averageTransportation: 0,
      totalReviews: 0
    },
    hotel: {
      averageRating: 0,
      averageTaste: 0,
      averageService: 0,
      averageEnvironment: 0,
      averageComfort: 0,
      averageLocation: 0,
      averageScenery: 0,
      averageTransportation: 0,
      totalReviews: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [respondingToReview, setRespondingToReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    itemId: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // 获取商家商品列表
  const [items, setItems] = useState<Array<{ _id: string; name: string }>>([]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get('/api/items/merchant', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(response.data.items || []);
    } catch (error) {
      console.error('获取商品列表失败:', error);
    }
  }, [token]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      if (filters.itemId) params.append('itemId', filters.itemId);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(`/api/merchants/reviews?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setReviews(response.data.reviews || []);
      setSummary(response.data.summary || summary);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, filters, summary]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRespondToReview = async () => {
    if (!respondingToReview || !responseText.trim()) return;

    try {
      await axios.post('/api/merchants/reviews/respond', {
        reviewId: respondingToReview,
        response: responseText.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 刷新评论列表
      await fetchReviews();
      
      // 重置状态
      setRespondingToReview(null);
      setResponseText('');
      
      alert('回复成功');
    } catch (error: any) {
      alert(error.response?.data?.message || '回复失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">评分反馈管理</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 评分统计卡片 */}
        <div className="mb-8">
          {/* 总体评分 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">总体评分</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-3xl font-bold ${getRatingColor(summary.averageRating)}`}>
                {summary.averageRating}
              </span>
              <StarRating rating={summary.averageRating} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-1">共 {summary.totalReviews} 条评论</p>
          </div>

          {/* 按类别分组的评分 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 景点评分 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">景点评分</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总体评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-semibold ${getRatingColor(summary.attraction.averageRating)}`}>
                      {summary.attraction.averageRating}
                    </span>
                    <StarRating rating={summary.attraction.averageRating} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">景色评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.attraction.averageScenery)}`}>
                      {summary.attraction.averageScenery}
                    </span>
                    <StarRating rating={summary.attraction.averageScenery} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">交通评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.attraction.averageTransportation)}`}>
                      {summary.attraction.averageTransportation}
                    </span>
                    <StarRating rating={summary.attraction.averageTransportation} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">服务评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.attraction.averageService)}`}>
                      {summary.attraction.averageService}
                    </span>
                    <StarRating rating={summary.attraction.averageService} size="sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{summary.attraction.totalReviews} 条景点评论</p>
              </div>
            </div>

            {/* 美食评分 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">美食评分</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总体评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-semibold ${getRatingColor(summary.food.averageRating)}`}>
                      {summary.food.averageRating}
                    </span>
                    <StarRating rating={summary.food.averageRating} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">口味评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.food.averageTaste)}`}>
                      {summary.food.averageTaste}
                    </span>
                    <StarRating rating={summary.food.averageTaste} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">服务评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.food.averageService)}`}>
                      {summary.food.averageService}
                    </span>
                    <StarRating rating={summary.food.averageService} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">环境评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.food.averageEnvironment)}`}>
                      {summary.food.averageEnvironment}
                    </span>
                    <StarRating rating={summary.food.averageEnvironment} size="sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{summary.food.totalReviews} 条美食评论</p>
              </div>
            </div>

            {/* 酒店评分 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">酒店评分</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总体评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-semibold ${getRatingColor(summary.hotel.averageRating)}`}>
                      {summary.hotel.averageRating}
                    </span>
                    <StarRating rating={summary.hotel.averageRating} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">舒适评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.hotel.averageComfort)}`}>
                      {summary.hotel.averageComfort}
                    </span>
                    <StarRating rating={summary.hotel.averageComfort} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">服务评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.hotel.averageService)}`}>
                      {summary.hotel.averageService}
                    </span>
                    <StarRating rating={summary.hotel.averageService} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">位置评分</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getRatingColor(summary.hotel.averageLocation)}`}>
                      {summary.hotel.averageLocation}
                    </span>
                    <StarRating rating={summary.hotel.averageLocation} size="sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{summary.hotel.totalReviews} 条酒店评论</p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和排序 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品筛选</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.itemId}
                onChange={(e) => setFilters({...filters, itemId: e.target.value})}
              >
                <option value="">所有商品</option>
                {items.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="date">评论时间</option>
                <option value="rating">评分</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序顺序</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.sortOrder}
                onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">用户评论</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{review.userName}</h4>
                        <p className="text-sm text-gray-500">评论于 {formatDate(review.date)}</p>
                        <p className="text-sm text-gray-600">商品: {review.itemName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-semibold ${getRatingColor(review.rating)}`}>
                          {review.rating}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {/* 详细评分 */}
                    {(review.taste || review.service || review.environment || review.comfort || 
                      review.location || review.scenery || review.transportation) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {review.taste && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">口味:</span>
                            <StarRating rating={review.taste} size="sm" />
                            <span className="text-sm">{review.taste}</span>
                          </div>
                        )}
                        {review.service && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">服务:</span>
                            <StarRating rating={review.service} size="sm" />
                            <span className="text-sm">{review.service}</span>
                          </div>
                        )}
                        {review.environment && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">环境:</span>
                            <StarRating rating={review.environment} size="sm" />
                            <span className="text-sm">{review.environment}</span>
                          </div>
                        )}
                        {review.comfort && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">舒适:</span>
                            <StarRating rating={review.comfort} size="sm" />
                            <span className="text-sm">{review.comfort}</span>
                          </div>
                        )}
                        {review.location && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">位置:</span>
                            <StarRating rating={review.location} size="sm" />
                            <span className="text-sm">{review.location}</span>
                          </div>
                        )}
                        {review.scenery && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">景色:</span>
                            <StarRating rating={review.scenery} size="sm" />
                            <span className="text-sm">{review.scenery}</span>
                          </div>
                        )}
                        {review.transportation && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">交通:</span>
                            <StarRating rating={review.transportation} size="sm" />
                            <span className="text-sm">{review.transportation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 商家回复 */}
                    {review.merchantResponse && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-blue-900">商家回复</span>
                          <span className="text-sm text-blue-600">
                            {review.merchantResponseDate && formatDate(review.merchantResponseDate)}
                          </span>
                        </div>
                        <p className="text-blue-800">{review.merchantResponse}</p>
                      </div>
                    )}

                    {/* 回复按钮 */}
                    {!review.merchantResponse && (
                      <button
                        onClick={() => setRespondingToReview(review._id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        回复评论
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无评论</p>
              </div>
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 回复评论模态框 */}
      {respondingToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">回复评论</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="请输入您的回复..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setRespondingToReview(null);
                  setResponseText('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRespondToReview}
                disabled={!responseText.trim()}
                className={`px-4 py-2 rounded transition-colors ${
                  !responseText.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                发送回复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantReviews;