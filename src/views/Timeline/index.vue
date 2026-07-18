<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getTimelineEvents, type TimelineEventRecord, type TimelineEventQuery } from '@/api/timeline'
import { getTypePieChartData, type PieChartEntry } from '@/api/heatmap'
import TimelineLayout from './component/TimelineLayout.vue'
import Bill from './component/Bill.vue'

// ----------- data -----------
const records = ref<TimelineEventRecord[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const typeEntries = ref<PieChartEntry[]>([])
const hasMore = computed(() => currentPage.value < totalPages.value)
const checked = ref(false)

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
const groups = computed(() => {
  const monthMap = new Map<string, TimelineEventRecord[]>()
  for (const e of records.value) {
    const d = new Date(e.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!monthMap.has(key)) monthMap.set(key, [])
    monthMap.get(key)!.push(e)
  }

  const result: any[] = []
  for (const [key, evts] of monthMap) {
    const [y, m] = key.split('-').map(Number)
    const dayMap = new Map<string, TimelineEventRecord[]>()
    for (const e of evts) {
      const d = new Date(e.createdAt)
      const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      if (!dayMap.has(dk)) dayMap.set(dk, [])
      dayMap.get(dk)!.push(e)
    }

    const days: any[] = []
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
  <label for="filter" class="switch" aria-label="Toggle Filter">
    <input type="checkbox" id="filter" v-model="checked"/>
    <span>足迹</span>
    <span>账单</span>
  </label>

  <TimelineLayout
    :loading="loading"
    :records="records"
    :groups="groups"
    :has-more="hasMore"
    :stats="stats"
    :all-item-types="allItemTypes"
    :filter-item-type="filterItemType"
    @load-next-page="loadNextPage"
    @update:filter-item-type="filterItemType = $event"
    v-if="!checked"
  />
  <Bill
    v-if="checked"
  />
</template>

<style scoped>
  .switch {
    --_switch-bg-clr: var(--color-sidebar-bg);
    --_switch-padding: 4px; /* padding around button*/
    --_slider-bg-clr: var(--color-ui); /* slider color unchecked */
    --_slider-bg-clr-on: var(--color-card-bg); /* slider color checked */
    --_slider-txt-clr: #ffffff;
    --_label-padding: 1rem 2rem; /* padding around the labels -  this gives the switch it's global width and height */
    --_switch-easing: cubic-bezier(
      0.47,
      1.64,
      0.41,
      0.8
    ); /* easing on toggle switch */
    color: var(--color-text);
    width: fit-content;
    display: flex;
    justify-content: center;
    position: relative;
    border-radius: var(--border-radius);
    cursor: pointer;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    position: relative;
    isolation: isolate;
  }

  .switch input[type="checkbox"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  .switch > span {
    display: grid;
    place-content: center;
    transition: opacity 300ms ease-in-out 150ms;
    padding: var(--_label-padding);
  }
  .switch::before,
  .switch::after {
    content: "";
    position: absolute;
    border-radius: inherit;
    transition: inset 150ms ease-in-out;
  }
  /* switch slider */
  .switch::before {
    background-color: var(--_slider-bg-clr);
    inset: var(--_switch-padding) 50% var(--_switch-padding)
      var(--_switch-padding);
    transition:
      inset 500ms var(--_switch-easing),
      background-color 500ms ease-in-out;
    z-index: -1;
    box-shadow:
      inset 0 1px 1px rgba(0, 0, 0, 0.3),
      0 1px rgba(255, 255, 255, 0.3);
  }
  /* switch bg color */
  .switch::after {
    background-color: var(--_switch-bg-clr);
    inset: 0;
    z-index: -2;
  }
  /* switch hover & focus */
  .switch:focus-within::after {
    inset: -0.25rem;
  }
  .switch:has(input:checked):hover > span:first-of-type,
  .switch:has(input:not(:checked)):hover > span:last-of-type {
    opacity: 1;
    transition-delay: 0ms;
    transition-duration: 100ms;
  }
  /* switch hover */
  .switch:has(input:checked):hover::before {
    inset: var(--_switch-padding) var(--_switch-padding) var(--_switch-padding)
      45%;
  }
  .switch:has(input:not(:checked)):hover::before {
    inset: var(--_switch-padding) 45% var(--_switch-padding)
      var(--_switch-padding);
  }
  /* checked - move slider to right */
  .switch:has(input:checked)::before {
    background-color: var(--_slider-bg-clr-on);
    inset: var(--_switch-padding) var(--_switch-padding) var(--_switch-padding)
      50%;
  }
  /* checked - set opacity */
  .switch > span:last-of-type,
  .switch > input:checked + span:first-of-type {
    opacity: 0.75;
  }
  .switch > input:checked ~ span:last-of-type {
    opacity: 1;
  }
</style>
