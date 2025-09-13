// frontend/src/components/ItemCard.tsx
import React from 'react';
import { Item } from '../types';
import StarRating from './StarRating';
import { formatPurchaseCount, categoryColors, categoryLabels } from '../utils/helpers';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm line-clamp-2">{item.description}</p>
        </div>
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${categoryColors[item.category]}`}>
          {categoryLabels[item.category]}
        </span>
        
        {item.purchaseCount && item.purchaseCount > 100 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs font-semibold shadow-lg animate-pulse">
            🔥 热门
          </span>
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

          <div className="flex items-center text-orange-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-medium">{formatPurchaseCount(item.purchaseCount)}人购买</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;