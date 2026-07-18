<script setup lang="ts">
import type { TimelineEventRecord } from '@/api/timeline'
import TimelineCard from './TimelineCard.vue'

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

const props = defineProps<{
  loading: boolean
  records: TimelineEventRecord[]
  groups: MonthGroup[]
  hasMore: boolean
  stats: { total: number; itemTypes: { name: string; value: number }[] }
  allItemTypes: string[]
  filterItemType: string | null
}>()

const emit = defineEmits<{
  loadNextPage: []
  'update:filterItemType': [value: string | null]
}>()

function getIcon(e: TimelineEventRecord): string {
  switch (e.eventType) {
    case 'CREATE_ITEM': return 'create'
    case 'RATE_ITEM': return 'rate'
    case 'START_ITEM': return 'start'
    case 'COMPLETE_ITEM': return 'complete'
    default: return 'dot'
  }
}
</script>

<template>
  <div class="timeline-layout">
    <!-- ====== LEFT ====== -->
    <div class="timeline-left">
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
          <button v-if="hasMore" class="load-more-btn" :disabled="loading" @click="$emit('loadNextPage')">
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
            <button class="tag" :class="{ active: !filterItemType }" @click="$emit('update:filterItemType', null)">
              全部
            </button>
            <button v-for="it in allItemTypes" :key="it" class="tag" :class="{ active: filterItemType === it }"
              @click="$emit('update:filterItemType', it)">
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
