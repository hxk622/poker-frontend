<template>
  <div class="home">
    <h1>欢迎来到德州扑克</h1>
    <p>开始你的扑克之旅吧！</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { logger } from '../utils/logger';
import api from '../api/axios';

// 首页组件逻辑
onMounted(() => {
  console.log('HomeView组件已挂载');
  
  // 测试基本日志
  logger.debug('HomeView DEBUG 日志', { page: 'home' });
  logger.info('HomeView INFO 日志', { page: 'home' });
  logger.warn('HomeView WARN 日志', { page: 'home' });
  logger.error('HomeView ERROR 日志', { page: 'home' });
  
  // 测试API日志
  logger.apiRequest('GET', '/test/api', { param: 'value' });
  logger.apiResponse('GET', '/test/api', { data: 'test response' }, 200);
  logger.apiError('GET', '/test/api', { status: 404, message: 'Not Found' });
  
  // 测试真实API调用
  console.log('开始测试真实API调用...');
  testApiCall();
});

// 测试真实API调用
const testApiCall = async () => {
  try {
    console.log('发起API请求...');
    const response = await api.get('/users/profile');
    console.log('API调用成功:', response);
  } catch (error) {
    console.log('API调用失败:', error);
  }
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
</style>