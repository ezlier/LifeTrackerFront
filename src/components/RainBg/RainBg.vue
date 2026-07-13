<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import bg from '@/assets/img/bg.png'

interface Props {
  /** 雨滴密度，建议范围 0-10。 */
  rainLimit?: number
  /** 雨滴高光亮度偏移；0 表示默认亮度。 */
  brightness?: number
  /** 背景层层级。 */
  zIndex?: number
}

interface Drop {
  x: number
  y: number
  width: number
  speed: number
  length: number
  opacity: number
  wind: number
}

const props = withDefaults(defineProps<Props>(), {
  rainLimit: 6,
  brightness: 0,
  zIndex: -1,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const layerStyle = computed(() => ({
  zIndex: props.zIndex,
  backgroundImage: `url("${bg}")`,
}))

let context: CanvasRenderingContext2D | null = null
let animationFrame = 0
let previousTime = 0
let drops: Drop[] = []
let reducedMotion: MediaQueryList | null = null

const random = (min: number, max: number) => min + Math.random() * (max - min)

function createDrop(canvas: HTMLCanvasElement, initial = false): Drop {
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  return {
    x: random(0, canvas.width),
    y: initial ? random(0, canvas.height) : random(-160 * scale, -20 * scale),
    width: random(0.45, 1.15) * scale,
    speed: random(520, 1050) * scale,
    length: random(20, 72) * scale,
    opacity: random(0.08, 0.38),
    wind: random(-42, -12) * scale,
  }
}

function resetDrops() {
  const canvas = canvasRef.value
  if (!canvas) return
  const density = Math.min(10, Math.max(0, props.rainLimit))
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssArea = (canvas.width * canvas.height) / (dpr * dpr)
  const count = Math.round((cssArea / 82_000) * density)
  drops = Array.from({ length: count }, () => createDrop(canvas, true))
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
  context = canvas.getContext('2d')
  resetDrops()
}

function drawDrop(ctx: CanvasRenderingContext2D, drop: Drop) {
  const light = Math.min(2, Math.max(0.15, 1 + props.brightness))
  const alpha = Math.min(0.8, drop.opacity * light)
  const slant = drop.length * (drop.wind / drop.speed)
  const startX = drop.x - slant
  const startY = drop.y - drop.length
  const rain = ctx.createLinearGradient(startX, startY, drop.x, drop.y)
  rain.addColorStop(0, 'rgba(210, 230, 245, 0)')
  rain.addColorStop(0.35, `rgba(205, 225, 240, ${alpha * 0.45})`)
  rain.addColorStop(1, `rgba(235, 245, 255, ${alpha})`)

  ctx.strokeStyle = rain
  ctx.lineWidth = drop.width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(drop.x, drop.y)
  ctx.stroke()
}

function drawFrame(time: number) {
  const canvas = canvasRef.value
  const ctx = context
  if (!canvas || !ctx) return

  const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0
  previousTime = time
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const drop of drops) {
    if (!reducedMotion?.matches) {
      drop.y += drop.speed * delta
      drop.x += drop.wind * delta
    }
    drawDrop(ctx, drop)
    if (drop.y - drop.length > canvas.height || drop.x < -80 || drop.x > canvas.width + 80) {
      Object.assign(drop, createDrop(canvas))
    }
  }

  animationFrame = requestAnimationFrame(drawFrame)
}

watch(() => props.rainLimit, resetDrops)

onMounted(() => {
  document.querySelector('#app')?.classList.add('rain-background-host')
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
  animationFrame = requestAnimationFrame(drawFrame)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
  document.querySelector('#app')?.classList.remove('rain-background-host')
})
</script>

<template>
  <canvas ref="canvasRef" class="rain-background" :style="layerStyle" aria-hidden="true" />
</template>

<style scoped>
.rain-background {
  position: fixed;
  inset: 0;
  display: block;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  pointer-events: none;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

:global(#app.rain-background-host) {
  position: relative;
  isolation: isolate;
}
</style>
