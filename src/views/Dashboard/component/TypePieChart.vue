<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

const props = defineProps<{
  list: { name: string; value: number }[]
  title: string
}>()

// 注册模块
echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

const pieDom = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

// 饼图配置项（响应式）
const option = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: '{b}: {c}，占比 {d}%',
  },
  legend: {
    bottom: 10,
    left: 'center',
  },
  series: [
    {
      name: '数量',
      type: 'pie' as const,
      radius: '55%',
      center: ['50%', '50%'],
      data: props.list.map((e) => ({
        name: e.name,
        value: e.value,
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      },
    },
  ],
}))

// 初始化图表
function initChart() {
  if (!pieDom.value) return
  myChart = echarts.init(pieDom.value)
  myChart.setOption(option.value)
}

// 窗口自适应
function resizeHandle() {
  myChart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeHandle)
})

// 数据变化时更新图表
watch(option, (val) => {
  myChart?.setOption(val)
})

watch(() => props.list, () => {
  myChart?.setOption(option.value)
}, { deep: true })

// 页面销毁释放资源
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandle)
  myChart?.dispose()
})
</script>

<template>
  <div ref="pieDom" style="width: 400px; height: 400px;"></div>
</template>
