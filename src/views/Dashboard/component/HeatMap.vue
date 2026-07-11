<template>
  <n-flex vertical>
    <n-alert type="success" title="数据统计">
      <n-flex>
        <n-tag round type="info">
          总天数: {{ dataStats.total }}
        </n-tag>
        <n-tag round type="warning">
          空白天: {{ dataStats.zeros }} ({{ dataStats.zeroPercent }}%)
        </n-tag>
        <n-tag round type="success">
          最大值: {{ dataStats.maxValue }}
        </n-tag>
        <n-tag round type="primary">
          平均值: {{ dataStats.avgValue }}
        </n-tag>
      </n-flex>
    </n-alert>
    <n-flex justify="space-around">
      <n-heatmap :data="yearData" :loading-data="yearData" :first-day-of-week="firstDayOfWeek" size="large"
        :show-week-labels="showWeekLabels" :show-month-labels="showMonthLabels"
        :show-color-indicator="showColorIndicator" color-theme="purple" />
      <n-date-picker v-model:value="selectedYear" type="year" clearable />
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import type { HeatmapFirstDayOfWeek } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { getHeatmap, type HeatmapEntry } from '@/api/heatmap'

const currentYear = new Date().getFullYear()
const selectedYear = ref<number | null>(new Date(currentYear, 0, 1).getTime())

const loading = ref(false)
const rawEntries = ref<HeatmapEntry[]>([])

async function fetchHeatmap(year: number) {
  loading.value = true
  try {
    const data = await getHeatmap(year)
    rawEntries.value = data
  } finally {
    loading.value = false
  }
}

const yearData = computed(() => {
  return rawEntries.value.map((entry) => ({
    timestamp: new Date(entry.date).getTime(),
    value: entry.count,
  }))
})

// 初始加载当前年份
fetchHeatmap(currentYear)

// 年份切换时重新请求
watch(selectedYear, (ts) => {
  if (ts) {
    const year = new Date(ts).getFullYear()
    fetchHeatmap(year)
  }
})

const dataStats = computed(() => {
  const data = yearData.value
  const total = data.length
  const zeros = data.filter(d => d.value === 0).length
  const maxValue = Math.max(...data.map(d => d.value ?? 0))
  const avgValue
    = Math.round(
      (data.reduce((sum, d) => sum + (d.value ?? 0), 0) / total) * 100
    ) / 100

  return {
    total,
    zeros,
    maxValue,
    avgValue,
    zeroPercent: Math.round((zeros / total) * 100)
  }
})

const showWeekLabels = ref(true)
const showMonthLabels = ref(true)
const showColorIndicator = ref(true)
const firstDayOfWeek = ref<HeatmapFirstDayOfWeek>(0)

</script>
