<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  getItem,
  updateItem,
  deleteItems,
  type ItemRecord,
} from '@/api/item'
import ItemTimeline from './component/ItemTimeline.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const item = ref<ItemRecord | null>(null)
const loading = ref(false)

/* ---- 评分 ---- */
const pendingRating = ref<number | null>(null)
const showRateConfirm = ref(false)
const displayRating = computed(() => (item.value?.rating ?? 0) / 2)

function onRateChange(val: number) {
  pendingRating.value = val * 2
  showRateConfirm.value = true
}

async function confirmRating() {
  if (!item.value || pendingRating.value === null) return
  await updateItem({ id: item.value.id, rating: pendingRating.value })
  item.value.rating = pendingRating.value
  showRateConfirm.value = false
  message.success('评分已更新')
}

function cancelRating() {
  showRateConfirm.value = false
}

/* ---- 状态切换 ---- */
const nextStatus = computed(() => {
  if (!item.value) return ''
  if (item.value.status === 'planned') return 'doing'
  if (item.value.status === 'doing') return 'done'
  return ''
})

const statusLabel: Record<string, string> = {
  planned: '计划中',
  doing: '进行中',
  done: '已完成',
}

async function handleStatusToggle() {
  if (!item.value || !nextStatus.value) return
  await updateItem({ id: item.value.id, status: nextStatus.value })
  item.value.status = nextStatus.value as ItemRecord['status']
  message.success('状态已更新')
}

/* ---- 编辑 ---- */
const showEditModal = ref(false)
const editForm = ref({ title: '', type: 'book', cover: '', description: '' })
const editSubmitting = ref(false)

const typeOptions = [
  { label: '书籍', value: 'book' },
  { label: '电影', value: 'movie' },
  { label: '游戏', value: 'game' },
]

function openEdit() {
  if (!item.value) return
  editForm.value = {
    title: item.value.title,
    type: item.value.type,
    cover: item.value.cover ?? '',
    description: item.value.description ?? '',
  }
  showEditModal.value = true
}

async function handleEdit() {
  if (!item.value || !editForm.value.title.trim()) return
  editSubmitting.value = true
  try {
    await updateItem({ id: item.value.id, ...editForm.value })
    Object.assign(item.value, editForm.value)
    showEditModal.value = false
    message.success('编辑成功')
  } finally {
    editSubmitting.value = false
  }
}

/* ---- 删除 ---- */
async function handleDelete() {
  if (!item.value) return
  await deleteItems([item.value.id])
  message.success('已删除')
  router.push('/items')
}

/* ---- 加载 ---- */
async function loadItem() {
  loading.value = true
  try {
    item.value = await getItem(Number(route.params.id))
  } finally {
    loading.value = false
  }
}

onMounted(() => loadItem())
</script>

<template>
  <div v-if="loading" class="item-loading">加载中...</div>
  <div v-else-if="!item" class="item-loading">未找到内容</div>

  <div v-else class="item-detail">
    <div class="item-image-container">
      <img v-if="item.cover" :src="item.cover" alt="封面" class="item-image" />
      <div v-else class="item-image-placeholder">暂无封面</div>
    </div>

    <div class="item-info">
      <n-h1 prefix="bar" align-text type="info">
        <n-text type="info">{{ item.title }}</n-text>
      </n-h1>
      <n-tag :bordered="false">{{ item.type }}</n-tag>
      <div class="item-description">{{ item.description || '-' }}</div>

      <!-- 信息卡片 -->
      <div class="item-card">
        <!-- 评分 -->
        <div class="item-card-item">
          <span>评分</span>
          <div class="rate-area">
            <n-rate
              :value="displayRating"
              @update:value="onRateChange"
              :clearable="true"
            />
            <span v-if="showRateConfirm" class="rate-confirm">
              <n-button size="tiny" type="primary" @click="confirmRating">
                确认
              </n-button>
              <n-button size="tiny" @click="cancelRating">取消</n-button>
            </span>
            <span v-else class="rate-text">
              {{ item.rating ?? 0 }} / 10
            </span>
          </div>
        </div>

        <!-- 状态 -->
        <div class="item-card-item">
          <span>状态</span>
          <n-popconfirm
            v-if="nextStatus"
            @positive-click="handleStatusToggle"
          >
            <template #trigger>
              <n-button type="primary">
                {{ statusLabel[item.status] }}
              </n-button>
            </template>
            确认将状态从「{{ statusLabel[item.status] }}」改为「{{
              statusLabel[nextStatus]
            }}」？
          </n-popconfirm>
          <n-tag v-else type="success">{{ statusLabel[item.status] }}</n-tag>
        </div>

        <!-- 创建时间 -->
        <div class="item-card-item">
          <span>创建时间</span>
          <n-time :time="item.createdAt" format="yyyy-MM-dd" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="operation">
        <n-button type="primary" @click="openEdit">编辑</n-button>
        <n-popconfirm @positive-click="handleDelete">
          <template #trigger>
            <n-button type="error">删除</n-button>
          </template>
          确认删除「{{ item.title }}」？此操作不可撤销。
        </n-popconfirm>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal">
      <n-card style="width: 480px" title="编辑内容项" :bordered="false">
        <n-form label-placement="left" label-width="80">
          <n-form-item label="标题" required>
            <n-input v-model:value="editForm.title" placeholder="请输入标题" />
          </n-form-item>
          <n-form-item label="类型" required>
            <n-select
              v-model:value="editForm.type"
              :options="typeOptions"
            />
          </n-form-item>
          <n-form-item label="封面">
            <n-input
              v-model:value="editForm.cover"
              placeholder="封面图片 URL（可选）"
            />
          </n-form-item>
          <n-form-item label="描述">
            <n-input
              v-model:value="editForm.description"
              type="textarea"
              placeholder="请输入描述（可选）"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" :loading="editSubmitting" @click="handleEdit">
            保存
          </n-button>
        </template>
      </n-card>
    </n-modal>
  </div>

  <ItemTimeline v-if="item" :item-id="item.id" />
</template>

<style scoped>
.item-loading {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-muted);
}

.item-detail {
  padding: 40px;
  display: flex;
  gap: 24px;
}

.item-image-container {
  width: 100%;
  flex: 0 0 30%;
}

.item-image {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 3 / 4;
  border-radius: var(--border-radius);
}

.item-image-placeholder {
  width: 100%;
  aspect-ratio: 3 / 4;
  background: var(--color-ui);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.item-info {
  flex: 1;
}

.item-description {
  margin-top: 12px;
  height: 200px;
}

.item-card {
  display: flex;
  gap: 40px;
  background-color: var(--color-ui);
  border-radius: var(--border-radius);
  padding: 12px 24px;
}

.item-card-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rate-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rate-confirm {
  display: flex;
  gap: 4px;
}

.rate-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.operation {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
