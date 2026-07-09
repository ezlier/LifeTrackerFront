<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getItems, type ItemRecord } from '@/api/item'
import CardList from './component/CardList.vue'
import HeatMap from './component/HeatMap.vue'
import CommonPagination from '@/components/CommonPagination.vue'

const allItems = ref<ItemRecord[]>([])
const loading = ref(false)
const pageSize = 6

const plannedPage = ref(1)
const doingPage = ref(1)
const donePage = ref(1)

const plannedItems = computed(() =>
  allItems.value.filter((i) => i.status === 'planned'),
)
const doingItems = computed(() =>
  allItems.value.filter((i) => i.status === 'doing'),
)
const doneItems = computed(() =>
  allItems.value.filter((i) => i.status === 'done'),
)

function paged(items: ItemRecord[], page: number) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await getItems({ pageSize: 999 })
    allItems.value = data.records
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <div v-if="loading" class="dashboard-loading">加载中...</div>
    <template v-else>
      <HeatMap />
      <section class="dashboard-section">
        <h2 class="section-title">Planned</h2>
        <CardList :items="paged(plannedItems, plannedPage)" />
        <CommonPagination
          v-if="plannedItems.length > pageSize"
          :current-page="plannedPage"
          :page-size="pageSize"
          :total="plannedItems.length"
          @change="plannedPage = $event"
        />
      </section>
      <section class="dashboard-section">
        <h2 class="section-title">Doing</h2>
        <CardList :items="paged(doingItems, doingPage)" />
        <CommonPagination
          v-if="doingItems.length > pageSize"
          :current-page="doingPage"
          :page-size="pageSize"
          :total="doingItems.length"
          @change="doingPage = $event"
        />
      </section>
      <section class="dashboard-section">
        <h2 class="section-title">Done</h2>
        <CardList :items="paged(doneItems, donePage)" />
        <CommonPagination
          v-if="doneItems.length > pageSize"
          :current-page="donePage"
          :page-size="pageSize"
          :total="doneItems.length"
          @change="donePage = $event"
        />
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  gap: 24px;
}

.dashboard-loading {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
}

.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
</style>
