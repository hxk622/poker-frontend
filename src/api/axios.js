import axios from 'axios';

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
    return config;
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 只返回响应数据
    return response.data;
  },
  (error) => {
    // 响应错误处理
    if (error.response) {
      // 请求已发出，服务器返回状态码不在2xx范围内
      console.error('API错误:', error.response.data);
      // 401未授权，清除token并跳转到登录页
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('网络错误:', error.request);
    } else {
      // 请求配置错误
      console.error('请求错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;