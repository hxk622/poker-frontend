<template>
  <div class="game-container">
    <!-- 顶部状态栏 -->
    <div class="top-status">
      <div class="game-status">
        <div class="status-item">
          <span class="label">游戏状态：</span>
          <span class="value">{{ gameState.statusText }}</span>
        </div>
        <div class="status-item">
          <span class="label">当前回合：</span>
          <span class="value">{{ gameState.currentRound }}</span>
        </div>
        <div class="status-item">
          <span class="label">当前玩家：</span>
          <span class="value">{{ gameState.currentPlayer }}</span>
        </div>
      </div>
      <div class="pot-info">
        <span class="label">底池：</span>
        <span class="value">{{ gameState.pot }}</span>
      </div>
    </div>

    <!-- 游戏桌区域 -->
    <div class="game-table">
      <!-- 玩家座位区域 -->
      <div class="player-seats">
        <!-- 玩家座位（按照德州扑克座位顺序排列） -->
        <div
          v-for="(seat, index) in playerSeats"
          :key="index"
          class="player-seat"
          :class="{ 'active': seat.isActive, 'current-player': seat.isCurrentPlayer }"
        >
          <div v-if="seat.player" class="player-info">
            <div class="player-avatar">
              <van-image
                :src="seat.player.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
                round
                width="40"
                height="40"
              />
            </div>
            <div class="player-name">{{ seat.player.username }}</div>
            <div class="player-stack">
              <span class="stack-value">{{ seat.player.stack }}</span>
              <span class="stack-label">筹码</span>
            </div>
            <div v-if="seat.player.bet > 0" class="player-bet">
              <span class="bet-value">{{ seat.player.bet }}</span>
              <span class="bet-label">下注</span>
            </div>
            <div v-if="seat.isDealer" class="dealer-badge">D</div>
            <div v-if="seat.isSmallBlind" class="blind-badge small">SB</div>
            <div v-if="seat.isBigBlind" class="blind-badge big">BB</div>
          </div>
        </div>
      </div>

      <!-- 公共牌区域 -->
      <div class="community-cards">
        <div
          v-for="(card, index) in gameState.communityCards"
          :key="index"
          class="card"
          :class="{ 'hidden': !card.revealed }"
        >
          <div v-if="card.revealed" class="card-content">
            <div class="card-suit" :class="card.suit.toLowerCase()">
              {{ getSuitSymbol(card.suit) }}
            </div>
            <div class="card-value">{{ card.value }}</div>
          </div>
        </div>
      </div>

      <!-- 底池显示 -->
      <div class="pot-display">
        <div class="pot-label">底池</div>
        <div class="pot-amount">{{ gameState.pot }}</div>
      </div>
    </div>

    <!-- 当前玩家手牌 -->
    <div class="player-cards">
      <div class="cards-title">你的手牌</div>
      <div class="cards-container">
        <div
          v-for="(card, index) in playerCards"
          :key="index"
          class="card player-card"
        >
          <div class="card-content">
            <div class="card-suit" :class="card.suit.toLowerCase()">
              {{ getSuitSymbol(card.suit) }}
            </div>
            <div class="card-value">{{ card.value }}</div>
          </div>
        </div>
      </div>
      <!-- AI分析结果 -->
      <div v-if="aiAnalysis.show" class="ai-analysis-result">
        <div class="analysis-title">AI分析</div>
        <div class="analysis-content">
          <div class="hand-strength">
            <span class="label">手牌强度：</span>
            <span class="value">{{ aiAnalysis.handStrength }}</span>
          </div>
          <div class="recommended-action">
            <span class="label">推荐操作：</span>
            <span class="value">{{ aiAnalysis.recommendedAction }}</span>
          </div>
          <div class="win-probability">
            <span class="label">获胜概率：</span>
            <span class="value">{{ aiAnalysis.winProbability }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏控制区域 -->
    <div class="game-controls">
      <!-- 下注滑块 -->
      <div class="bet-controls">
        <div class="bet-slider">
          <van-slider
            v-model="betAmount"
            :min="minBet"
            :max="maxBet"
            :step="gameState.bigBlind"
            @change="onBetChange"
          />
        </div>
        <div class="bet-amount-display">
          <span class="label">下注金额：</span>
          <span class="value">{{ betAmount }}</span>
        </div>
        <div class="bet-quick-buttons">
          <van-button size="small" @click="setBetAmount(minBet)">
            跟注
          </van-button>
          <van-button size="small" @click="setBetAmount(gameState.bigBlind * 2)">
            加注
          </van-button>
          <van-button size="small" @click="setBetAmount(maxBet)">
            全押
          </van-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="default" block @click="fold">
          弃牌
        </van-button>
        <van-button type="primary" block @click="checkOrCall" :disabled="!canCheckOrCall">
          {{ canCheck ? '过牌' : '跟注' }}
        </van-button>
        <van-button type="success" block @click="raise" :disabled="!canRaise">
          加注
        </van-button>
      </div>
    </div>

    <!-- 底部功能栏 -->
    <div class="bottom-bar">
      <van-tabs v-model:active="activeTab">
        <van-tab title="游戏">
          <!-- 游戏相关信息 -->
        </van-tab>
        <van-tab title="聊天">
          <div class="chat-section">
            <div class="chat-messages">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                class="chat-message"
                :class="{ 'own-message': message.senderId === currentUserId }"
              >
                <div class="message-content">
                  <div class="message-sender">{{ message.username }}</div>
                  <div class="message-text">{{ message.content }}</div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <van-field
                v-model="chatInput"
                placeholder="输入消息..."
                right-icon="send"
                @click-right-icon="sendChatMessage"
              />
            </div>
          </div>
        </van-tab>
        <van-tab title="AI辅助">
          <div class="ai-assist-section">
            <div class="ai-controls">
              <van-cell-group inset>
                <van-cell title="AI辅助开关">
                  <template #right-icon>
                    <van-switch v-model="aiAnalysis.enabled" size="24px" @change="toggleAiAssist" />
                  </template>
                </van-cell>
                <van-cell title="实时分析">
                  <template #right-icon>
                    <van-switch v-model="aiAnalysis.realTime" size="24px" />
                  </template>
                </van-cell>
                <van-cell title="建议强度">
                  <template #right-icon>
                    <van-slider v-model="aiAnalysis.adviceStrength" min="1" max="5" step="1" />
                  </template>
                </van-cell>
              </van-cell-group>
              <van-button
                type="primary"
                block
                @click="requestAiAnalysis"
                :loading="aiAnalysis.loading"
                style="margin-top: 10px;"
              >
                请求AI分析
              </van-button>
            </div>
            <div v-if="aiAnalysis.show" class="ai-analysis">
              <div class="analysis-card">
                <div class="card-title">当前手牌分析</div>
                <div class="card-content">
                  <div class="analysis-item">
                    <span class="item-label">手牌组合：</span>
                    <span class="item-value">{{ aiAnalysis.handCombination }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">手牌强度：</span>
                    <span class="item-value">{{ aiAnalysis.handStrength }}</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">获胜概率：</span>
                    <span class="item-value">{{ aiAnalysis.winProbability }}%</span>
                  </div>
                  <div class="analysis-item">
                    <span class="item-label">推荐操作：</span>
                    <span class="item-value">{{ aiAnalysis.recommendedAction }}</span>
                  </div>
                  <div v-if="aiAnalysis.explanation" class="analysis-explanation">
                    <span class="explanation-label">分析说明：</span>
                    <span class="explanation-text">{{ aiAnalysis.explanation }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import gameApi from '../api/game';
import { showToast, showConfirmDialog } from 'vant';
import { getCurrentUser } from '../store/user';

// 路由和参数
const router = useRouter();
const route = useRoute();
const roomId = route.params.id;

// 当前用户信息
const currentUser = getCurrentUser();
const currentUserId = currentUser?.id;

// 游戏状态
const gameState = reactive({
  statusText: '等待开始',
  currentRound: '翻牌前',
  currentPlayer: '',
  pot: 0,
  smallBlind: 10,
  bigBlind: 20,
  communityCards: [
    { suit: 'S', value: 'A', revealed: false },
    { suit: 'H', value: 'K', revealed: false },
    { suit: 'D', value: 'Q', revealed: false },
    { suit: 'C', value: 'J', revealed: false },
    { suit: 'S', value: '10', revealed: false }
  ]
});

// 玩家座位（模拟数据，实际应该从服务器获取）
const playerSeats = reactive([
  // 座位0-8，按照德州扑克顺时针座位排列
  { index: 0, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 1, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 2, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 3, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 4, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 5, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 6, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 7, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { index: 8, player: null, isActive: false, isCurrentPlayer: false, isDealer: false, isSmallBlind: false, isBigBlind: false }
]);

// 当前玩家手牌
const playerCards = reactive([
  { suit: 'S', value: 'A' },
  { suit: 'H', value: 'A' }
]);

// AI分析结果
const aiAnalysis = reactive({
  enabled: true,
  realTime: true,
  show: false,
  loading: false,
  handCombination: '一对A',
  handStrength: '极强',
  winProbability: 95,
  recommendedAction: '加注',
  explanation: '当前手牌为一对A，是德州扑克中最强的起手牌之一，建议进行加注以扩大底池。',
  adviceStrength: 3
});

// 聊天功能
const chatMessages = ref([]);
const chatInput = ref('');
const activeTab = ref(0);

// 下注相关
const betAmount = ref(0);
const minBet = computed(() => gameState.bigBlind);
const maxBet = computed(() => currentUser?.stack || 1000);

// 计算属性
const canCheck = computed(() => betAmount.value === 0);
const canCheckOrCall = computed(() => true); // 实际应该根据游戏状态判断
const canRaise = computed(() => betAmount.value > minBet.value && betAmount.value <= maxBet.value);

// 获取扑克牌花色符号
const getSuitSymbol = (suit) => {
  const symbols = {
    'S': '♠',
    'H': '♥',
    'D': '♦',
    'C': '♣'
  };
  return symbols[suit] || suit;
};

// 下注金额变化处理
const onBetChange = (value) => {
  // 这里可以添加下注金额变化时的逻辑
};

// 设置下注金额
const setBetAmount = (amount) => {
  betAmount.value = Math.min(Math.max(amount, minBet.value), maxBet.value);
};

// 弃牌
const fold = async () => {
  try {
    await gameApi.action(roomId, 'fold');
    // 更新游戏状态
  } catch (error) {
    console.error('弃牌失败:', error);
    showToast('弃牌失败');
  }
};

// 过牌或跟注
const checkOrCall = async () => {
  const action = canCheck.value ? 'check' : 'call';
  try {
    await gameApi.action(roomId, action);
    // 更新游戏状态
  } catch (error) {
    console.error(action + '失败:', error);
    showToast(action + '失败');
  }
};

// 加注
const raise = async () => {
  if (betAmount.value <= minBet.value) {
    showToast('加注金额必须大于跟注金额');
    return;
  }
  
  try {
    await gameApi.action(roomId, 'raise', { amount: betAmount.value });
    // 更新游戏状态
  } catch (error) {
    console.error('加注失败:', error);
    showToast('加注失败');
  }
};

// 发送聊天消息
const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return;
  
  const message = {
    senderId: currentUserId,
    username: currentUser.username,
    content: chatInput.value.trim(),
    timestamp: new Date().toISOString()
  };
  
  // 先添加到本地
  chatMessages.value.push(message);
  chatInput.value = '';
  
  try {
    // 发送到服务器
    await gameApi.sendMessage(roomId, message.content);
  } catch (error) {
    console.error('发送消息失败:', error);
    // 可以选择从本地移除失败的消息
    chatMessages.value.pop();
    showToast('发送消息失败');
  }
};

// 切换AI辅助
const toggleAiAssist = () => {
  if (aiAnalysis.enabled && aiAnalysis.realTime) {
    requestAiAnalysis();
  } else {
    aiAnalysis.show = false;
  }
};

// 请求AI分析
const requestAiAnalysis = async () => {
  if (!aiAnalysis.enabled) return;
  
  aiAnalysis.loading = true;
  try {
    // 调用API获取AI分析结果
    const response = await gameApi.requestAiAnalysis(roomId, playerCards, gameState.communityCards);
    
    // 更新分析结果
    if (response && response.analysis) {
      Object.assign(aiAnalysis, {
        show: true,
        handCombination: response.analysis.handCombination,
        handStrength: response.analysis.handStrength,
        winProbability: response.analysis.winProbability,
        recommendedAction: response.analysis.recommendedAction,
        explanation: response.analysis.explanation
      });
    } else {
      // 默认分析结果（当API不可用时）
      aiAnalysis.show = true;
      aiAnalysis.handCombination = '一对A';
      aiAnalysis.handStrength = '极强';
      aiAnalysis.winProbability = 95;
      aiAnalysis.recommendedAction = '加注';
      aiAnalysis.explanation = '当前手牌为一对A，是德州扑克中最强的起手牌之一，建议进行加注以扩大底池。';
    }
  } catch (error) {
    console.error('AI分析请求失败:', error);
    showToast('AI分析请求失败');
    
    // 失败时显示默认分析结果
    aiAnalysis.show = true;
    aiAnalysis.handCombination = '一对A';
    aiAnalysis.handStrength = '极强';
    aiAnalysis.winProbability = 95;
    aiAnalysis.recommendedAction = '加注';
    aiAnalysis.explanation = '当前手牌为一对A，是德州扑克中最强的起手牌之一，建议进行加注以扩大底池。';
  } finally {
    aiAnalysis.loading = false;
  }
};

// 初始化游戏
const initGame = async () => {
  try {
    const response = await gameApi.getGameState(roomId);
    if (response && response.gameState) {
      // 更新游戏状态
      Object.assign(gameState, response.gameState);
      
      // 更新玩家座位
      // ...
      
      // 如果AI辅助启用且实时分析开启，请求AI分析
      if (aiAnalysis.enabled && aiAnalysis.realTime) {
        requestAiAnalysis();
      }
    }
  } catch (error) {
    console.error('初始化游戏失败:', error);
    showToast('初始化游戏失败');
    router.push(`/room/${roomId}`);
  }
};

// 监听游戏状态变化
const listenGameUpdates = () => {
  // 实际项目中应该使用WebSocket监听游戏状态变化
  // 这里使用定时器模拟游戏状态更新
  const interval = setInterval(() => {
    // 模拟游戏状态更新
  }, 2000);
  
  return () => clearInterval(interval);
};

// 监听实时分析开关变化
watch(
  () => aiAnalysis.realTime,
  (newValue) => {
    if (newValue && aiAnalysis.enabled) {
      requestAiAnalysis();
    }
  }
);

// 监听公共牌变化
watch(
  () => gameState.communityCards,
  (newValue, oldValue) => {
    // 检查是否有牌被翻开
    const hasNewCardRevealed = newValue.some((card, index) => 
      card.revealed && (!oldValue[index] || !oldValue[index].revealed)
    );
    
    if (hasNewCardRevealed && aiAnalysis.enabled && aiAnalysis.realTime) {
      requestAiAnalysis();
    }
  },
  { deep: true }
);

// 组件挂载
onMounted(() => {
  initGame();
  const cleanup = listenGameUpdates();
  
  return () => {
    cleanup();
  };
});
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background-color: #1a5319;
  color: white;
  display: flex;
  flex-direction: column;
}

/* 顶部状态栏 */
.top-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.3);
}

