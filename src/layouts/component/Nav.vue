<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ToTopButton from '@/components/ToTopButton.vue'
import BackButton from '@/components/BackButton.vue'
import ThemeButton from '@/components/ThemeButton.vue'

const route = useRoute()

const routeLabel: Record<string, string> = {
  dashboard: '仪表盘',
  timeline: '时间线',
  items: '内容库',
  item: '详情',
  settings: '设置',
}

const time = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    time.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})



const breadcrumbs = computed(() => {
  const crumbs: { label: string; path?: string }[] = []
  const matched = route.matched.filter((r) => r.name)

  for (let i = 0; i < matched.length; i++) {
    const r = matched[i]
    const isLast = i === matched.length - 1
    crumbs.push({
      label: (r.meta.title as string) || routeLabel[String(r.name)] || String(r.name),
      path: isLast ? undefined : r.path,
    })
  }

  return crumbs
})
</script>

<template>
  <div class="nav">
    <div class="inner">
      <n-breadcrumb class="breadcrumb">
        <n-breadcrumb-item v-for="item in breadcrumbs" :key="item.label" :href="item.path">
          {{ item.label }}
        </n-breadcrumb-item>
      </n-breadcrumb>
      <div class="dock">
        <n-time :time="time" format="yyyy/MM/dd HH:mm" />
        <BackButton />
        <ToTopButton />
        <ThemeButton />
      </div>
    </div>

  </div>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-ui);
  height: 60px;
  padding: 2px 24px;
  /* display: flex; */
  align-items: center;
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}



.breadcrumb {
  flex: 1;
}

.dock {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
