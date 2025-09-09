// frontend/src/components/ImageGallery.tsx
import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<{[key: number]: boolean}>({});

  // 如果没有图片或图片加载失败，显示默认图片
  const defaultImage = 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80';
  
  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };
  
  const handleImageError = (index: number) => {
    setImageError(prev => ({...prev, [index]: true}));
  };

  // 如果没有图片，使用默认图片
  const displayImages = images && images.length > 0 ? images : [defaultImage];
  
  return (
    <div className="relative">
      {/* 主图片显示 */}
      <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
        <img 
          src={imageError[currentIndex] ? defaultImage : displayImages[currentIndex]}
          alt={`${title} - 图片 ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={() => handleImageError(currentIndex)}
        />
        
        {/* 图片切换按钮 - 只在有多张图片时显示 */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
              aria-label="上一张"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
              aria-label="下一张"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* 图片指示器 */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`切换到图片 ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* 图片计数 */}
        {displayImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>
      
      {/* 缩略图列表 - 只在有多张图片时显示 */}
      {displayImages.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-blue-500' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img 
                src={imageError[index] ? defaultImage : image}
                alt={`缩略图 ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;