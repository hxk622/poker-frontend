import { defineStore } from 'pinia';

// 用户状态管理
export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    // 用户信息
    userInfo: {
      id: '',
      username: '',
      avatar: '',
      email: '',
      phone: ''
    },
    // 登录状态
    isLoggedIn: false,
    // 认证令牌
    token: localStorage.getItem('token') || '',
    // 用户统计数据
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalChips: 0,
      winRate: 0
    }
  }),

  //  getter
  getters: {
    // 获取用户ID
    getUserId: (state) => state.userInfo.id,
    // 获取用户名
    getUsername: (state) => state.userInfo.username,
    // 获取用户头像
    getAvatar: (state) => state.userInfo.avatar,
    // 获取登录状态
    getLoggedInStatus: (state) => state.isLoggedIn,
    // 获取认证令牌
    getToken: (state) => state.token,
    // 获取用户统计数据
    getUserStats: (state) => state.stats
  },

  // 动作
  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo };
      this.isLoggedIn = true;
    },

    // 设置认证令牌
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },

    // 设置用户统计数据
    setUserStats(stats) {
      this.stats = stats;
    },

    // 登录
    login(userInfo, token) {
      this.setUserInfo(userInfo);
      this.setToken(token);
    },

    // 登出
    logout() {
      this.userInfo = {
        id: '',
        username: '',
        avatar: '',
        email: '',
        phone: ''
      };
      this.isLoggedIn = false;
      this.token = '';
      this.stats = {
        gamesPlayed: 0,
        gamesWon: 0,
        totalChips: 0,
        winRate: 0
      };
      localStorage.removeItem('token');
    },

    // 更新用户信息
    updateUserProfile(data) {
      this.userInfo = { ...this.userInfo, ...data };
    }
  }
});