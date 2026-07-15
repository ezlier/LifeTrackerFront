<script setup lang="ts">
import { ref, watch } from 'vue'
import { search, getMetadataDetail, type SearchResult } from '@/api/search'

const props = defineProps<{
  showing: boolean
  submitting: boolean
  typeOptions: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  'update:showing': [value: boolean]
  create: [data: { title: string; type: string; cover: string; description: string }]
}>()

const form = ref({ title: '', type: 'book', cover: '', description: '' })
const activeTab = ref('搜索')
const keyword = ref('')
const searchResults = ref<SearchResult[]>([])
const searching = ref(false)

watch(
  () => props.showing,
  (val) => {
    if (val) {
      form.value = { title: '', type: 'book', cover: '', description: '' }
      activeTab.value = '搜索'
      keyword.value = ''
      searchResults.value = []
    }
  },
)

function onCancel() {
  emit('update:showing', false)
}

function onSubmit() {
  if (!form.value.title.trim()) return
  emit('create', { ...form.value })
}

async function handleSearch() {
  if (!keyword.value.trim()) return
  searching.value = true
  try {
    searchResults.value = await search({
      type: form.value.type,
      keyword: keyword.value.trim(),
    })
  } finally {
    searching.value = false
  }
}

const searchingDetail = ref(false)

async function selectSearchResult(item: SearchResult) {
  searchingDetail.value = true
  try {
    const detail = await getMetadataDetail({
      sourceId: item.sourceId,
      type: form.value.type,
    })
    if (detail) {
      form.value = {
        title: detail.title || '',
        type: form.value.type,
        cover: detail.cover || '',
        description: detail.description || '',
      }
    } else {
      form.value = {
        title: item.title || '',
        type: form.value.type,
        cover: item.cover || '',
        description: item.description || '',
      }
    }
  } catch {
    form.value = {
      title: item.title || '',
      type: form.value.type,
      cover: item.cover || '',
      description: item.description || '',
    }
  } finally {
    searchingDetail.value = false
    activeTab.value = '手动添加'
  }
}
</script>

<template>
  <n-modal :show="showing" @update:show="emit('update:showing', $event)">
    <n-card style="width: 480px" title="创建内容项" :bordered="false">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="搜索" tab="搜索">
          <n-form label-placement="left">
            <n-form-item label="标题">
              <n-input v-model:value="keyword" placeholder="请输入搜索关键词" @keyup.enter="handleSearch" />
            </n-form-item>
            <n-form-item label="类型">
              <n-select v-model:value="form.type" :options="typeOptions" consistent-menu-width="false" />
            </n-form-item>
          </n-form>
          <n-button type="primary" :loading="searching" block @click="handleSearch">搜索</n-button>
          <n-flex v-if="searchResults.length > 0">
            <div
              v-for="(item, idx) in searchResults"
              :key="idx"
              class="search-result-item"
              :class="{ loading: searchingDetail }"
              @click="!searchingDetail && selectSearchResult(item)"
            >
              <img :src="item.cover" class="search-result-cover" />
              <p class="search-result-title">{{ item.title }}</p>
            </div>
          </n-flex>
          <n-flex v-else-if="!searching">
            <n-skeleton height="120px" width="30%" />
            <n-skeleton height="120px" width="30%" />
            <n-skeleton height="120px" width="30%" />
          </n-flex>
        </n-tab-pane>
        <n-tab-pane name="手动添加" tab="手动添加">
          <n-form label-placement="left" label-width="80">
            <n-form-item label="标题" required>
              <n-input v-model:value="form.title" placeholder="请输入标题" />
            </n-form-item>
            <n-form-item label="类型" required>
              <n-select v-model:value="form.type" :options="typeOptions" />
            </n-form-item>
            <n-form-item label="封面">
              <n-input v-model:value="form.cover" placeholder="封面图片 URL（可选）" />
            </n-form-item>
            <n-form-item label="描述">
              <n-input v-model:value="form.description" type="textarea" placeholder="请输入描述（可选）"
                :autosize="{ minRows: 2, maxRows: 4 }" />
            </n-form-item>
          </n-form>
        </n-tab-pane>

      </n-tabs>


      <template #footer>
        <n-space justify="space-around">
          <n-button @click="onCancel">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="onSubmit">
            创建
          </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
.search-result-item {
  width: 30%;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--n-border-color, #eee);
  transition: box-shadow 0.2s;
}

.search-result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.search-result-item.loading {
  opacity: 0.5;
  pointer-events: none;
}

.search-result-cover {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.search-result-title {
  margin: 0;
  padding: 6px 8px;
  font-size: 12px;
  color: var(--n-text-color, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
