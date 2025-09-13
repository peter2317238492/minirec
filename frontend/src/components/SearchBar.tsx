// frontend/src/components/SearchBar.tsx
import React, { useState } from 'react';

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
      <div className="relative flex shadow-lg rounded-2xl overflow-hidden">
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
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              清除
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 热门搜索标签 */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <span className="text-sm text-gray-600 font-medium">热门搜索：</span>
        {hotTags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => {
            setSearchQuery(tag);
            onSearch(tag);
            }}
            className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
          >
            {tag}
          </button>
       ))}
      </div>
    </form>
  );
};

export default SearchBar;