.game-status {
  display: flex;
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.status-item .label {
  margin-right: 5px;
  opacity: 0.8;
}

.status-item .value {
  font-weight: 500;
}

.pot-info {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.pot-info .label {
  margin-right: 5px;
  opacity: 0.8;
}

.pot-info .value {
  font-weight: bold;
  color: #ffd700;
}

/* 游戏桌区域 */
.game-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 玩家座位 */
.player-seats {
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 20px;
}

.player-seat {
  position: absolute;
  width: 100px;
  height: 80px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 480px) {
  /* 玩家座位区域 */
  .player-seats {
    width: 250px;
    height: 250px;
  }
  
  /* 玩家座位 */
  .player-seat {
    width: 80px;
    height: 60px;
  }
  
  /* 座位位置调整 */
  .player-seat:nth-child(1) { top: -15px; left: 85px; }
  .player-seat:nth-child(2) { top: 15px; right: -15px; }
  .player-seat:nth-child(3) { bottom: 15px; right: -15px; }
  .player-seat:nth-child(4) { bottom: -15px; left: 85px; }
  .player-seat:nth-child(5) { bottom: 15px; left: -15px; }
  .player-seat:nth-child(6) { top: 15px; left: -15px; }
  
  /* 玩家信息 */
  .player-avatar img {
    width: 30px !important;
    height: 30px !important;
  }
  
  .player-name {
    font-size: 10px;
  }
  
  .player-stack, .player-bet {
    font-size: 9px;
  }
  
  /* 扑克牌 */
  .card {
    width: 40px;
    height: 56px;
  }
  
  .card-content {
    font-size: 14px;
  }
  
  .card-suit {
    font-size: 20px;
  }
  
  /* AI分析结果 */
  .ai-analysis-result {
    width: 160px;
    padding: 8px;
  }
  
  .analysis-content {
    font-size: 10px;
  }
  
  /* 游戏控制区域 */
  .game-controls {
    padding: 10px;
  }
  
  /* 操作按钮 */
  .action-buttons button {
    padding: 10px 0;
  }
  
  /* 聊天区域 */
  .chat-section {
    height: 180px;
  }
  
  .message-content {
    max-width: 85%;
  }
}

.player-seat.active {
  background-color: rgba(25, 137, 250, 0.4);
}

.player-seat.current-player {
  background-color: rgba(7, 193, 96, 0.4);
  border: 2px solid #07c160;
}

/* 座位位置（德州扑克圆形桌布局） */
.player-seat:nth-child(1) { top: -20px; left: 100px; }
.player-seat:nth-child(2) { top: 20px; right: -20px; }
.player-seat:nth-child(3) { bottom: 20px; right: -20px; }
.player-seat:nth-child(4) { bottom: -20px; left: 100px; }
.player-seat:nth-child(5) { bottom: 20px; left: -20px; }
.player-seat:nth-child(6) { top: 20px; left: -20px; }

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 5px;
}

.player-avatar {
  margin-bottom: 5px;
}

.player-name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.player-stack {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stack-value {
  font-weight: bold;
  color: #ffd700;
}

.stack-label {
  opacity: 0.7;
}

.player-bet {
  font-size: 11px;
  margin-top: 2px;
  padding: 2px 6px;
  background-color: rgba(255, 215, 0, 0.3);
  border-radius: 10px;
}

.bet-value {
  font-weight: bold;
  color: #ffd700;
}

.bet-label {
  opacity: 0.7;
}

.dealer-badge {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 20px;
  height: 20px;
  background-color: #ffd700;
  color: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.blind-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.blind-badge.small {
  background-color: #1989fa;
}

.blind-badge.big {
  background-color: #ee0a24;
}

/* 公共牌区域 */
.community-cards {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.card {
  width: 50px;
  height: 70px;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
}

.card.hidden {
  background-color: #8b4513;
  background-image: linear-gradient(45deg, #a0522d 25%, transparent 25%, transparent 75%, #a0522d 75%, #a0522d),
                    linear-gradient(-45deg, #a0522d 25%, transparent 25%, transparent 75%, #a0522d 75%, #a0522d);
  background-size: 20px 20px;
}

.card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.card-suit {
  font-size: 24px;
  margin-bottom: 5px;
}

.card-suit.spades {
  color: black;
}

.card-suit.hearts {
  color: #ee0a24;
}

.card-suit.diamonds {
  color: #ee0a24;
}

.card-suit.clubs {
  color: black;
}

/* 底池显示 */
.pot-display {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pot-label {
  font-size: 12px;
  opacity: 0.8;
}

.pot-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
}

/* 当前玩家手牌 */
.player-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.cards-title {
  font-size: 14px;
  margin-bottom: 10px;
  opacity: 0.8;
}

.cards-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.player-card {
  width: 60px;
  height: 84px;
}

/* AI分析结果 */
.ai-analysis-result {
  background-color: rgba(25, 137, 250, 0.2);
  padding: 10px;
  border-radius: 8px;
  width: 200px;
  text-align: center;
}

.analysis-title {
  font-size: 12px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.analysis-content {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.analysis-content .label {
  opacity: 0.8;
  margin-right: 5px;
}

.analysis-content .value {
  font-weight: 500;
}

/* 游戏控制区域 */
.game-controls {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

/* 下注控制 */
.bet-controls {
  margin-bottom: 15px;
}

.bet-slider {
  margin-bottom: 10px;
}

.bet-amount-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}

.bet-amount-display .label {
  margin-right: 5px;
  opacity: 0.8;
}

.bet-amount-display .value {
  font-weight: bold;
  color: #ffd700;
}

.bet-quick-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 底部功能栏 */
.bottom-bar {
  background-color: white;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

/* 聊天区域 */
.chat-section {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-message {
  margin-bottom: 10px;
}

.chat-message.own-message .message-content {
  text-align: right;
}

.message-content {
  max-width: 70%;
}

.own-message .message-content {
  margin-left: auto;
}

.message-sender {
  font-size: 12px;
  color: #969799;
  margin-bottom: 2px;
}

.message-text {
  background-color: #f2f3f5;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  word-wrap: break-word;
}

.own-message .message-text {
  background-color: #1989fa;
  color: white;
}

.chat-input {
  border-top: 1px solid #ebedf0;
  padding: 10px;
}

/* AI辅助区域 */
.ai-assist-section {
  padding: 10px;
}

.ai-controls {
  margin-bottom: 15px;
}

.analysis-card {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 15px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #323233;
}

.card-content {
  font-size: 12px;
  color: #646566;
}

.analysis-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.item-label {
  width: 80px;
  opacity: 0.8;
}

.item-value {
  flex: 1;
  font-weight: 500;
  color: #323233;
}

.analysis-explanation {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebedf0;
}

.explanation-label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #323233;
}

.explanation-text {
  font-size: 11px;
  line-height: 1.4;
  color: #646566;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .game-status {
    gap: 10px;
  }
  
  .status-item {
    font-size: 12px;
  }
  
  .player-seats {
    width: 250px;
    height: 250px;
  }
  
  .player-seat {
    width: 80px;
    height: 60px;
  }
  
  .player-name {
    font-size: 10px;
  }
  
  .player-stack {
    font-size: 10px;
  }
  
  .card {
    width: 45px;
    height: 63px;
  }
  
  .player-card {
    width: 55px;
    height: 77px;
  }
}
</style>