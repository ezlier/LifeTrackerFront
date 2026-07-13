<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineEventRecord } from '@/api/timeline'

const props = withDefaults(
  defineProps<{
    event: TimelineEventRecord
    isLast: boolean
    icon?: string
  }>(),
  { icon: 'dot' },
)

const eventTypeLabel: Record<string, string> = {
  CREATE_ITEM: '添加',
  RATE_ITEM: '评分',
  START_ITEM: '开始',
  COMPLETE_ITEM: '完成',
  FOCUS_SESSION_START: '开始聚焦',
  FOCUS_SESSION_COMPLETE: '聚焦完成',
  FOCUS_SESSION_CANCEL: '聚焦取消',
  LOGIN_SUCCESSFULLY: '登录成功',
}

const label = computed(() =>
  props.event.eventType
    ? (eventTypeLabel[props.event.eventType] ?? props.event.eventType)
    : '未知',
)

const timeText = computed(() => {
  const d = new Date(props.event.createdAt)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
})

const displayTitle = computed(() => {
  if (props.event.itemTitle) return props.event.itemTitle
  if (props.event.focusSessionDuration != null && props.event.focusSessionDuration != 0) {
    const minutes = Math.round(props.event.focusSessionDuration / 60)
    if (minutes == 0) return '完成' + props.event.focusSessionDuration + '秒专注'
    return `完成 ${minutes} 分钟专注`
  } else if (props.event.focusSessionDuration == 0){
    return '启动了一个计时'
  }
  return ' ( ⩌⤚⩌)'
})
</script>

<template>
  <div class="row" :class="{ last: isLast }">
    <!-- time -->
    <div class="time-col">
      <span class="time-text">{{ timeText }}</span>
    </div>

    <!-- dot / icon + bar -->
    <div class="bar-col">
      <!-- default dot -->
      <svg
        v-if="icon === 'dot'"
        class="icon dot-icon"
        viewBox="0 0 10 10"
        fill="none"
      >
        <circle cx="5" cy="5" r="5" fill="var(--color-ui2)" />
      </svg>

      <!-- create -->
      <svg
        v-else-if="icon === 'create'"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-ui2)"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>

      <!-- start -->
      <svg
        v-else-if="icon === 'start'"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-ui2)"
        stroke-width="1.8"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" fill="var(--color-ui2)" />
      </svg>

      <!-- rate -->
      <svg
        v-else-if="icon === 'rate'"
        class="icon"
        viewBox="0 0 24 24"
        fill="var(--color-ui2)"
        stroke="var(--color-ui2)"
        stroke-width="0.3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>

      <!-- complete -->
      <svg
        v-else-if="icon === 'complete'"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-ui2)"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>

      <!-- fallback dot -->
      <svg
        v-else
        class="icon dot-icon"
        viewBox="0 0 10 10"
        fill="none"
      >
        <circle cx="5" cy="5" r="5" fill="var(--color-ui2)" />
      </svg>

      <div v-if="!isLast" class="bar" />
    </div>

    <!-- card -->
    <div class="card">
      <img
        v-if="event.itemCover"
        :src="event.itemCover"
        class="card-img"
        alt="封面"
      />
      <div v-else class="card-img card-img-placeholder">IMG</div>
      <div class="card-body">
        <span class="event-badge">{{ label }}</span>
        <h4 class="item-title">{{ displayTitle }}</h4>
        <p v-if="event.description" class="event-desc">{{ event.description }}</p>
        <span class="item-meta" v-if="event.itemType">{{
          event.itemType
        }}{{ event.itemStatus ? ' · ' + event.itemStatus : '' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: stretch;
  gap: 0;
  position: relative;
  min-height: 88px;
}

.row.last {
  min-height: 32px;
}

/* time column */
.time-col {
  width: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 6px;
  padding-right: 6px;
}

.time-text {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1;
}

/* bar column */
.bar-col {
  width: 28px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  z-index: 1;
}

.dot-icon {
  width: 10px;
  height: 10px;
  margin-top: 5px;
}

.bar {
  flex: 1;
  width: 2px;
  background: var(--color-ui);
  margin-top: 4px;
  margin-bottom: 0;
}

/* card */
.card {
  flex: 1;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--border-radius, 8px);
  padding: 14px 18px;
  margin-left: 10px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: row;
  gap: 14px;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}

.card-img {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-img-placeholder {
  background: var(--color-ui);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-muted);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.event-badge {
  display: inline-block;
  background: var(--color-ui);
  color: #b15e6c;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.item-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.item-meta {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
