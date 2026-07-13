<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  createFocus,
  getRunningFocus,
  pauseFocus,
  resumeFocus,
  completeFocus,
  cancelFocus,
} from '@/api/focus'

// ==================== 共享状态 ====================
const currentTab = ref<'番茄钟' | '倒计时' | '正计时'>('番茄钟')
const goal = ref('')
const taskId = ref<number | null>(null)

// 计时运行/暂停状态
const clockActive = ref(false)
const clockPaused = ref(false)

// 是否有活跃任务（运行中或暂停中）
const hasActiveTask = computed(() => taskId.value !== null && (clockActive.value || clockPaused.value))

// 是否显示设定界面
const showSetup = computed(() => !hasActiveTask.value)

// 共用计时器
const remainingSeconds = ref(0) // 番茄钟 / 倒计时
const elapsedSeconds = ref(0)   // 正计时
let timerInterval: ReturnType<typeof setInterval> | null = null

// ==================== 番茄钟 ====================
type PomodoroPreset = '50/10' | '30/5' | 'custom'
type PomodoroPhase = 'work' | 'rest'

const pomodoroPreset = ref<PomodoroPreset>('50/10')
const pomodoroCustomWork = ref(25)
const pomodoroCustomRest = ref(5)
const pomodoroPhase = ref<PomodoroPhase>('work')
const pomodoroCurrentPhase = ref(1) // 1–4

const pomodoroWorkMinutes = computed(() => {
  switch (pomodoroPreset.value) {
    case '50/10':
      return 50
    case '30/5':
      return 30
    case 'custom':
      return pomodoroCustomWork.value
  }
})

const pomodoroRestMinutes = computed(() => {
  switch (pomodoroPreset.value) {
    case '50/10':
      return 10
    case '30/5':
      return 5
    case 'custom':
      return pomodoroCustomRest.value
  }
})

// API 需要的总时长（分）= 工作中长 * 4
const pomodoroPlannedMinutes = computed(() => pomodoroWorkMinutes.value * 4)

// 每个阶段秒数 = 总秒数 / 4
const pomodoroPhaseSeconds = computed(() => (pomodoroPlannedMinutes.value * 60) / 4)

const pomodoroPhaseLabel = computed(() =>
  pomodoroPhase.value === 'work' ? '工作中' : '休息中',
)

// ==================== 倒计时 ====================
const countdownHours = ref(0)
const countdownMinutes = ref(25)
const countdownSeconds_input = ref(0)
const countdownTotalSeconds = computed(
  () => countdownHours.value * 3600 + countdownMinutes.value * 60 + countdownSeconds_input.value,
)
const countdownPlannedMinutes = computed(() => Math.ceil(countdownTotalSeconds.value / 60))

