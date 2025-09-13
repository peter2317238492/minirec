// frontend/src/components/SearchBar.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const hotTags = ['故宫', '烤鸭', '长城', '火锅', '希尔顿', '四季', '全聚德', '科技馆'];

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "搜索景点、美食、酒店..." }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <motion.div 
        className="relative flex shadow-lg rounded-2xl overflow-hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.02 }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-6 py-4 border-0 focus:outline-none text-lg bg-white"
        />
        
        {/* 按钮组 */}
        <div className="flex">
          {searchQuery && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 text-gray-600"
              whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              清除
            </motion.button>
          )}
          <motion.button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            whileHover={{ 
              scale: 1.05,
              background: "linear-gradient(to right, #2563eb, #7c3aed)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
      
      {/* 热门搜索标签 */}
      <motion.div 
        className="mt-4 flex flex-wrap gap-3 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.span 
          className="text-sm text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          热门搜索：
        </motion.span>
        {hotTags.map((tag, index) => (
          <motion.button
            key={tag}
            type="button"
            onClick={() => {
              setSearchQuery(tag);
              onSearch(tag);
            }}
            className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm shadow-sm"
            whileHover={{ 
              scale: 1.1,
              background: "linear-gradient(to right, #e5e7eb, #d1d5db)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.1 * index + 0.5, 
              type: "spring", 
              stiffness: 400, 
              damping: 10 
            }}
          >
            {tag}
          </motion.button>
        ))}
      </motion.div>
    </form>
  );
};

export default SearchBar;