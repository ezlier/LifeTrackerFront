<template>
  <n-flex vertical>
    <n-flex align="center" justify="start">
      <n-switch v-model:value="showWeekLabels">
        <template #checked>
          显示周标签
        </template>
        <template #unchecked>
          隐藏周标签
        </template>
      </n-switch>
      <n-switch v-model:value="showMonthLabels">
        <template #checked>
          显示月份标签
        </template>
        <template #unchecked>
          隐藏月份标签
        </template>
      </n-switch>
      <n-switch v-model:value="showColorIndicator">
        <template #checked>
          显示颜色指示器
        </template>
        <template #unchecked>
          隐藏颜色指示器
        </template>
      </n-switch>
      <n-switch v-model:value="loading">
        <template #checked>
          加载中
        </template>
        <template #unchecked>
          正常显示
        </template>
      </n-switch>
      <n-divider vertical />
      <span>周开始日：</span>
      <n-select
        v-model:value="firstDayOfWeek"
        :options="weekStartOptions"
        style="width: 120px"
      />
      <n-divider vertical />
    </n-flex>
    <n-flex>
      <n-radio-group v-model:value="size" name="size">
        <n-radio-button
          v-for="option in sizeOptions"
          :key="option.value"
          :value="option.value"
          :label="option.label"
        />
      </n-radio-group>
      <n-divider vertical />
      <n-radio-group v-model:value="value" name="year">
        <n-radio-button
          v-for="range in dateRanges"
          :key="range.value"
          :value="range.value"
          :label="range.label"
        />
      </n-radio-group>
    </n-flex>
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
    <n-scrollbar x-scrollable style="max-width: 100%">
      <n-heatmap
        :data="yearData"
        :loading-data="yearData"
        :first-day-of-week="firstDayOfWeek"
        :loading="loading"
        :size="size"
        :show-week-labels="showWeekLabels"
        :show-month-labels="showMonthLabels"
        :show-color-indicator="showColorIndicator"
        :fill-calendar-leading="value === 'recent'"
      />
    </n-scrollbar>
  </n-flex>
</template>

<script setup lang="ts">
import type { HeatmapFirstDayOfWeek } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { getHeatmap, type HeatmapEntry } from '@/api/heatmap'

const value = ref<'recent' | number>(new Date().getFullYear())

const currentYear = new Date().getFullYear()
const dateRanges: { value: 'recent' | number; label: string }[] = (() => {
  const ranges: { value: 'recent' | number; label: string }[] = [
    { value: 'recent', label: '最近一年' },
  ]
  for (let y = currentYear; y >= currentYear - 3; y--) {
    ranges.push({ value: y, label: String(y) })
  }
  return ranges
})()

const rawEntries = ref<HeatmapEntry[]>([])

async function fetchHeatmap(year: number) {
  const data = await getHeatmap(year)
  rawEntries.value = data
}

const yearData = computed(() => {
  return rawEntries.value.map((entry) => ({
    timestamp: new Date(entry.date).getTime(),
    value: entry.count,
  }))
})

fetchHeatmap(value.value as number)

watch(value, (val) => {
  if (val !== 'recent') {
    fetchHeatmap(val)
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
const loading = ref(false)
const firstDayOfWeek = ref<HeatmapFirstDayOfWeek>(0)
const size = ref<'small' | 'medium' | 'large'>('medium')

const weekStartOptions = [
  { label: '周一', value: 0 },
  { label: '周二', value: 1 },
  { label: '周三', value: 2 },
  { label: '周四', value: 3 },
  { label: '周五', value: 4 },
  { label: '周六', value: 5 },
  { label: '周日', value: 6 }
]

const sizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]
</script>
