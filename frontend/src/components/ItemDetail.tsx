// frontend/src/components/ItemDetail.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item } from '../types';
import ImageGallery from './ImageGallery';
import StarRating from './StarRating';
import { getTransportInfo, generateBaiduMapLink, calculateDistance, formatDistance } from '../utils/location';

interface ItemDetailProps {
  item: Item;
  onBack: () => void;
  onPurchase: () => void;
  onReview: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, onBack, onPurchase, onReview }) => {
  const [transportInfo, setTransportInfo] = useState<{ mode: string; duration: string; distance: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [mapLink, setMapLink] = useState<string>('');

  useEffect(() => {
    const loadTransportInfo = async () => {
      try {
        // 获取交通信息
        const info = await getTransportInfo(item);
        setTransportInfo(info);
        
        // 获取直线距离
        const dist = await calculateDistance(item);
        setDistance(dist);
        
        // 生成地图链接
        const link = generateBaiduMapLink(item);
        setMapLink(link);
      } catch (error) {
        console.log('获取交通信息失败:', error);
      }
    };

    loadTransportInfo();
  }, [item]);

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 返回按钮 */}
      <motion.button 
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          whileHover={{ x: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </motion.svg>
        返回列表
      </motion.button>

      <motion.div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
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
                <motion.button 
                  onClick={onPurchase}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl shadow-lg"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  立即购买
                </motion.button>
                <motion.button
                  onClick={onReview}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-md"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  评分/评论
                </motion.button>
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
          
          {/* 位置信息和交通 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              位置信息与交通
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl space-y-4">
              <p className="text-gray-800 flex items-center">
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
              
              {/* 距离信息 */}
              {distance !== null && (
                <p className="text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="font-medium">直线距离：</span>
                  <span className="ml-2 bg-white px-3 py-1 rounded-lg shadow-sm">{formatDistance(distance)}</span>
                </p>
              )}
              
              {/* 交通信息 */}
              {transportInfo && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      推荐交通方式
                    </h3>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {transportInfo.mode}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      预计时间：<span className="font-medium ml-1">{transportInfo.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      路程距离：<span className="font-medium ml-1">{transportInfo.distance}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 导航链接 */}
              {mapLink && (
                <motion.a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  百度地图导航
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              )}
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
              {item.tags.map((tag, index) => (
                <motion.span 
                  key={tag} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, type: "spring", stiffness: 400, damping: 10 }}
                  whileHover={{ 
                    scale: 1.1,
                    background: "linear-gradient(to right, #bfdbfe, #c7d2fe)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* 详细信息 */}
          {item.details && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                详细信息
              </h2>
              
              <div className="space-y-6">
                {/* 开放时间 */}
                {(item.details.openingHours || item.details.openingMonths) && (
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      开放时间
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {item.details.openingHours || item.details.openingMonths}
                    </p>
                  </motion.div>
                )}

                {/* 门票信息 */}
                {item.details.ticketInfo && (
                  <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      门票信息
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{item.details.ticketInfo}</p>
                  </motion.div>
                )}

                {/* 交通选项 */}
                {item.details.transportationOptions && (
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      交通选项
                    </h3>
                    <ul className="space-y-2">
                      {item.details.transportationOptions?.map((option: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {option}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* 亮点特色 */}
                {item.details.highlights && (
                  <motion.div 
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      亮点特色
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.details.highlights?.map((highlight: string, index: number) => (
                        <motion.div 
                          key={index}
                          className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(255, 255, 255, 0.9)"
                          }}
                        >
                          <span className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {highlight}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 特色描述 */}
                {item.details.features && (
                  <motion.div 
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      特色描述
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{item.details.features}</p>
                  </motion.div>
                )}

                {/* 酒店相关 - 入住/退房时间 */}
                {(item.details.checkIn || item.details.checkOut) && (
                  <motion.div 
                    className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7l-4 9h16l-4-9" />
                      </svg>
                      入住/退房时间
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.details.checkIn && (
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">入住时间</p>
                          <p className="text-gray-800 font-medium">{item.details.checkIn}</p>
                        </div>
                      )}
                      {item.details.checkOut && (
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">退房时间</p>
                          <p className="text-gray-800 font-medium">{item.details.checkOut}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 酒店设施 */}
                {item.details.facilities && (
                  <motion.div 
                    className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      酒店设施
                    </h3>
                    <ul className="space-y-2">
                      {item.details.facilities?.map((facility: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {facility}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* 餐厅相关 - 营业时间 */}
                {item.details.openingHours && (
                  <motion.div 
                    className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      营业时间
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{item.details.openingHours}</p>
                  </motion.div>
                )}

                {/* 餐厅相关 - 电话 */}
                {item.details.phone && (
                  <motion.div 
                    className="bg-gradient-to-br from-lime-50 to-green-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      联系电话
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{item.details.phone}</p>
                  </motion.div>
                )}

                {/* 餐厅相关 - 特色菜 */}
                {item.details.specialties && (
                  <motion.div 
                    className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      特色推荐
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.details.specialties?.map((specialty: string, index: number) => (
                        <motion.div 
                          key={index}
                          className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(255, 255, 255, 0.9)"
                          }}
                        >
                          <span className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {specialty}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 餐厅相关 - 人均消费 */}
                {item.details.averagePrice && (
                  <motion.div 
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      人均消费
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{item.details.averagePrice}</p>
                  </motion.div>
                )}

                {/* 酒店服务 */}
                {item.details.services && (
                  <motion.div 
                    className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      酒店服务
                    </h3>
                    <ul className="space-y-2">
                      {item.details.services?.map((service: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* 酒店房型 */}
                {item.details.roomTypes && (
                  <motion.div 
                    className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      房型选择
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.details.roomTypes?.map((roomType: string, index: number) => (
                        <motion.div 
                          key={index}
                          className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.3 + index * 0.1 }}
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(255, 255, 255, 0.9)"
                          }}
                        >
                          <span className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {roomType}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
          
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
                <AnimatePresence>
                  {item.reviews.map((review, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ 
                        y: -5,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <div className="flex items-center gap-4">
                          {/* 用户头像占位 */}
                          <motion.div 
                            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {review.userName[0].toUpperCase()}
                          </motion.div>
                          <div>
                            <p className="font-bold text-gray-900">{review.userName}</p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                        </div>
                        <motion.span 
                          className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          {new Date(review.date).toLocaleDateString('zh-CN')}
                        </motion.span>
                      </div>
                      <motion.p 
                        className="text-gray-700 leading-relaxed pl-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {review.comment}
                      </motion.p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* 加载更多评论按钮（如果评论很多） */}
                {item.reviews.length > 5 && (
                  <div className="text-center mt-6">
                    <motion.button 
                      className="px-5 py-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full font-medium"
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "#dbeafe"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      查看更多评论
                    </motion.button>
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
                <motion.button 
                  onClick={onReview}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-md"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  立即评价
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemDetail;