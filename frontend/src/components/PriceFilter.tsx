import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceFilterProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ priceRange, onPriceRangeChange }) => {
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 预定义价格范围选项
  const priceRanges = [
    { label: '不限', min: 0, max: 10000 },
    { label: '经济型', min: 0, max: 200 },
    { label: '中档', min: 200, max: 500 },
    { label: '高档', min: 500, max: 1000 },
    { label: '豪华', min: 1000, max: 10000 },
  ];

  useEffect(() => {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
  }, [priceRange]);

  const handleApplyPriceRange = () => {
    onPriceRangeChange([minPrice, maxPrice]);
  };

  const handleResetPriceRange = () => {
    setMinPrice(0);
    setMaxPrice(10000);
    onPriceRangeChange([0, 10000]);
  };

  const handleQuickSelect = (range: { min: number; max: number }) => {
    setMinPrice(range.min);
    setMaxPrice(range.max);
    onPriceRangeChange([range.min, range.max]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          价格筛选
          <span className="ml-2 text-sm font-normal text-gray-500">
            {priceRange[0] === 0 && priceRange[1] === 10000 ? '不限' : `¥${priceRange[0]} - ¥${priceRange[1]}`}
          </span>
        </h3>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? '收起' : '展开'}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 快速选择 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">快速选择：</p>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range, index) => (
                  <motion.button
                    key={range.label}
                    onClick={() => handleQuickSelect(range)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      minPrice === range.min && maxPrice === range.max
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {range.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 自定义价格范围 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最低价格 (¥)
                </label>
                <input
                  type="number"
                  min="0"
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.max(0, Math.min(Number(e.target.value), maxPrice)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最高价格 (¥)
                </label>
                <input
                  type="number"
                  min={minPrice}
                  max="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(minPrice, Math.min(Number(e.target.value), 10000)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleApplyPriceRange}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                应用
              </motion.button>
              <motion.button
                onClick={handleResetPriceRange}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重置
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceFilter;