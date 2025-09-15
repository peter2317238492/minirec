// frontend/src/components/MerchantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Merchant, MerchantLoginInfo, LoginRecord } from '../types';
import axios from 'axios';

interface MerchantDashboardProps {
  merchant: Merchant;
  token: string;
  loginInfo?: MerchantLoginInfo;
  onLogout: () => void;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ 
  merchant, 
  token, 
  loginInfo, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'info' | 'loginHistory'>('dashboard');
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    shopName: merchant.merchantInfo.shopName,
    description: merchant.merchantInfo.description,
    address: merchant.merchantInfo.address,
    phone: merchant.merchantInfo.phone,
    businessHours: merchant.merchantInfo.businessHours
  });

  // 获取登录历史
  useEffect(() => {
    if (activeTab === 'loginHistory' && loginHistory.length === 0) {
      fetchLoginHistory();
    }
  }, [activeTab]);

  const fetchLoginHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/merchants/login-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLoginHistory(response.data.loginHistory || []);
    } catch (error) {
      console.error('获取登录历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const response = await axios.put('/api/merchants/info', {
        merchantInfo: {
          ...merchant.merchantInfo,
          shopName: editForm.shopName,
          description: editForm.description,
          address: editForm.address,
          phone: editForm.phone,
          businessHours: editForm.businessHours
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.merchant) {
        setEditMode(false);
        // 这里可以更新全局的merchant状态
        alert('商家信息更新成功');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '更新失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '已通过';
      case 'pending': return '待审核';
      case 'rejected': return '已拒绝';
      case 'suspended': return '已暂停';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">商家管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{merchant.username}
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'dashboard', label: '控制台' },
              { key: 'info', label: '商家信息' },
              { key: 'loginHistory', label: '登录历史' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">商家控制台</h2>
              
              {/* 登录信息卡片 */}
              {loginInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">本次登录信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">登录时间：</span>
                      <span className="text-blue-900">{loginInfo.date}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">登录类型：</span>
                      <span className="text-blue-900">{loginInfo.loginType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">接收部门：</span>
                      <span className="text-blue-900">{loginInfo.receiver}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">处理时限：</span>
                      <span className="text-blue-900">{loginInfo.processingTime}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-700">说明：</span>
                      <span className="text-blue-900">{loginInfo.description}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 商家基本信息卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">店铺信息</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">店铺名称：</span>{merchant.merchantInfo.shopName}</p>
                    <p><span className="font-medium">店铺类别：</span>{merchant.merchantInfo.category}</p>
                    <p><span className="font-medium">状态：</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(merchant.merchantInfo.status)}`}>
                        {getStatusText(merchant.merchantInfo.status)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">联系方式</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">电话：</span>{merchant.merchantInfo.phone}</p>
                    <p><span className="font-medium">邮箱：</span>{merchant.merchantInfo.email}</p>
                    <p><span className="font-medium">地址：</span>{merchant.merchantInfo.address}</p>
                  </div>
                </div>
              </div>

              {/* 权限信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">权限配置</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(merchant.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">
                        {key === 'canAddItems' && '添加商品'}
                        {key === 'canEditItems' && '编辑商品'}
                        {key === 'canDeleteItems' && '删除商品'}
                        {key === 'canViewAnalytics' && '查看分析'}
                        {key === 'canManageOrders' && '管理订单'}
                        {key === 'canRespondToReviews' && '回复评价'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">商家信息</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    编辑信息
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      店铺名称
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.shopName}
                      onChange={(e) => setEditForm({...editForm, shopName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      店铺描述
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地址
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      联系电话
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        营业开始时间
                      </label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editForm.businessHours.open}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          businessHours: {...editForm.businessHours, open: e.target.value}
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        营业结束时间
                      </label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editForm.businessHours.close}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          businessHours: {...editForm.businessHours, close: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveInfo}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">店铺名称</h3>
                      <p className="text-lg">{merchant.merchantInfo.shopName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">店铺类别</h3>
                      <p className="text-lg">{merchant.merchantInfo.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">状态</h3>
                      <p className="text-lg">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(merchant.merchantInfo.status)}`}>
                          {getStatusText(merchant.merchantInfo.status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">联系电话</h3>
                      <p className="text-lg">{merchant.merchantInfo.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">店铺描述</h3>
                    <p className="text-lg">{merchant.merchantInfo.description || '暂无描述'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">地址</h3>
                    <p className="text-lg">{merchant.merchantInfo.address}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">营业时间</h3>
                      <p className="text-lg">
                        {merchant.merchantInfo.businessHours.open} - {merchant.merchantInfo.businessHours.close}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">邮箱</h3>
                      <p className="text-lg">{merchant.merchantInfo.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'loginHistory' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">登录历史</h2>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : loginHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          登录时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          登录类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP地址
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户代理
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginHistory.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(record.loginDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.loginType === 'password' ? '账号密码登录' : '第三方登录'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.ipAddress}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {record.userAgent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无登录历史记录</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;