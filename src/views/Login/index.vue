<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { signupApi } from '@/api/auth'

const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const pending = ref(false)
const isLogin = ref(true)
const successMsg = ref('')

function toggleMode() {
  isLogin.value = !isLogin.value
  auth.error = null
  successMsg.value = ''
  form.username = ''
  form.password = ''
}

async function handleSubmit() {
  if (!form.username || !form.password) return
  pending.value = true
  auth.error = null
  successMsg.value = ''

  try {
    if (isLogin.value) {
      await auth.login(form)
    } else {
      await signupApi({ username: form.username, password: form.password })
      successMsg.value = '注册成功，请登录'
      form.password = ''
      isLogin.value = true
    }
  } catch (e: unknown) {
    if (!isLogin.value) {
      const msg = e instanceof Error ? e.message : '注册失败'
      auth.error = msg
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-wrapper">
      <!-- Header -->
      <div class="login-header">
        <h1>lifeTrackr</h1>
        <p>{{ isLogin ? '登录以继续' : '创建新账号' }}</p>
      </div>

      <!-- Card -->
      <n-card class="login-card" :bordered="true">
        <n-alert
          v-if="auth.error"
          type="error"
          closable
          class="mb-4"
          @close="auth.error = null"
        >
          {{ auth.error }}
        </n-alert>

        <n-alert
          v-if="successMsg"
          type="success"
          closable
          class="mb-4"
          @close="successMsg = ''"
        >
          {{ successMsg }}
        </n-alert>

        <n-input
          v-model:value="form.username"
          placeholder="用户名"
          size="large"
          class="mb-3"
          @keyup.enter="handleSubmit"
        />

        <n-input
          v-model:value="form.password"
          type="password"
          placeholder="密码"
          size="large"
          show-password-on="click"
          class="mb-4"
          @keyup.enter="handleSubmit"
        />

        <n-button
          type="primary"
          size="large"
          :loading="pending"
          block
          @click="handleSubmit"
        >
          {{ isLogin ? '登录' : '注册' }}
        </n-button>

        <div class="login-toggle">
          <n-button text type="primary" @click="toggleMode">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #eef2ff, #fff, #f0f9ff);
  padding: 16px;
}

.login-wrapper {
  width: 100%;
  max-width: 360px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text);
  margin: 0 0 4px;
}

.login-header p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.login-card {
  border-radius: 12px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.login-toggle {
  text-align: center;
  margin-top: 12px;
}
</style>
