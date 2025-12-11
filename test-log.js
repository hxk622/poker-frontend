// 测试日志功能的简单脚本
// 可以直接在浏览器控制台中运行

// 导入日志工具
import { logger } from './src/utils/logger';
import api from './src/api/axios';

console.log('开始测试日志功能...');

// 测试基本日志
logger.debug('测试 DEBUG 日志', { message: '测试信息' });
logger.info('测试 INFO 日志', { user: 'testuser' });
logger.warn('测试 WARN 日志', { warning: '潜在问题' });
logger.error('测试 ERROR 日志', { error: '系统错误' });

// 测试API日志
logger.apiRequest('GET', '/test/api', { param: 'value' });
logger.apiResponse('GET', '/test/api', { data: 'test response' }, 200);
logger.apiError('GET', '/test/api', { status: 404, message: 'Not Found' });

// 测试真实API调用
console.log('测试真实API调用...');
try {
  const response = await api.get('/users/profile');
  console.log('API调用成功:', response);
} catch (error) {
  console.log('API调用失败:', error);
}

console.log('日志功能测试完成。');