<script setup lang="ts">
import { getItems, deleteItem, type MediaItem } from "@/api/Admin"
import { ref, onMounted, h } from "vue"
import { useDialog, useMessage, NButton, NPopconfirm } from "naive-ui"
import type { DataTableColumn, DataTableRowKey } from "naive-ui"

const dialog = useDialog()
const message = useMessage()

const items = ref<MediaItem[]>([])
const loading = ref(false)
const checkedRowKeys = ref<DataTableRowKey[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const rowKey = (row: MediaItem) => row.id

const columns: DataTableColumn<MediaItem>[] = [
  { type: "selection" },
  { title: "ID", key: "id", width: 60 },
  { title: "名称", key: "name", ellipsis: { tooltip: true } },
  { title: "标题", key: "title", ellipsis: { tooltip: true } },
  { title: "类型", key: "type", width: 80 },
  {
    title: "封面",
    key: "cover",
    width: 80,
    render(row) {
      return row.cover
        ? h("img", {
            src: row.cover,
            style: "width: 48px; height: 64px; object-fit: cover; border-radius: 4px",
          })
        : "-"
    },
  },
  { title: "评分", key: "rating", width: 60 },
  { title: "状态", key: "status", width: 80 },
  { title: "描述", key: "description", ellipsis: { tooltip: true }, render(row) { return row.description || "-" } },
  {
    title: "创建时间",
    key: "createdAt",
    width: 160,
    render(row) {
      return row.createdAt ? new Date(row.createdAt).toLocaleString("zh-CN") : "-"
    },
  },
  {
    title: "更新时间",
    key: "updatedAt",
    width: 160,
    render(row) {
      return row.updatedAt ? new Date(row.updatedAt).toLocaleString("zh-CN") : "-"
    },
  },
  {
    title: "操作",
    key: "actions",
    width: 100,
    render(row) {
      return h(
        NPopconfirm,
        { onPositiveClick: () => handleDeleteSingle(row) },
        {
          trigger: () => h(NButton, { size: "small", type: "error" }, { default: () => "删除" }),
          default: () => "确定删除该条目？",
        },
      )
    },
  },
]

async function fetchItems() {
  loading.value = true
  try {
    const res = await getItems({ pageNum: page.value, pageSize: pageSize.value })
    items.value = res.list
    total.value = res.total
    checkedRowKeys.value = []
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  fetchItems()
}

function handlePageSizeChange(ps: number) {
  pageSize.value = ps
  page.value = 1
  fetchItems()
}

async function handleDeleteSingle(row: MediaItem) {
  await deleteItem([row.id])
  message.success("已删除")
  fetchItems()
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return
  dialog.warning({
    title: "批量删除",
    content: `确定删除选中的 ${checkedRowKeys.value.length} 个条目吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await deleteItem(checkedRowKeys.value as number[])
      message.success("已删除")
      fetchItems()
    },
  })
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="items-page">
    <n-h1 prefix="bar">
      <n-text type="primary">媒体管理</n-text>
    </n-h1>

    <div class="toolbar">
      <n-button type="error" :disabled="checkedRowKeys.length === 0" @click="handleBatchDelete">
        批量删除 ({{ checkedRowKeys.length }})
      </n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="items"
      :loading="loading"
      :row-key="rowKey"
      :checked-row-keys="checkedRowKeys"
      :bordered="false"
      @update:checked-row-keys="checkedRowKeys = $event"
    />

    <div class="pagination-wrapper">
      <n-pagination
        v-model:page="page"
        :page-size="pageSize"
        :item-count="total"
        :page-sizes="[5, 10, 20, 50]"
        show-size-picker
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.items-page {
  padding: 16px;
}

.toolbar {
  margin-bottom: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
