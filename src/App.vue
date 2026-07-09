<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { darkTheme } from 'naive-ui'
import { useUiStore } from '@/stores/ui'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const ui = useUiStore()

const useLayout = computed(
  () => route.meta.requiresAuth || route.path === '/',
)

const naiveTheme = computed(() => (ui.isDark ? darkTheme : null))
</script>

<template>
  <n-config-provider :theme="naiveTheme">
    <n-message-provider>
      <DefaultLayout v-if="useLayout">
        <router-view />
      </DefaultLayout>
      <router-view v-else />
    </n-message-provider>
  </n-config-provider>
</template>
