<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: '用户管理', to: '/admin/users' },
  { label: '媒体管理', to: '/admin/items' },
  { label: '时间线管理', to: '/admin/timeline' },
  { label: '番茄钟管理', to: '/admin/focus' },
]

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-content">
        <div class="sidebar-menu">
          <div class="brand">Admin</div>
          <span class="sub">管理后台</span>

          <n-divider class="divider" />

          <div class="navigation">
            <span class="nav-label">- NAVIGATION -</span>
            <div
              v-for="item in navItems"
              :key="item.to"
              class="menu-item"
              :class="{ active: isActive(item.to) }"
            >
              <RouterLink :to="item.to">{{ item.label }}</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
}

.admin-sidebar {
  flex: 0 0 15%;
  display: flex;
  flex-direction: column;
  border-right: 2px solid var(--color-sidebar-border);
  border-radius: var(--border-radius);
  background-color: var(--color-sidebar-bg);
  padding: 0 16px;
  height: 100dvh;
}

.sidebar-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: sticky;
  top: 0;
  padding-top: 20px;
  height: 100%;
}

.sidebar-menu {
  width: 100%;
}

.brand {
  padding: 0 16px 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-sidebar-text-active);
  letter-spacing: -0.3px;
}

.sub {
  display: block;
  padding: 0 16px;
  font-size: 12px;
  color: var(--color-text-muted);
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

.admin-main {
  max-width: 1300px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-self: center;
  align-items: center;
}
</style>
