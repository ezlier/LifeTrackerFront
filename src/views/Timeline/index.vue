<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getTimelineEvents, type TimelineEventRecord, type TimelineEventQuery } from '@/api/timeline'
import { getTypePieChartData, type PieChartEntry } from '@/api/heatmap'
import TimelineCard from './component/TimelineCard.vue'

// ----------- data -----------
const records = ref<TimelineEventRecord[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const typeEntries = ref<PieChartEntry[]>([])
const hasMore = computed(() => currentPage.value < totalPages.value)

// ----------- filters -----------
const filterEventType = ref<string | null>(null)
const filterItemType = ref<string | null>(null)

async function loadPage(page: number, append: boolean) {
  if (loading.value) return
  loading.value = true
  try {
    const params: TimelineEventQuery = { pageSize: 10, pageNum: page }
    if (filterEventType.value) params.eventType = filterEventType.value
    if (filterItemType.value) params.itemType = filterItemType.value
    const data = await getTimelineEvents(params)
    if (append) {
      records.value.push(...data.records)
    } else {
      records.value = data.records
    }
    totalPages.value = data.pages
    currentPage.value = data.current
    totalCount.value = data.total
  } finally {
    loading.value = false
  }
}

function resetAndReload() {
  records.value = []
  currentPage.value = 1
  totalPages.value = 1
  loadPage(1, false)
}

function loadNextPage() {
  if (hasMore.value && !loading.value) {
    loadPage(currentPage.value + 1, true)
  }
}

// ----------- filter watch -----------
watch([filterEventType, filterItemType], () => {
  resetAndReload()
})

// ----------- grouping -----------
interface DayGroup {
  dateLabel: string
  weekday: string
  events: TimelineEventRecord[]
}

interface MonthGroup {
  year: number
  month: number
  label: string
  days: DayGroup[]
}

const groups = computed<MonthGroup[]>(() => {
  const monthMap = new Map<string, TimelineEventRecord[]>()
  for (const e of records.value) {
    const d = new Date(e.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!monthMap.has(key)) monthMap.set(key, [])
    monthMap.get(key)!.push(e)
  }

  const result: MonthGroup[] = []
  for (const [key, evts] of monthMap) {
    const [y, m] = key.split('-').map(Number)
    const dayMap = new Map<string, TimelineEventRecord[]>()
    for (const e of evts) {
      const d = new Date(e.createdAt)
      const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      if (!dayMap.has(dk)) dayMap.set(dk, [])
      dayMap.get(dk)!.push(e)
    }

    const days: DayGroup[] = []
    for (const [dk, devts] of dayMap) {
      const dd = new Date(devts[0]!.createdAt)
      days.push({
        dateLabel: `${dd.getMonth() + 1}月${dd.getDate()}日`,
        weekday: ['日', '一', '二', '三', '四', '五', '六'][dd.getDay()]!,
        events: devts,
      })
    }
    days.sort((a, b) => {
      const ad = new Date(a.events[0]!.createdAt).getTime()
      const bd = new Date(b.events[0]!.createdAt).getTime()
      return bd - ad
    })

    result.push({ year: y!, month: m!, label: `${y}年${m}月`, days })
  }
  result.sort((a, b) => b.year - a.year || b.month - a.month)
  return result
})

// ----------- icon mapping -----------
function getIcon(e: TimelineEventRecord): string {
  switch (e.eventType) {
    case 'CREATE_ITEM': return 'create'
    case 'RATE_ITEM': return 'rate'
    case 'START_ITEM': return 'start'
    case 'COMPLETE_ITEM': return 'complete'
    default: return 'dot'
  }
}

// ----------- stats -----------
const stats = computed(() => ({
  total: totalCount.value,
  itemTypes: typeEntries.value,
}))

const allItemTypes = computed(() =>
  typeEntries.value.map((e) => e.name),
)

async function fetchTypeData() {
  const data = await getTypePieChartData()
  typeEntries.value = Object.entries(data).map(([name, value]) => ({ name, value }))
}

onMounted(() => {
  loadPage(1, false)
  fetchTypeData()
})
</script>

<template>
  <div class="timeline-layout">
    <!-- ====== LEFT ====== -->
    <div class="timeline-left">
      <h2 class="page-title">时间线</h2>

      <div v-if="loading && records.length === 0" class="state">加载中...</div>
      <div v-else-if="records.length === 0" class="state">
        <p class="empty-text">暂无时间线数据</p>
      </div>

      <template v-else>
        <section v-for="group in groups" :key="group.label" class="month-section">
          <h3 class="month-head">{{ group.label }}</h3>

          <div v-for="day in group.days" :key="day.dateLabel" class="day-section">
            <h4 class="day-head">
              {{ day.dateLabel }}<span class="day-weekday"> 星期{{ day.weekday }}</span>
            </h4>

            <TimelineCard v-for="(event, idx) in day.events" :key="event.id" :event="event" :icon="getIcon(event)"
              :is-last="idx === day.events.length - 1" />
          </div>
        </section>

        <!-- 加载更多 -->
        <div class="sentinel">
          <button v-if="hasMore" class="load-more-btn" :disabled="loading" @click="loadNextPage">
            {{ loading ? '加载中...' : '加载更多' }}
          </button>
          <span v-else-if="records.length > 0" class="no-more">没有更多了</span>
        </div>
      </template>
    </div>

    <!-- ====== DIVIDER ====== -->
    <div class="divider" />

    <!-- ====== RIGHT ====== -->
    <aside class="timeline-right">
      <div style="position:sticky; top:92px;">
        <div class="stats-box">
          <div class="stat">
            <span class="stat-num">{{ stats.total }}</span>
            <span class="stat-label">条记录</span>
          </div>
          <div class="stat">
            <span class="stat-num">{{ stats.itemTypes.length }}</span>
            <span class="stat-label">种类型</span>
          </div>
        </div>
        <div class="filter-section">
          <h4 class="filter-title">条目类型</h4>
          <div class="tag-group">
            <button class="tag" :class="{ active: !filterItemType }" @click="filterItemType = null">
              全部
            </button>
            <button v-for="it in allItemTypes" :key="it" class="tag" :class="{ active: filterItemType === it }"
              @click="filterItemType = it">
              {{ it }}
            </button>
          </div>
        </div>

        <n-calendar class="calendar" />
      </div>

    </aside>
  </div>
</template>

<style scoped>
/* ===== layout ===== */
.timeline-layout {
  display: flex;
  height: 100%;
}

.timeline-left {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px 60px;
  min-width: 0;
}

.divider {
  width: 1px;
  background: var(--color-ui);
  flex-shrink: 0;
}

.timeline-right {
  width: 350px;
  flex-shrink: 0;
  padding: 32px 24px;
}

/* ===== left ===== */
.page-title {
  margin: 0 0 32px 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
}

.state {
  padding: 40px 0;
  text-align: center;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 14px;
}

/* month */
.month-section {
  margin-bottom: 24px;
}

.month-head {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  padding: 6px 12px;
  background: var(--color-ui);
  border-radius: 6px;
  display: inline-block;
}

/* day */
.day-section {
  margin-bottom: 2px;
}

.day-head {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.day-weekday {
  font-weight: 400;
}

/* sentinel */
.sentinel {
  text-align: center;
  padding: 24px 0;
}

.load-more-btn {
  padding: 8px 32px;
  border: 1px solid var(--color-ui2);
  border-radius: 6px;
  background: var(--color-card-bg);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.load-more-btn:hover:not(:disabled) {
  border-color: #b15e6c;
  color: #b15e6c;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-more {
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* ===== right ===== */
.stats-box {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.filter-section {
  margin-bottom: 22px;
}

.calendar {
  height: 300px;
}

.filter-title {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  border: 1px solid var(--color-ui2);
  background: var(--color-card-bg);
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.tag:hover {
  border-color: #b15e6c;
  color: #b15e6c;
}

.tag.active {
  background: var(--color-ui2);
  border-color: var(--color-ui2);
  color: #b15e6c;
  font-weight: 600;
}
</style>
