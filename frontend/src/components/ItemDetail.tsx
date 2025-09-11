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
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回列表
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 图片画廊 */}
        <ImageGallery images={item.images} title={item.name} />
        
        <div className="p-6">
          {/* 标题和价格区域 */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{item.name}</h1>
              <div className="flex items-center gap-4">
                <StarRating rating={item.rating} size="lg" />
                <span className="text-sm text-orange-500 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {item.purchaseCount || 0}人已购买
                </span>
              </div>
            </div>
            
            <div className="text-right ml-6">
              <p className="text-3xl font-bold text-red-500 mb-3">¥{item.price}</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={onPurchase}
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  立即购买
                </button>
                <button
                  onClick={onReview}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  评分/评论
                </button>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <hr className="my-6" />

          {/* 简介 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              简介
            </h2>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>
          
          {/* 位置信息 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              位置信息
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">城市：</span>{item.location.city}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">地址：</span>{item.location.address}
              </p>
            </div>
          </div>
          
          {/* 标签 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              标签
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 用户评价 */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              用户评价 ({item.reviews.length})
            </h2>
            
            {item.reviews.length > 0 ? (
              <div className="space-y-4">
                {item.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* 用户头像占位 */}
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.userName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
                
                {/* 加载更多评论按钮（如果评论很多） */}
                {item.reviews.length > 5 && (
                  <div className="text-center mt-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      查看更多评论
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">暂无评价</p>
                <button 
                  onClick={onReview}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                >
                  成为第一个评价的人
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