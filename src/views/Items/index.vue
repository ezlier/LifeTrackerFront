<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getItems, createItem, type ItemRecord } from '@/api/item'
import ItemCard from '@/components/ItemCard.vue'
import CommonPagination from '@/components/CommonPagination.vue'

type SortDir = 'asc' | 'desc' | null

const activeTab = ref('全部')
const dateRange = ref<[number, number] | null>(null)
const statusFilter = ref('')
const searchKeyword = ref('')
const sortRating = ref<SortDir>(null)
const sortDate = ref<SortDir>(null)
const currentPage = ref(1)
const loading = ref(false)
const rawItems = ref<ItemRecord[]>([])
const pageSize = 12
const showModal = ref(false)
const submitting = ref(false)
const newForm = ref({
  title: '',
  type: 'book',
  cover: '',
  description: '',
})

const typeOptions = [
  { label: '书籍', value: 'book' },
  { label: '电影', value: 'movie' },
  { label: '游戏', value: 'game' },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '计划中', value: 'planned' },
  { label: '进行中', value: 'doing' },
  { label: '已完成', value: 'done' },
]

const filteredItems = computed(() => {
  let result = [...rawItems.value]

  if (activeTab.value !== '全部') {
    result = result.filter((i) => i.type === activeTab.value)
  }

  if (statusFilter.value) {
    result = result.filter((i) => i.status === statusFilter.value)
  }

  if (dateRange.value) {
    const [start, end] = dateRange.value
    result = result.filter((i) => {
      const ts = new Date(i.createdAt).getTime()
      return ts >= start && ts <= end
    })
  }

  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    result = result.filter((i) => i.title.toLowerCase().includes(kw))
  }

  if (sortRating.value) {
    result.sort((a, b) => {
      const ra = a.rating ?? 0
      const rb = b.rating ?? 0
      return sortRating.value === 'asc' ? ra - rb : rb - ra
    })
  }

  if (sortDate.value) {
    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortDate.value === 'asc' ? da - db : db - da
    })
  }

  return result
})

const total = computed(() => filteredItems.value.length)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

function toggleSort(field: 'rating' | 'date') {
  if (field === 'rating') {
    sortRating.value = sortRating.value === 'asc' ? 'desc' : sortRating.value === 'desc' ? null : 'asc'
    sortDate.value = null
  } else {
    sortDate.value = sortDate.value === 'asc' ? 'desc' : sortDate.value === 'desc' ? null : 'asc'
    sortRating.value = null
  }
  currentPage.value = 1
}

function getSortIcon(dir: SortDir): string {
  if (!dir) return '↕'
  return dir === 'asc' ? '↑' : '↓'
}

async function fetchItems() {
  loading.value = true
  currentPage.value = 1
  try {
    const params: { pageSize: number; type?: string } = { pageSize: 999 }
    if (activeTab.value !== '全部') {
      params.type = activeTab.value
    }
    const data = await getItems(params)
    rawItems.value = data.records
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  dateRange.value = null
  statusFilter.value = ''
  searchKeyword.value = ''
  sortRating.value = null
  sortDate.value = null
  currentPage.value = 1
}

function openCreateModal() {
  newForm.value = { title: '', type: 'book', cover: '', description: '' }
  showModal.value = true
}

async function handleCreate() {
  if (!newForm.value.title.trim()) return
  submitting.value = true
  try {
    await createItem({
      ...newForm.value,
      status: 'planned',
    })
    showModal.value = false
    fetchItems()
  } finally {
    submitting.value = false
  }
}

watch(activeTab, () => {
  resetFilters()
  fetchItems()
})

watch([statusFilter, dateRange, searchKeyword], () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <n-card title="内容库" style="margin-bottom: 16px">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <n-date-picker v-model:value="dateRange" type="daterange" clearable placeholder="选择日期范围" style="width: 220px" />
      <n-select v-model:value="statusFilter" :options="statusOptions" style="width: 120px" />
      <n-input v-model:value="searchKeyword" placeholder="搜索标题..." clearable style="width: 180px" />
      <n-button size="small" :type="sortRating ? 'primary' : 'default'" @click="toggleSort('rating')">
        评分 {{ getSortIcon(sortRating) }}
      </n-button>
      <n-button size="small" :type="sortDate ? 'primary' : 'default'" @click="toggleSort('date')">
        日期 {{ getSortIcon(sortDate) }}
      </n-button>
    </div>

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="全部" tab="全部" />
      <n-tab-pane name="book" tab="书籍" />
      <n-tab-pane name="movie" tab="电影" />
      <n-tab-pane name="game" tab="游戏" />

      <!-- 创建按钮 -->
      <template #suffix>
        <n-button type="primary" size="small" @click="openCreateModal">创建</n-button>
        <n-modal v-model:show="showModal">
          <n-card style="width: 480px" title="创建内容项" :bordered="false">
            <n-form label-placement="left" label-width="80">
              <n-form-item label="标题" required>
                <n-input v-model:value="newForm.title" placeholder="请输入标题" />
              </n-form-item>
              <n-form-item label="类型" required>
                <n-select v-model:value="newForm.type" :options="typeOptions" />
              </n-form-item>
              <n-form-item label="封面">
                <n-input v-model:value="newForm.cover" placeholder="封面图片 URL（可选）" />
              </n-form-item>
              <n-form-item label="描述">
                <n-input
                  v-model:value="newForm.description"
                  type="textarea"
                  placeholder="请输入描述（可选）"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                />
              </n-form-item>
            </n-form>
            <template #footer>
              <n-space justify="space-around">
                <n-button @click="showModal = false">取消</n-button>
                <n-button type="primary" :loading="submitting" @click="handleCreate">
                  创建
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-modal>
      </template>

    </n-tabs>

    <!-- 卡片网格 -->
    <div v-if="loading" class="items-loading">加载中...</div>
    <div v-else-if="pagedItems.length === 0" class="items-empty">暂无数据</div>
    <div v-else class="items-grid">
      <ItemCard v-for="item in pagedItems" :key="item.id" :item="item" />
    </div>

    <!-- 分页 -->
    <CommonPagination v-if="total > pageSize" :current-page="currentPage" :page-size="pageSize" :total="total"
      @change="currentPage = $event" />
  </n-card>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.items-loading,
.items-empty {
  text-align: center;
  padding: 32px 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}
</style>
