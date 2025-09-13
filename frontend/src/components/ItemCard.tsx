// frontend/src/components/ItemCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Item } from '../types';
import StarRating from './StarRating';
import { formatPurchaseCount, categoryColors, categoryLabels } from '../utils/helpers';
import { calculateDistance, formatDistance } from '../utils/location';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const calculateItemDistance = async () => {
      try {
        const dist = await calculateDistance(item);
        setDistance(dist);
      } catch (error) {
        console.log('计算距离失败:', error);
      }
    };

    calculateItemDistance();
  }, [item]);

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
      onClick={onClick}
      whileHover={{ 
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-48 relative">
        <img
          src={item.images?.[0] || 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400&q=80'}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400&q=80';
          }}
          loading="lazy"
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-white text-sm line-clamp-2">{item.description}</p>
        </motion.div>
        <motion.span 
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${categoryColors[item.category]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
        >
          {categoryLabels[item.category]}
        </motion.span>
        
        {item.purchaseCount && item.purchaseCount > 100 && (
          <motion.span 
            className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs font-semibold shadow-lg"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🔥 热门
          </motion.span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <StarRating rating={item.rating} />
          <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">¥{item.price}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{item.location.city}</span>
          </div>

          <div className="flex items-center gap-3">
            {distance !== null && (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="font-medium">{formatDistance(distance)}</span>
              </div>
            )}
            
            <div className="flex items-center text-orange-500">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-medium">{formatPurchaseCount(item.purchaseCount)}人购买</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag, index) => (
            <motion.span 
              key={tag} 
              className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 400, damping: 10 }}
              whileHover={{ scale: 1.1, backgroundColor: "#dbeafe" }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;