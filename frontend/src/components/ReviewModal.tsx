// frontend/src/components/ReviewModal.tsx
import React, { useState } from 'react';
import { Item, User } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  user: User | null;
  onSubmit: (payload: {
    rating: number;
    taste?: number;
    service?: number;
    environment?: number;
    comfort?: number;
    location?: number;
    scenery?: number;
    transportation?: number;
    comment: string;
  }) => void;
  category?: 'food' | 'hotel' | 'attraction';
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  item,
  user,
  onSubmit,
  category
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [extraRatings, setExtraRatings] = useState({
    taste: 5,
    service: 5,
    environment: 5,
    comfort: 5,
    location: 5,
    scenery: 5,
    transportation: 5
  });
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item || !user) return null;

  // 根据类别获取额外评分项
  const getExtraRatingFields = () => {
    switch (category || item.category) {
      case 'food':
        return [
          { key: 'taste', label: '口味', icon: '🍽️' },
          { key: 'service', label: '服务', icon: '🛎️' },
          { key: 'environment', label: '环境', icon: '🌿' }
        ];
      case 'hotel':
        return [
          { key: 'comfort', label: '舒适度', icon: '🛏️' },
          { key: 'service', label: '服务', icon: '🛎️' },
          { key: 'location', label: '位置', icon: '📍' }
        ];
      case 'attraction':
        return [
          { key: 'scenery', label: '景色', icon: '🏞️' },
          { key: 'service', label: '服务', icon: '🛎️' },
          { key: 'transportation', label: '交通', icon: '🚗' }
        ];
      default:
        return [];
    }
  };

  const extraFields = getExtraRatingFields();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      alert('请输入评论内容');
      return;
    }

    setLoading(true);
    
    const payload: any = {
      rating,
      comment: comment.trim()
    };

    // 添加额外评分
    extraFields.forEach(field => {
      payload[field.key] = extraRatings[field.key as keyof typeof extraRatings];
    });

    try {
      await onSubmit(payload);
      // 重置表单
      setRating(5);
      setComment('');
      setExtraRatings({
        taste: 5,
        service: 5,
        environment: 5,
        comfort: 5,
        location: 5,
        scenery: 5,
        transportation: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRatingInput: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label?: string;
    icon?: string;
  }> = ({ value, onChange, label, icon }) => {
    const [localHover, setLocalHover] = useState<number | null>(null);
    
    return (
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-sm text-gray-700 font-medium flex items-center gap-1 min-w-[80px]">
            {icon && <span>{icon}</span>}
            {label}
          </span>
        )}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setLocalHover(star)}
              onMouseLeave={() => setLocalHover(null)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                className={`w-6 h-6 ${
                  star <= (localHover || value) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 min-w-[40px]">
            {localHover || value}/5
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">撰写评价</h2>
              <p className="text-sm text-gray-500 mt-1">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* 总体评分 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                总体评分
              </label>
              <div className="flex items-center justify-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">
                {rating === 5 && '非常满意'}
                {rating === 4 && '满意'}
                {rating === 3 && '一般'}
                {rating === 2 && '不满意'}
                {rating === 1 && '非常不满意'}
              </p>
            </div>

            {/* 额外评分项 */}
            {extraFields.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  详细评分
                </label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {extraFields.map(field => (
                    <StarRatingInput
                      key={field.key}
                      value={extraRatings[field.key as keyof typeof extraRatings]}
                      onChange={(value) => setExtraRatings({
                        ...extraRatings,
                        [field.key]: value
                      })}
                      label={field.label}
                      icon={field.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 评论内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评论内容
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={5}
                placeholder="分享您的体验..."
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                💡 优质的评价可以帮助其他用户做出更好的选择
              </p>
            </div>
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !comment.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '提交中...' : '提交评价'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;