import { io } from 'socket.io-client';

// 创建Socket.IO实例
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = {};
  }

  // 连接到服务器
  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    // 获取token
    const token = localStorage.getItem('token');

    // 创建连接
    this.socket = io('http://localhost:3000', {
      auth: {
        token
      },
      transports: ['websocket'],
      timeout: 10000
    });

    // 连接成功事件
    this.socket.on('connect', () => {
      console.log('Socket.IO连接成功');
      this.isConnected = true;
    });

    // 连接错误事件
    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO连接错误:', error);
      this.isConnected = false;
    });

    // 断开连接事件
    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO断开连接:', reason);
      this.isConnected = false;
    });

    // 重连事件
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO重连成功，尝试次数:', attemptNumber);
      this.isConnected = true;
    });

    // 重连失败事件
    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO重连失败');
      this.isConnected = false;
    });

    // 重连尝试事件
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO重连尝试，次数:', attemptNumber);
    });
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers = {};
    }
  }

  // 发送事件
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    } else {
      console.error('Socket.IO未连接，无法发送事件:', eventName);
    }
  }

  // 监听事件
  on(eventName, callback) {
    if (this.socket) {
      // 保存事件处理函数
      if (!this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = [];
      }
      this.eventHandlers[eventName].push(callback);

      // 注册事件监听
      this.socket.on(eventName, callback);
    }
  }

  // 移除事件监听
  off(eventName, callback) {
    if (this.socket) {
      // 移除特定回调
      if (callback) {
        this.socket.off(eventName, callback);
        // 从事件处理函数列表中移除
        if (this.eventHandlers[eventName]) {
          this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(handler => handler !== callback);
        }
      } else {
        // 移除所有回调
        this.socket.off(eventName);
        // 清空事件处理函数列表
        if (this.eventHandlers[eventName]) {
          this.eventHandlers[eventName] = [];
        }
      }
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected;
  }

  // 获取Socket ID
  getSocketId() {
    return this.socket?.id;
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;