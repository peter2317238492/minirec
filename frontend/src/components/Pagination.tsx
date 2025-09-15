import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);
      
      // 计算当前页周围的页码
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // 如果当前页接近开头
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // 如果当前页接近结尾
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // 添加省略号（如果需要）
      if (startPage > 2) {
        pages.push('...');
      }
      
      // 添加中间页码
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // 添加省略号（如果需要）
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // 总是显示最后一页
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* 上一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        上一页
      </button>

      {/* 页码按钮 */}
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* 下一页按钮 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        下一页
      </button>

      {/* 页码跳转 */}
      <div className="flex items-center space-x-2 ml-4">
        <span className="text-sm text-gray-600">跳转到</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handlePageInput}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
        />
        <span className="text-sm text-gray-600">/ {totalPages} 页</span>
      </div>
    </div>
  );
};

export default Pagination;