// ==================== 显示 ====================
const timerDisplay = computed(() => {
  if (currentTab.value === '正计时') {
    const h = Math.floor(elapsedSeconds.value / 3600)
    const m = Math.floor((elapsedSeconds.value % 3600) / 60)
    const s = elapsedSeconds.value % 60
    if (h > 0)
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  // 番茄钟 / 倒计时
  const h = Math.floor(remainingSeconds.value / 3600)
  const m = Math.floor((remainingSeconds.value % 3600) / 60)
  const s = remainingSeconds.value % 60
  if (h > 0)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// ==================== Tab 切换 ====================
function handleTabClick(tab: '番茄钟' | '倒计时' | '正计时') {
  if (clockActive.value || clockPaused.value) return
  currentTab.value = tab
}

function selectPreset(preset: PomodoroPreset) {
  if (clockActive.value || clockPaused.value) return
  pomodoroPreset.value = preset
}

// ==================== 计时器控制 ====================
function beginInterval() {
  stopTimer()
  timerInterval = setInterval(() => {
    if (currentTab.value === '正计时') {
      elapsedSeconds.value++
    } else {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
      } else {
        onPhaseEnd()
      }
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// ==================== 开始 ====================
async function handleStart() {
  if (!goal.value.trim()) {
    alert('请输入专注目标')
    return
  }

  const mode = currentTab.value
  let plannedDuration: number | undefined

  if (mode === '番茄钟') {
    plannedDuration = pomodoroPlannedMinutes.value
  } else if (mode === '倒计时') {
    plannedDuration = countdownPlannedMinutes.value
    if (plannedDuration <= 0) return
  }
  // 正计时不传 plannedDuration

  try {
    const id = await createFocus({
      goal: goal.value.trim(),
      mode,
      plannedDuration,
    })
    taskId.value = id
    clockActive.value = true
    clockPaused.value = false

    if (mode === '番茄钟') {
      remainingSeconds.value = pomodoroPhaseSeconds.value
      pomodoroCurrentPhase.value = 1
      pomodoroPhase.value = 'work'
    } else if (mode === '倒计时') {
      remainingSeconds.value = countdownTotalSeconds.value
    } else {
      elapsedSeconds.value = 0
    }

    beginInterval()
  } catch (e) {
    console.error('开始专注失败:', e)
  }
}

// ==================== 暂停 ====================
async function handlePause() {
  if (!taskId.value) return
  try {
    await pauseFocus(taskId.value)
    clockActive.value = false
    clockPaused.value = true
    stopTimer()
  } catch (e) {
    console.error('暂停失败:', e)
  }
}

// ==================== 继续 ====================
async function handleResume() {
  if (!taskId.value) return
  try {
    await resumeFocus(taskId.value)
    clockActive.value = true
    clockPaused.value = false
    beginInterval()
  } catch (e) {
    console.error('恢复失败:', e)
  }
}

// ==================== 停止/取消 ====================
async function handleStop() {
  if (!taskId.value) return
  try {
    await cancelFocus(taskId.value)
    fullReset()
  } catch (e) {
    console.error('取消失败:', e)
  }
}

// ==================== 自动完成 ====================
async function handleComplete() {
  if (!taskId.value) return
  try {
    await completeFocus(taskId.value)
    fullReset()
  } catch (e) {
    console.error('完成失败:', e)
  }
}

// ==================== 阶段结束 ====================
function onPhaseEnd() {
  if (currentTab.value === '番茄钟') {
    if (pomodoroCurrentPhase.value >= 4) {
      stopTimer()
      handleComplete()
      return
    }
    pomodoroCurrentPhase.value++
    pomodoroPhase.value =
      pomodoroCurrentPhase.value % 2 === 1 ? 'work' : 'rest'
    remainingSeconds.value = pomodoroPhaseSeconds.value
    // 计时继续
  } else {
    // 倒计时归零 → 完成
    stopTimer()
    handleComplete()
  }
}

// ==================== 重置 ====================
function fullReset() {
  clockActive.value = false
  clockPaused.value = false
  taskId.value = null
  remainingSeconds.value = 0
  elapsedSeconds.value = 0
  pomodoroCurrentPhase.value = 1
  pomodoroPhase.value = 'work'
  stopTimer()
}

// ==================== 页面挂载：恢复未完成任务 ====================
onMounted(async () => {
  try {
    const { records } = await getRunningFocus()
    if (!records || records.length === 0) return

    const task = records[0]
    if (task.status !== 'running' && task.status !== 'paused') return

    // 恢复任务
    taskId.value = task.id
    goal.value = task.goal
    currentTab.value = task.mode as '番茄钟' | '倒计时' | '正计时'

    const nowSec = Math.floor(Date.now() / 1000)
    const startSec = Math.floor(new Date(task.startTime).getTime() / 1000)

    if (task.mode === '正计时') {
      if (task.status === 'running') {
        elapsedSeconds.value = task.actualDuration + (nowSec - startSec)
        clockActive.value = true
        beginInterval()
      } else {
        elapsedSeconds.value = task.actualDuration
        clockPaused.value = true
      }
      return
    }

    // 番茄钟 / 倒计时
    const plannedSec = task.plannedDuration * 60
    const totalElapsed =
      task.status === 'running'
        ? task.actualDuration + (nowSec - startSec)
        : task.actualDuration

    if (task.mode === '番茄钟') {
      const phaseSec = plannedSec / 4
      const completedPhases = Math.floor(totalElapsed / phaseSec)
      if (completedPhases >= 4) {
        // 理论上已跑完，兜底完成
        clockActive.value = true
        await handleComplete()
        return
      }
      pomodoroCurrentPhase.value = completedPhases + 1
      pomodoroPhase.value =
        pomodoroCurrentPhase.value % 2 === 1 ? 'work' : 'rest'
      remainingSeconds.value = phaseSec - (totalElapsed % phaseSec)
    } else {
      // 倒计时
      remainingSeconds.value = Math.max(0, plannedSec - totalElapsed)
    }

    if (task.status === 'running') {
      clockActive.value = true
      beginInterval()
    } else {
      clockPaused.value = true
      // 暂停时不 tick，但暂停期间的 elapsed 已计入 actualDuration
    }
  } catch (e) {
    console.error('恢复专注任务失败:', e)
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="container">
    <div class="clockCard">


      <!-- 番茄钟设定 -->
      <div v-if="currentTab === '番茄钟' && showSetup" class="clock_display">
        <div class="pomodoro-setup">
          <div class="preset-group">
            <button :class="['preset-btn', { active: pomodoroPreset === '50/10' }]" @click="selectPreset('50/10')">
              50 / 10
            </button>
            <button :class="['preset-btn', { active: pomodoroPreset === '30/5' }]" @click="selectPreset('30/5')">
              30 / 5
            </button>
            <button :class="['preset-btn', { active: pomodoroPreset === 'custom' }]" @click="selectPreset('custom')">
              自定义
            </button>
          </div>

          <div v-if="pomodoroPreset === 'custom'" class="custom-inputs">
            <div class="input-group">
              <input v-model.number="pomodoroCustomWork" type="number" min="1" max="120"
                class="time-input time-input-sm" />
              <span class="input-label">工作（分）</span>
            </div>
            <span class="custom-sep">/</span>
            <div class="input-group">
              <input v-model.number="pomodoroCustomRest" type="number" min="1" max="60"
                class="time-input time-input-sm" />
              <span class="input-label">休息（分）</span>
            </div>
          </div>

          <button class="btn btn-start" @click="handleStart">开始</button>
        </div>
      </div>

      <!-- 倒计时设定 -->
      <div v-else-if="currentTab === '倒计时' && showSetup" class="clock_display">
        <div class="time-setup">
          <div class="time-inputs">
            <div class="input-group">
              <input v-model.number="countdownHours" type="number" min="0" max="99" class="time-input" />
              <span class="input-label">时</span>
            </div>
            <span class="colon">:</span>
            <div class="input-group">
              <input v-model.number="countdownMinutes" type="number" min="0" max="59" class="time-input" />
              <span class="input-label">分</span>
            </div>
            <span class="colon">:</span>
            <div class="input-group">
              <input v-model.number="countdownSeconds_input" type="number" min="0" max="59" class="time-input" />
              <span class="input-label">秒</span>
            </div>
          </div>
          <button class="btn btn-start" @click="handleStart">开始</button>
        </div>
      </div>

      <!-- 正计时设定 / 开始 -->
      <div v-else-if="currentTab === '正计时' && showSetup" class="clock_display">
        <div class="timer-running">
          <span class="time-display">{{ timerDisplay }}</span>
          <button class="btn btn-start" @click="handleStart">开始</button>
        </div>
      </div>

      <!-- 运行/暂停中 -->
      <div v-else class="clock_display">
        <div class="timer-running">
          <!-- 番茄钟阶段标签 -->
          <span v-if="currentTab === '番茄钟'" class="phase-label">
            {{ pomodoroPhaseLabel }} ({{ pomodoroCurrentPhase }}/4)
          </span>
          <span class="time-display">{{ timerDisplay }}</span>
          <div class="btn-group">
            <button v-if="!clockActive" class="btn btn-start" @click="handleResume">
              继续
            </button>
            <button v-else class="btn btn-pause" @click="handlePause">暂停</button>
            <button class="btn btn-stop" @click="handleStop">停止</button>
          </div>
        </div>
      </div>
    </div>

    <div class="focusCard">
      <!-- 模式切换 -->
      <n-flex justify="space-around" size="large">
        <button :disabled="clockActive || clockPaused" :class="['tab-btn', { active: currentTab === '番茄钟' }]"
          @click="handleTabClick('番茄钟')">
          番茄钟
        </button>
        <button :disabled="clockActive || clockPaused" :class="['tab-btn', { active: currentTab === '倒计时' }]"
          @click="handleTabClick('倒计时')">
          倒计时
        </button>
        <button :disabled="clockActive || clockPaused" :class="['tab-btn', { active: currentTab === '正计时' }]"
          @click="handleTabClick('正计时')">
          正计时
        </button>
      </n-flex>

      <!-- Goal 输入 -->
      <div class="goal-input-row">
        <input v-model="goal" :disabled="clockActive || clockPaused" type="text" placeholder="输入专注目标…"
          class="goal-input" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  display: flex;
  gap: 16px;
}

.clockCard {
  flex: 1;
  width: 100%;
  background-color: var(--color-card-bg);
  border: 2px solid var(--color-card-border);
  height: 60dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
}

.clock_display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 24px;
}

.focusCard {
  flex: 0 0 40%;
  width: 100%;
  height: 60dvh;
}

/* ====== Tab 按钮 ====== */
.tab-btn {
  padding: 8px 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  color: #555;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
}

.tab-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.8);
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ====== Goal 输入 ====== */
.goal-input-row {
  width: 100%;
  margin-top: 16px;
}

.goal-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  color: #333;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.goal-input:focus {
  border-color: rgba(255, 255, 255, 0.9);
}

.goal-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ====== 番茄钟 ====== */
.pomodoro-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.preset-group {
  display: flex;
  gap: 10px;
}

.preset-btn {
  padding: 8px 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  color: #555;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn.active {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
}

.preset-btn:hover {
  border-color: rgba(255, 255, 255, 0.8);
}

.custom-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-sep {
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.3);
  margin-bottom: 12px;
}

.time-input-sm {
  width: 56px;
  height: 48px;
  font-size: 24px;
}

.phase-label {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* ====== 时间设定 ====== */
.time-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.time-input {
  width: 64px;
  height: 56px;
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.3);
  color: #333;
  outline: none;
  transition: border-color 0.2s;
}

.time-input:focus {
  border-color: rgba(255, 255, 255, 0.9);
}

.input-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.colon {
  font-size: 32px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.4);
  margin-bottom: 12px;
}

/* ====== 计时运行 ====== */
.timer-running {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.time-display {
  font-size: 64px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #333;
  letter-spacing: 2px;
}

.btn-group {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.85;
}

.btn-start {
  background: #4caf50;
  color: #fff;
}

.btn-pause {
  background: #ff9800;
  color: #fff;
}

.btn-stop {
  background: #f44336;
  color: #fff;
}
</style>
