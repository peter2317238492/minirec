// frontend/src/components/ItemDetail.tsx
import React from 'react';
import { Item } from '../types';
import ImageGallery from './ImageGallery';
import StarRating from './StarRating';

interface ItemDetailProps {
  item: Item;
  onBack: () => void;
  onPurchase: () => void;
  onReview: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, onBack, onPurchase, onReview }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
      >
        <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回列表
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 图片画廊 */}
        <ImageGallery images={item.images} title={item.name} />
        
        <div className="p-8">
          {/* 标题和价格区域 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100">
            <div className="flex-1 mb-6 md:mb-0">
              <h1 className="text-3xl font-bold mb-3 text-gray-900">{item.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={item.rating} size="lg" />
                <span className="text-sm text-orange-500 flex items-center bg-orange-50 px-3 py-1 rounded-full">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="font-medium">{item.purchaseCount || 0}人已购买</span>
                </span>
              </div>
            </div>
            
            <div className="text-right md:ml-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">¥{item.price}</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onPurchase}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  立即购买
                </button>
                <button
                  onClick={onReview}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                >
                  评分/评论
                </button>
              </div>
            </div>
          </div>

          {/* 简介 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              简介
            </h2>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-xl">{item.description}</p>
          </div>
          
          {/* 位置信息 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              位置信息
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl">
              <p className="text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="font-medium">城市：</span>
                <span className="ml-2 bg-white px-3 py-1 rounded-lg shadow-sm">{item.location.city}</span>
              </p>
              <p className="text-gray-800 flex items-start">
                <svg className="w-5 h-5 mr-2 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">地址：</span>
                <span className="ml-2 bg-white px-3 py-1 rounded-lg shadow-sm flex-1">{item.location.address}</span>
              </p>
            </div>
          </div>
          
          {/* 标签 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              标签
            </h2>
            <div className="flex flex-wrap gap-3">
              {item.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium hover:from-blue-200 hover:to-indigo-200 transition-all shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 用户评价 */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              用户评价 ({item.reviews.length})
            </h2>
            
            {item.reviews.length > 0 ? (
              <div className="space-y-5">
                {item.reviews.map((review, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-4">
                        {/* 用户头像占位 */}
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {review.userName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.userName}</p>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                        {new Date(review.date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed pl-1">{review.comment}</p>
                  </div>
                ))}
                
                {/* 加载更多评论按钮（如果评论很多） */}
                {item.reviews.length > 5 && (
                  <div className="text-center mt-6">
                    <button className="px-5 py-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full transition-colors font-medium">
                      查看更多评论
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600 font-medium text-lg mb-2">暂无评价</p>
                <p className="text-gray-500 mb-5">成为第一个分享体验的人吧！</p>
                <button 
                  onClick={onReview}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
                >
                  立即评价
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;