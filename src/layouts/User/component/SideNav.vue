<template>
  <div class="sidenav">
    <div class="sidenav-content">
      <div class="sidenav-menu">
        <div class="brand">🖊 LifeTracker</div>
        <span class="brand">//记录你的生活</span>

        <n-divider class="divider" />

        <div class="navigation">
          <span class="nav-label">- NAVIGATION -</span>
          <div v-for="item in navItems" :key="item.to" class="menu-item" :class="{ active: isActive(item.to) }">
            <RouterLink :to="item.to">{{ item.label }}</RouterLink>
          </div>
        </div>

      </div>

      <!-- 用户信息 -->
      <div class="sidenav-user">
        <n-divider class="divider" />

        <div class="user-info">
          <n-avatar size="large" :src="user?.avatar || ''" :alt="user?.name || '未登录用户'"  />
          <span class="username">{{ user?.name || '未登录用户' }}</span>
        </div>

        <n-button text size="small" type="error" @click="handleLogout">
          退出登录
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUser, type User } from '@/api/user'

const route = useRoute()
const authStore = useAuthStore()

const displayName = computed(() => authStore.username || '未登录用户')
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase())

const navItems = [
  { label: '仪表盘', to: '/dashboard' },
  { label: '内容库', to: '/items' },
  { label: '时间线', to: '/timeline' },
  { label: '番茄钟', to: '/focus' },
  { label: '关于', to: '/settings' },
]

type UserProfile = User & { introduction?: string | null }

const user = ref<UserProfile>()
const userLoading = ref(false)
const userError = ref('')

function isActive(to: string) {
  if (to === '/items') return route.path.startsWith('/items')
  return route.path === '/'
    ? to === '/dashboard'
    : route.path === to
}

function handleLogout() {
  authStore.logout()
}

async function loadUser() {
  userLoading.value = true
  userError.value = ''
  try {
    user.value = await getUser()
  } catch (error) {
    userError.value = error instanceof Error ? error.message : '用户资料加载失败'
  } finally {
    userLoading.value = false
  }
}

onMounted(() => loadUser())
</script>

<style scoped>
.sidenav {
  display: flex;
  flex-direction: column;
  border-right: 2px solid var(--color-sidebar-border);
  border-radius: var(--border-radius);
  background-color: var(--color-sidebar-bg);
  padding: 0 16px;
}

.sidenav-menu {
  width: 100%;
}

.sidenav-content {
  height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
}

.brand {
  padding: 20px 16px 12px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.3px;
}

.divider {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
}

.navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.menu-item {
  width: 100%;
  display: flex;
  justify-content: center;
  color: var(--color-sidebar-text);
}

.menu-item a {
  width: 100%;
  padding: 10px 16px;
  text-align: center;
  text-decoration: none;
  color: var(--color-sidebar-text);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: all 0.2s;
}

.menu-item.active a {
  color: var(--color-sidebar-text-active);
  border-color: #1e293b;
}

.sidenav-user {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 16px;
}

.user-info {
  background-color: var(--color-info);
  border-radius: var(--border-radius);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}



.username {
  font-size: 13px;
  color: var(--color-text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
