<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTimelineEvents, type TimelineEventRecord } from '@/api/timeline'

const props = defineProps<{
  itemId: number
}>()

const events = ref<TimelineEventRecord[]>([])
const loading = ref(false)

const eventTypeLabel: Record<string, string> = {
  CREATE_ITEM: '添加',
  RATE_ITEM: '评分',
  START_ITEM: '开始',
  COMPLETE_ITEM: '完成',
}

function getLabel(et: string): string {
  return eventTypeLabel[et] ?? et
}

function getIcon(et: string): string {
  switch (et) {
    case 'CREATE_ITEM': return 'create'
    case 'RATE_ITEM': return 'rate'
    case 'START_ITEM': return 'start'
    case 'COMPLETE_ITEM': return 'complete'
    default: return 'dot'
  }
}

function formatTime(d: Date): string {
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

async function load() {
  loading.value = true
  try {
    const data = await getTimelineEvents({ itemId: props.itemId, pageSize: 999 })
    events.value = [...data.records].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <div class="timeline-wrap">
    <div class="timeline-header">
      <h4 class="timeline-title">时间轴</h4>
      <span class="timeline-sub">/ TIMELINE</span>
    </div>

    <div v-if="loading" class="tl-state">加载中...</div>
    <div v-else-if="events.length === 0" class="tl-state">暂无时间线</div>

    <div v-else class="timeline-scroll">
      <div class="timeline-track">
        <!-- render nodes + connectors via computed arrays -->
        <template v-for="(ev, idx) in events" :key="ev.id">
          <div class="tl-node">
            <div class="tl-above">
              <span class="tl-date">
                {{ (new Date(ev.createdAt).getMonth() + 1) + '/' + new Date(ev.createdAt).getDate() }}
              </span>
              <span class="tl-time">{{ formatTime(new Date(ev.createdAt)) }}</span>
            </div>

            <div class="tl-icon-wrap">
              <svg
                v-if="getIcon(ev.eventType) === 'dot'"
                class="tl-icon tl-dot"
                viewBox="0 0 10 10"
              >
                <circle cx="5" cy="5" r="5" fill="var(--color-ui2)" />
              </svg>
              <svg
                v-else-if="getIcon(ev.eventType) === 'create'"
                class="tl-icon"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" stroke="var(--color-ui2)" stroke-width="2" />
              </svg>
              <svg
                v-else-if="getIcon(ev.eventType) === 'start'"
                class="tl-icon"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" fill="var(--color-ui2)" />
              </svg>
              <svg
                v-else-if="getIcon(ev.eventType) === 'rate'"
                class="tl-icon"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" fill="var(--color-ui2)" />
              </svg>
              <svg
                v-else-if="getIcon(ev.eventType) === 'complete'"
                class="tl-icon"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="var(--color-ui2)" stroke-width="2" />
              </svg>
              <svg
                v-else
                class="tl-icon tl-dot"
                viewBox="0 0 10 10"
              >
                <circle cx="5" cy="5" r="5" fill="var(--color-ui2)" />
              </svg>
            </div>

            <div class="tl-below">
              <span class="tl-badge">{{ getLabel(ev.eventType) }}</span>
              <span v-if="ev.description" class="tl-desc">{{ ev.description }}</span>
            </div>
          </div>

          <div v-if="idx < events.length - 1" class="tl-connector" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-wrap {
  padding: 32px 40px 60px;
  border-top: 1px solid var(--color-ui);
}

.timeline-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 24px;
}

.timeline-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.timeline-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.tl-state {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
  padding: 24px 0;
}

.timeline-scroll {
  overflow-x: auto;
  padding-bottom: 12px;
}

.timeline-track {
  display: flex;
  align-items: flex-start;
  min-width: max-content;
  padding: 0 20px;
}

.tl-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 130px;
}

.tl-above {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.tl-date {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}

.tl-time {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.tl-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.tl-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.tl-dot {
  width: 12px;
  height: 12px;
}

.tl-connector {
  width: 60px;
  min-width: 60px;
  display: flex;
  align-items: center;
}

.tl-connector::after {
  content: '';
  display: block;
  width: 100%;
  height: 2px;
  background: var(--color-ui);
}

.tl-below {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
  gap: 4px;
  max-width: 150px;
  text-align: center;
}

.tl-badge {
  display: inline-block;
  background: var(--color-ui);
  color: #b15e6c;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tl-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
  word-break: break-word;
}
</style>
