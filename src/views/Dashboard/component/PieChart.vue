<script setup lang="ts">
import TypePieChart from './TypePieChart.vue'
import { ref, onMounted } from 'vue'
import { getTypePieChartData, getStatusPieChartData } from '@/api/heatmap'

const loading = ref(false)
const typeEntries = ref<{ name: string; value: number }[]>([])
const statusEntries = ref<{ name: string; value: number }[]>([])

async function fetchPieChartData() {
  loading.value = true
  try {
    const data = await getTypePieChartData()
    typeEntries.value = Object.entries(data).map(([name, value]) => ({ name, value }))
    const statusData = await getStatusPieChartData()
    statusEntries.value = Object.entries(statusData).map(([name, value]) => ({ name, value }))
    loading.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPieChartData()
})
</script>

<template>
  <div class="pie-chart">
    <n-flex justify="space-around" size="large">
      <TypePieChart :list="typeEntries" title="类型摘要" />
      <TypePieChart :list="statusEntries" title="状态摘要" />
    </n-flex>
  </div>
</template>

<style scoped>
.pie-chart {
  width: 100%;
}
</style>
