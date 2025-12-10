<template>
  <div class="login">
    <div class="login-container">
      <div class="login-header">
        <h2 class="login-title">德州扑克</h2>
        <p class="login-subtitle">请登录你的账号</p>
      </div>

      <div class="login-form">
        <!-- 用户名/邮箱/手机号输入框 -->
        <van-cell-group inset>
          <van-field
            v-model="loginForm.username"
            name="username"
            label="账号"
            placeholder="请输入用户名、邮箱或手机号"
            left-icon="contact"
            :rules="[{ required: true, message: '请输入账号' }]"
          />
          <van-field
            v-model="loginForm.password"
            name="password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            left-icon="locked"
            :rules="[{ required: true, message: '请输入密码' }]"
            :show-password="showPassword"
            right-icon="eye-o"
            @click-right-icon="showPassword = !showPassword"
          />
        </van-cell-group>

        <!-- 登录按钮 -->
        <van-button
          type="primary"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </van-button>

        <!-- 注册链接 -->
        <div class="login-register">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import userApi from '../api/user';
import { showToast } from 'vant';

// 路由实例
const router = useRouter();
// 用户状态管理
const userStore = useUserStore();

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 显示密码状态
const showPassword = ref(false);
// 加载状态
const loading = ref(false);

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    if (!loginForm.username.trim()) {
      showToast('请输入账号');
      return;
    }
    if (!loginForm.password.trim()) {
      showToast('请输入密码');
      return;
    }

    // 设置加载状态
    loading.value = true;

    // 调用登录API
    const response = await userApi.login(loginForm);

    // 登录成功
    if (response && response.user && response.token) {
      // 保存用户信息和token
      userStore.login(response.user, response.token);
      // 显示成功提示
      showToast('登录成功');
      // 跳转到首页
      router.push('/');
    } else {
      showToast('登录失败，请检查账号密码');
    }
  } catch (error) {
    console.error('登录失败:', error);
    showToast('登录失败，请稍后重试');
  } finally {
    // 重置加载状态
    loading.value = false;
  }
};
</script>

<style scoped>
.login {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.login-register {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-register a {
  color: #1989fa;
  text-decoration: none;
}

.login-register a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login {
    padding: 20px 15px;
  }
  
  .login-container {
    padding: 20px;
  }
  
  .login-header {
    margin-bottom: 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-subtitle {
    font-size: 13px;
  }
  
  .login-btn {
    margin-top: 15px;
    height: 40px;
    font-size: 15px;
  }
  
  .login-register {
    margin-top: 15px;
    font-size: 13px;
  }
}
</style>