import axios from 'axios';
import { logger } from '../utils/logger';

// 创建axios实例
const api = axios.create({
  // 基础URL
  baseURL: 'http://localhost:3000/api',
  // 请求超时时间
  timeout: 10000,
  // 请求头配置
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    // 如果有token，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 记录API请求日志
    logger.apiRequest(config.method.toUpperCase(), config.url, config.data);
    
    return config;
  },
  (error) => {
    // 请求错误处理
    if (error.config) {
      logger.apiError(error.config.method?.toUpperCase(), error.config.url, error.message);
    } else {
      logger.error('API请求配置错误', error);
    }
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 记录API响应日志
    logger.apiResponse(response.config.method.toUpperCase(), response.config.url, response.data, response.status);
    
    // 只返回响应数据
    return response.data;
  },
  (error) => {
    // 响应错误处理
    if (error.response) {
      // 请求已发出，服务器返回状态码不在2xx范围内
      logger.apiError(
        error.config.method.toUpperCase(), 
        error.config.url, 
        { status: error.response.status, data: error.response.data }
      );
      // 401未授权，清除token并跳转到登录页
      if (error.response.status === 401) {
        logger.warn('用户未授权，清除token并跳转到登录页');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      logger.error('网络错误: 未收到服务器响应', error.request);
    } else {
      // 请求配置错误
      logger.error('请求错误: 配置错误', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;