<script setup lang="ts">
import { getTimeline, deleteTimeline, type Timeline } from "@/api/Admin"
import { ref, onMounted, h } from "vue"
import { useDialog, useMessage, NButton, NPopconfirm } from "naive-ui"
import type { DataTableColumn, DataTableRowKey } from "naive-ui"

const dialog = useDialog()
const message = useMessage()

const data = ref<Timeline[]>([])
const loading = ref(false)
const checkedRowKeys = ref<DataTableRowKey[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const rowKey = (row: Timeline) => row.id

const columns: DataTableColumn<Timeline>[] = [
  { type: "selection" },
  { title: "ID", key: "id", width: 60 },
  { title: "用户名", key: "userName" },
  { title: "事件类型", key: "eventType", width: 100 },
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
    title: "操作",
    key: "actions",
    width: 100,
    render(row) {
      return h(
        NPopconfirm,
        { onPositiveClick: () => handleDeleteSingle(row) },
        {
          trigger: () => h(NButton, { size: "small", type: "error" }, { default: () => "删除" }),
          default: () => "确定删除该记录？",
        },
      )
    },
  },
]

async function fetchData() {
  loading.value = true
  try {
    const res = await getTimeline({ pageNum: page.value, pageSize: pageSize.value })
    data.value = res.list
    total.value = res.total
    checkedRowKeys.value = []
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  fetchData()
}

function handlePageSizeChange(ps: number) {
  pageSize.value = ps
  page.value = 1
  fetchData()
}

async function handleDeleteSingle(row: Timeline) {
  await deleteTimeline([row.id])
  message.success("已删除")
  fetchData()
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return
  dialog.warning({
    title: "批量删除",
    content: `确定删除选中的 ${checkedRowKeys.value.length} 条记录吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await deleteTimeline(checkedRowKeys.value as number[])
      message.success("已删除")
      fetchData()
    },
  })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="timeline-page">
    <n-h1 prefix="bar">
      <n-text type="primary">时间线管理</n-text>
    </n-h1>

    <div class="toolbar">
      <n-button type="error" :disabled="checkedRowKeys.length === 0" @click="handleBatchDelete">
        批量删除 ({{ checkedRowKeys.length }})
      </n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="data"
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
.timeline-page {
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
