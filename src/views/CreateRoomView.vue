<template>
  <div class="create-room">
    <!-- 页面标题 -->
    <van-nav-bar
      title="创建房间"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="create-room-container">
      <!-- 房间参数设置表单 -->
      <van-form @submit="handleCreateRoom">
        <van-cell-group inset>
          <!-- 小盲注 -->
          <van-field
            v-model="roomForm.smallBlind"
            name="smallBlind"
            label="小盲注"
            placeholder="请输入小盲注金额"
            left-icon="coin"
            type="number"
            :rules="[{ required: true, message: '请输入小盲注金额' }, { min: 1, message: '小盲注金额不能小于1' }]"
          />
          
          <!-- 大盲注 -->
          <van-field
            v-model="roomForm.bigBlind"
            name="bigBlind"
            label="大盲注"
            placeholder="请输入大盲注金额"
            left-icon="coin"
            type="number"
            :rules="[{ required: true, message: '请输入大盲注金额' }, { min: 2, message: '大盲注金额不能小于2' }]"
          />
          
          <!-- 最大玩家数量 -->
          <van-cell title="最大玩家数量">
            <template #right-icon>
              <van-picker
                v-model="roomForm.maxPlayers"
                :columns="maxPlayersOptions"
                @confirm="onMaxPlayersConfirm"
                show-toolbar
              />
            </template>
          </van-cell>
          
          <!-- 游戏模式 -->
          <van-cell title="游戏模式">
            <template #right-icon>
              <van-picker
                v-model="roomForm.gameMode"
                :columns="gameModeOptions"
                @confirm="onGameModeConfirm"
                show-toolbar
              />
            </template>
          </van-cell>
          
          <!-- 是否允许观看 -->
          <van-cell>
            <template #title>
              允许观看
            </template>
            <template #right-icon>
              <van-switch v-model="roomForm.allowSpectators" size="24px" />
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 创建房间按钮 -->
        <van-button
          type="primary"
          class="create-room-btn"
          native-type="submit"
          :loading="loading"
        >
          创建房间
        </van-button>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import roomApi from '../api/room';
import { showToast, showLoadingToast, closeToast } from 'vant';

// 路由实例
const router = useRouter();

// 房间表单数据
const roomForm = reactive({
  smallBlind: 10,
  bigBlind: 20,
  maxPlayers: 6,
  gameMode: 'no_limit',
  allowSpectators: true
});

// 最大玩家数量选项
const maxPlayersOptions = [2, 4, 6, 8, 9, 10];
// 游戏模式选项
const gameModeOptions = [
  { text: '无限注', value: 'no_limit' },
  { text: '有限注', value: 'limit' },
  { text: '固定注', value: 'pot_limit' }
];

// 加载状态
const loading = ref(false);

// 返回按钮点击事件
const onClickLeft = () => {
  router.back();
};

// 最大玩家数量选择确认
const onMaxPlayersConfirm = () => {
  // 这里可以添加额外的逻辑
};

// 游戏模式选择确认
const onGameModeConfirm = () => {
  // 这里可以添加额外的逻辑
};

// 创建房间
const handleCreateRoom = async () => {
  try {
    // 验证大盲注必须是小盲注的两倍
    if (roomForm.bigBlind !== roomForm.smallBlind * 2) {
      showToast('大盲注必须是小盲注的两倍');
      return;
    }

    // 显示加载提示
    loading.value = true;

    // 调用创建房间API
    const response = await roomApi.createRoom({
      smallBlind: parseInt(roomForm.smallBlind),
      bigBlind: parseInt(roomForm.bigBlind),
      maxPlayers: roomForm.maxPlayers,
      gameMode: roomForm.gameMode,
      allowSpectators: roomForm.allowSpectators
    });

    if (response && response.room) {
      // 创建成功，跳转到房间详情页
      showToast('房间创建成功');
      router.push(`/room/${response.room.id}`);
    } else {
      showToast(response?.message || '房间创建失败');
    }
  } catch (error) {
    console.error('创建房间失败:', error);
    showToast('房间创建失败，请稍后重试');
  } finally {
    // 关闭加载提示
    loading.value = false;
  }
};
</script>

<style scoped>
.create-room {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.create-room-container {
  padding: 20px;
}

.create-room-btn {
  width: 100%;
  margin-top: 20px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .create-room-container {
    padding: 10px;
  }
  
  .create-room-btn {
    margin-top: 15px;
    height: 40px;
    font-size: 15px;
  }
}
</style>