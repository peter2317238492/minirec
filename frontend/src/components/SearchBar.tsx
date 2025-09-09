// frontend/src/components/SearchBar.tsx
import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 text-lg"
        />
        
        {/* 按钮组 */}
        <div className="flex">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              清除
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>
      
      {/* 热门搜索标签 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">热门搜索：</span>
        {['故宫', '烤鸭', '长城', '火锅', '五星级'].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSearchQuery(tag);
              onSearch(tag);
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};

export default SearchBar;