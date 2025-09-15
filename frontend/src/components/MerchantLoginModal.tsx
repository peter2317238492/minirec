// frontend/src/components/MerchantLoginModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Merchant, MerchantLoginInfo } from '../types';

interface MerchantLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (merchant: Merchant, token: string, loginInfo?: MerchantLoginInfo) => void;
  isRegister: boolean;
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

const MerchantLoginModal: React.FC<MerchantLoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  isRegister, 
  setIsRegister 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    description: '',
    address: '',
    phone: '',
    businessHours: {
      open: '',
      close: ''
    },
    category: 'food' as 'attraction' | 'food' | 'hotel'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState<MerchantLoginInfo | null>(null);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [processingTime, setProcessingTime] = useState(0);
  const [showLoginDetails, setShowLoginDetails] = useState(false);

  // 重置表单当模态框关闭或切换模式时
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        description: '',
        address: '',
        phone: '',
        businessHours: {
          open: '',
          close: ''
        },
        category: 'food'
      });
      setError('');
      setLoginInfo(null);
      setLoginStatus('idle');
      setProcessingTime(0);
      setShowLoginDetails(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setError('');
  }, [isRegister]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    if (!formData.username || !formData.password) {
      setError('请填写所有必填字段');
      return false;
    }

    if (isRegister) {
      if (!formData.email || !formData.shopName || !formData.address || !formData.phone) {
        setError('请填写所有商家信息');
        return false;
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('请输入有效的邮箱地址');
        return false;
      }

      // 验证密码长度
      if (formData.password.length < 6) {
        setError('密码长度至少为6位');
        return false;
      }

      // 验证密码确认
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        return false;
      }

      // 验证营业时间
      if (!formData.businessHours.open || !formData.businessHours.close) {
        setError('请填写营业时间');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setLoading(true);
    setLoginStatus('processing');
    const startTime = Date.now();
    
    try {
      const endpoint = isRegister ? '/api/merchants/register' : '/api/merchants/login';
      
      let payload: any;
      if (isRegister) {
        payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          businessHours: formData.businessHours,
          category: formData.category
        };
      } else {
        payload = {
          username: formData.username,
          password: formData.password
        };
      }
      
      // 设置2秒超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('登录请求超时')), 2000);
      });
      
      const response = await Promise.race([
        axios.post(endpoint, payload),
        timeoutPromise
      ]) as any;
      
      const endTime = Date.now();
      setProcessingTime(endTime - startTime);
      
      if (response.data.token) {
        if (response.data.loginInfo) {
          setLoginInfo(response.data.loginInfo);
        }
        if (response.data.loginStatus) {
          setLoginStatus(response.data.loginStatus);
        }
        onLogin(response.data.merchant, response.data.token, response.data.loginInfo);
        onClose();
      }
    } catch (err: any) {
      const endTime = Date.now();
      setProcessingTime(endTime - startTime);
      setLoginStatus('failed');
      
      if (err.message === '登录请求超时') {
        setError('登录请求处理超时，请检查网络连接后重试');
      } else {
        setError(err.response?.data?.message || '操作失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
            >
              {/* 关闭按钮 */}
              <motion.button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              {/* 模态框内容 */}
              <div className="p-6">
                {/* 标题 */}
                <motion.div 
                  className="text-center mb-6"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.h2 
                    className="text-2xl font-bold text-gray-800"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {isRegister ? '商家注册' : '商家登录'}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-500 text-sm mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {isRegister ? '注册成为平台商家' : '登录商家管理后台'}
                  </motion.p>
                </motion.div>
                
                {/* 错误提示 */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.svg 
                        className="w-5 h-5 mr-2" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 1 }}
                      >
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </motion.svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 用户名 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用户名
                    </label>
                    <input
                      type="text"
                      placeholder="请输入用户名"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                      autoFocus
                    />
                  </div>
                  
                  {/* 商家信息（仅注册） */}
                  {isRegister && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          邮箱
                        </label>
                        <input
                          type="email"
                          placeholder="请输入邮箱地址"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          店铺名称
                        </label>
                        <input
                          type="text"
                          placeholder="请输入店铺名称"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.shopName}
                          onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          店铺描述
                        </label>
                        <textarea
                          placeholder="请输入店铺描述"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          地址
                        </label>
                        <input
                          type="text"
                          placeholder="请输入店铺地址"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          联系电话
                        </label>
                        <input
                          type="tel"
                          placeholder="请输入联系电话"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            营业开始时间
                          </label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.businessHours.open}
                            onChange={(e) => setFormData({
                              ...formData, 
                              businessHours: {...formData.businessHours, open: e.target.value}
                            })}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            营业结束时间
                          </label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.businessHours.close}
                            onChange={(e) => setFormData({
                              ...formData, 
                              businessHours: {...formData.businessHours, close: e.target.value}
                            })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          店铺类别
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                          required
                        >
                          <option value="food">餐饮</option>
                          <option value="attraction">景点</option>
                          <option value="hotel">酒店</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {/* 密码 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      密码
                    </label>
                    <input
                      type="password"
                      placeholder={isRegister ? "至少6位字符" : "请输入密码"}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  {/* 确认密码（仅注册） */}
                  {isRegister && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        确认密码
                      </label>
                      <input
                        type="password"
                        placeholder="请再次输入密码"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  )}
                  
                  {/* 提交按钮 */}
                  <motion.button 
                    type="submit" 
                    className={`w-full py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                      loginStatus === 'processing' ? 'bg-yellow-500' : 
                      loginStatus === 'success' ? 'bg-green-500' : 
                      loginStatus === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                    } text-white`}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loginStatus === 'processing' ? '认证中...' : '处理中...'}
                      </span>
                    ) : (
                      isRegister ? '注册' : '登录'
                    )}
                  </motion.button>
                  
                  {/* 登录状态显示 */}
                  {!isRegister && loginStatus !== 'idle' && (
                    <motion.div 
                      className={`mt-4 p-3 rounded text-sm ${
                        loginStatus === 'processing' ? 'bg-yellow-50 text-yellow-700' :
                        loginStatus === 'success' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {loginStatus === 'processing' && '正在验证商家身份...'}
                          {loginStatus === 'success' && '商家身份验证成功'}
                          {loginStatus === 'failed' && '商家身份验证失败'}
                        </span>
                        <span className="text-xs opacity-75">
                          {processingTime > 0 && `${processingTime}ms`}
                        </span>
                      </div>
                      
                      {processingTime > 2000 && (
                        <div className="mt-2 text-xs bg-red-100 p-2 rounded">
                          ⚠️ 处理时间超过2秒阈值 ({processingTime}ms)
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* 登录详情切换按钮 */}
                  {!isRegister && (
                    <motion.button
                      type="button"
                      onClick={() => setShowLoginDetails(!showLoginDetails)}
                      className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {showLoginDetails ? '隐藏登录详情' : '显示登录详情'}
                    </motion.button>
                  )}
                  
                  {/* 登录详情信息 */}
                  {!isRegister && showLoginDetails && (
                    <motion.div 
                      className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-600 space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">接收部门:</div>
                        <div>商家服务模块</div>
                        
                        <div className="font-medium">接收人:</div>
                        <div>认证鉴权子系统</div>
                        
                        <div className="font-medium">说明:</div>
                        <div>校验商家账号有效性，加载商家店铺信息和权限配置</div>
                        
                        <div className="font-medium">处理时限:</div>
                        <div>2秒</div>
                        
                        <div className="font-medium">提交人:</div>
                        <div>商家</div>
                        
                        {loginInfo && (
                          <>
                            <div className="font-medium">登录日期:</div>
                            <div>{loginInfo.date}</div>
                            
                            <div className="font-medium">登录类型:</div>
                            <div>{loginInfo.loginType}</div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </form>
                
                {/* 切换登录/注册 */}
                <motion.div 
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-gray-600">
                    {isRegister ? '已有商家账号？' : '还没有商家账号？'}
                    <motion.button 
                      onClick={() => {
                        setIsRegister(!isRegister);
                        setError('');
                      }}
                      className="text-blue-500 hover:text-blue-600 ml-1 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {isRegister ? '立即登录' : '立即注册'}
                    </motion.button>
                  </p>
                </motion.div>
                
                {/* 测试账号提示（仅登录时显示） */}
                {!isRegister && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    <p className="font-medium mb-1">测试账号：</p>
                    <p>用户名：merchant_test</p>
                    <p>密码：merchant123</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MerchantLoginModal;