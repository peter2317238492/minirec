// frontend/src/components/PreferencesModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
  currentPreferences?: {
    categories: string[];
    tags: string[];
    priceRange?: [number, number];
  };
  userId: string;
  token: string;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentPreferences, 
  userId, 
  token 
}) => {
  const [preferences, setPreferences] = useState({
    categories: currentPreferences?.categories || [],
    tags: currentPreferences?.tags || [],
    priceRange: currentPreferences?.priceRange || [0, 10000]
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'price'>('categories');

  // 预定义的选项
  const allCategories = [
    { value: 'attraction', label: '景点', icon: '🏛️', description: '名胜古迹、公园、博物馆等' },
    { value: 'food', label: '美食', icon: '🍽️', description: '餐厅、小吃、特色美食等' },
    { value: 'hotel', label: '酒店', icon: '🏨', description: '住宿、民宿、度假村等' }
  ];

  const allTags = [
    { category: '风格', tags: ['历史', '文化', '自然', '现代', '传统'] },
    { category: '活动', tags: ['购物', '娱乐', '休闲', '运动', '摄影'] },
    { category: '人群', tags: ['亲子', '情侣', '商务', '学生', '老年'] },
    { category: '预算', tags: ['经济', '舒适', '豪华', '特价', '高端'] }
  ];

  const priceRanges = [
    { label: '经济型', min: 0, max: 200 },
    { label: '舒适型', min: 200, max: 500 },
    { label: '高档型', min: 500, max: 1000 },
    { label: '豪华型', min: 1000, max: 10000 }
  ];

  // 更新偏好设置
  useEffect(() => {
    if (currentPreferences) {
      setPreferences({
        categories: currentPreferences.categories || [],
        tags: currentPreferences.tags || [],
        priceRange: currentPreferences.priceRange || [0, 10000]
      });
    }
  }, [currentPreferences, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleTag = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const setPriceRange = (min: number, max: number) => {
    setPreferences(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/users/${userId}/preferences`, preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSave(preferences);
      onClose();
    } catch (error) {
      console.error('保存偏好失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setPreferences({
      categories: [],
      tags: [],
      priceRange: [0, 10000]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">个性化偏好设置</h2>
              <p className="text-sm text-gray-500 mt-1">设置您的偏好，获得更精准的推荐</p>
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
        
        {/* 标签页 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'categories' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            类别偏好
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'tags' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            标签偏好
          </button>
          <button
            onClick={() => setActiveTab('price')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'price' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            价格区间
          </button>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 类别偏好 */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">选择您感兴趣的类别</p>
              {allCategories.map(cat => (
                <label 
                  key={cat.value} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    preferences.categories.includes(cat.value)
                        ? 'bg-blue-50 border-blue-400'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.categories.includes(cat.value)}
                      onChange={() => toggleCategory(cat.value)}
                      className="sr-only"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{cat.label}</span>
                  </label>
                ))}
            </div>
            )}
            {activeTab === 'tags' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">选择您感兴趣的标签</p>
                {allTags.map(group => (
                  <div key={group.category}>
                    <div className="font-semibold text-gray-700 mb-2">{group.category}</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.tags.map(tag => (
                        <label
                          key={tag}
                          className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                            preferences.tags.includes(tag)
                              ? 'bg-blue-50 border-blue-400'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={preferences.tags.includes(tag)}
                            onChange={() => toggleTag(tag)}
                            className="sr-only"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'price' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">选择您的价格区间</p>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={preferences.priceRange[0]}
                    onChange={e => setPreferences(prev => ({
                      ...prev,
                      priceRange: [Number(e.target.value), prev.priceRange[1]]
                    }))}
                    className="border rounded-lg p-2 mr-2"
                  />
                  <span className="text-gray-600">至</span>
                  <input
                    type="number"
                    value={preferences.priceRange[1]}
                    onChange={e => setPreferences(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)]
                    }))}
                    className="border rounded-lg p-2 ml-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="p-6 border-t">
          <div className="flex justify-end">
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700 mr-4"
            >
              清除所有
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default PreferencesModal;
