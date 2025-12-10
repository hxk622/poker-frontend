import api from './axios';

// 房间API服务
const roomApi = {
  // 获取房间列表
  getRooms: (params) => {
    return api.get('/rooms', { params });
  },

  // 创建房间
  createRoom: (roomData) => {
    return api.post('/rooms', roomData);
  },

  // 获取房间详情
  getRoomDetail: (roomId) => {
    return api.get(`/rooms/${roomId}`);
  },

  // 加入房间
  joinRoom: (roomId, joinData) => {
    return api.post(`/rooms/${roomId}/join`, joinData);
  },

  // 离开房间
  leaveRoom: (roomId) => {
    return api.post(`/rooms/${roomId}/leave`);
  },

  // 准备游戏
  readyGame: (roomId) => {
    return api.post(`/rooms/${roomId}/ready`);
  },

  // 取消准备
  cancelReady: (roomId) => {
    return api.post(`/rooms/${roomId}/cancel-ready`);
  }
};

export default roomApi;