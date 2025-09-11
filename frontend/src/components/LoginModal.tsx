// frontend/src/components/LoginModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, token: string) => void;
  isRegister: boolean;
  setIsRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
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
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 重置表单当模态框关闭或切换模式时
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setError('');
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
      if (!formData.email) {
        setError('请填写邮箱');
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
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
      const payload = isRegister 
        ? { username: formData.username, email: formData.email, password: formData.password }
        : { username: formData.username, password: formData.password };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.token) {
        onLogin(response.data.user, response.data.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative animate-fadeIn">
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* 模态框内容 */}
        <div className="p-6">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isRegister ? '创建新账号' : '欢迎回来'}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {isRegister ? '注册以享受个性化推荐服务' : '登录到您的账号'}
            </p>
          </div>
          
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
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
            
            {/* 邮箱（仅注册） */}
            {isRegister && (
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
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
              ) : (
                isRegister ? '注册' : '登录'
              )}
            </button>
          </form>
          
          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? '已有账号？' : '还没有账号？'}
              <button 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-blue-500 hover:text-blue-600 ml-1 font-medium"
              >
                {isRegister ? '立即登录' : '立即注册'}
              </button>
            </p>
          </div>
          
          {/* 测试账号提示（仅登录时显示） */}
          {!isRegister && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
              <p className="font-medium mb-1">测试账号：</p>
              <p>用户名：test_yj@qq.com</p>
              <p>密码：test_yj</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;