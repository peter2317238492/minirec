import React, { useMemo, useState, useEffect } from 'react';

interface Item {
  _id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  user: User | null;
  onSubmit: (payload: {
    rating: number;
    taste: number;      // 分项1：展示名称根据品类变化
    packaging: number;  // 分项2：展示名称根据品类变化
    comment: string;
  }) => void;
  category?: 'attraction' | 'food' | 'hotel';
}

// —— 不同品类下的标题、分项标签及文案 ——
// 注意：payload 字段名保持 taste/packaging，不影响后端；仅前端展示名称变化
const CATEGORY_UI = {
  food: {
    title: '美食评分/评论',
    sub1Label: '口味',          // -> taste
    sub2Label: '卫生',          // -> packaging
    tip: '说说味道怎么样，给大家参考',
    placeholder: '从口味、卫生、分量、包装等方面说一说～',
  },
  hotel: {
    title: '酒店评分/评论',
    sub1Label: '卫生',          // -> taste
    sub2Label: '服务',          // -> packaging
    tip: '住得舒不舒服？给后来的人一点参考',
    placeholder: '可从卫生、服务、位置、噪音、设施等方面分享你的体验～',
  },
  attraction: {
    title: '景点评分/评论',
    sub1Label: '体验',          // -> taste
    sub2Label: '环境',          // -> packaging
    tip: '值不值得去？说说你的真实感受',
    placeholder: '可从可玩性、环境秩序、交通便利、性价比等方面说一说～',
  },
} as const;

const labels = ['非常不满意', '不满意', '一般', '满意', '非常满意'];

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  item,
  user,
  onSubmit,
  category = 'food',
}) => {
  const ui = CATEGORY_UI[category];

  const [rating, setRating] = useState(0);
  const [taste, setTaste] = useState(0);
  const [packaging, setPackaging] = useState(0);
  const [comment, setComment] = useState('');

  // 每次弹窗打开或切换 item/category 时重置
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setTaste(0);
      setPackaging(0);
      setComment('');
    }
  }, [isOpen, item?._id, category]);

  const ratingText = useMemo(() => (rating > 0 ? labels[rating - 1] : ''), [rating]);
  const tasteText = useMemo(() => (taste > 0 ? labels[taste - 1] : ''), [taste]);
  const packagingText = useMemo(() => (packaging > 0 ? labels[packaging - 1] : ''), [packaging]);

  if (!isOpen || !item || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, taste, packaging, comment: comment.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[680px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="关闭"
        >
          ✕
        </button>

        {/* 标题 */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{ui.title}</h2>
        </div>

        {/* 名称 */}
        <div className="mb-3 flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-orange-100" />
          <div className="text-base">
            <span className="font-medium">{item.name}</span>
          </div>
        </div>

        {/* 星级评分块 */}
        <div className="mb-4 space-y-4">
          <RatingRow label="总体" value={rating} onChange={setRating} rightText={ratingText} />
          <RatingRow label={ui.sub1Label} value={taste} onChange={setTaste} rightText={tasteText} />
          <RatingRow label={ui.sub2Label} value={packaging} onChange={setPackaging} rightText={packagingText} />
        </div>

        {/* 评论输入框 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              <span className="text-lg">✍️</span>
              <span>{ui.tip}</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={ui.placeholder}
              className="w-full resize-y rounded-xl border border-gray-200 p-3 outline-none ring-0 placeholder:text-gray-400 focus:border-orange-400"
            />
          </div>

          {/* 底部提交 */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-60"
              disabled={rating === 0 || !comment.trim()} // 示例：强制至少选总体评分
            >
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** 单行星级评分（5 颗星） */
function RatingRow({
  label,
  value,
  onChange,
  rightText,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  rightText?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="w-16 shrink-0 text-base font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <StarGroup value={value} onChange={onChange} />
      </div>
      <div className="w-28 text-right text-sm text-gray-700">{rightText}</div>
    </div>
  );
}

function StarGroup({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className="group rounded p-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
          onClick={() => onChange(i)}
          aria-label={`评分 ${i} 星`}
        >
          <Star filled={i <= value} />
        </button>
      ))}
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-7 w-7 ${filled ? 'fill-yellow-400 stroke-yellow-400' : 'fill-gray-200 stroke-gray-300'}`}
      strokeWidth="1.5"
    >
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.8 6.2 20.7l1.1-6.6L2.5 9.4l6.6-.9L12 2.5z" />
    </svg>
  );
}

export default ReviewModal;
