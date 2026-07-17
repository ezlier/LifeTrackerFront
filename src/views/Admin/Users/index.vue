<script setup lang="ts">
import {
  getUsers,
  resetPwd,
  deleteUser,
  switchAdmin,
  type AdminUser,
} from "@/api/Admin"
import { ref, onMounted, h } from "vue"
import { useDialog, useMessage, NButton, NPopconfirm } from "naive-ui"
import type { DataTableColumn, DataTableRowKey } from "naive-ui"

const dialog = useDialog()
const message = useMessage()

const users = ref<AdminUser[]>([])
const loading = ref(false)
const checkedRowKeys = ref<DataTableRowKey[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const rowKey = (row: AdminUser) => row.id

const columns: DataTableColumn<AdminUser>[] = [
  { type: "selection" },
  { title: "ID", key: "id", width: 60 },
  { title: "用户名", key: "name" },
  {
    title: "头像",
    key: "avatar",
    width: 72,
    render(row) {
      return row.avatar
        ? h("img", {
          src: row.avatar,
          style: "width: 32px; height: 32px; border-radius: 50%; object-fit: cover",
        })
        : "-"
    },
  },
  { title: "邮箱", key: "email", render(row) { return row.email || "-" } },
  { title: "手机", key: "phone", render(row) { return row.phone || "-" } },
  { title: "个人简介", key: "introduction", ellipsis: { tooltip: true }, render(row) { return row.introduction || "-" } },
  {
    title: "管理员",
    key: "isAdmin",
    width: 80,
    render(row) {
      return row.isAdmin === "1" ? "是" : "否"
    },
  },
  {
    title: "操作",
    key: "actions",
    width: 280,
    render(row) {
      return h("div", { style: "display: flex; gap: 8px" }, [
        h(
          NButton,
          { size: "small", onClick: () => handleResetPwd(row) },
          { default: () => "重置密码" },
        ),
        h(
          NButton,
          { size: "small", type: row.isAdmin === "1" ? "warning" : "primary", onClick: () => handleSwitchAdmin(row) },
          { default: () => row.isAdmin === "1" ? "取消管理员" : "设为管理员" },
        ),
        h(
          NPopconfirm,
          { onPositiveClick: () => handleDeleteSingle(row) },
          {
            trigger: () => h(NButton, { size: "small", type: "error" }, { default: () => "删除" }),
            default: () => "确定删除该用户？",
          },
        ),
      ])
    },
  },
]

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUsers({ page: page.value, pageSize: pageSize.value })
    users.value = res.list
    total.value = res.total
    checkedRowKeys.value = []
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  fetchUsers()
}

function handlePageSizeChange(ps: number) {
  pageSize.value = ps
  page.value = 1
  fetchUsers()
}

async function handleResetPwd(row: AdminUser) {
  dialog.warning({
    title: "重置密码",
    content: `确定重置用户「${row.name}」的密码吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await resetPwd(row.id)
      message.success("密码已重置")
    },
  })
}

async function handleSwitchAdmin(row: AdminUser) {
  await switchAdmin(row.id)
  message.success(row.isAdmin === "1" ? "已取消管理员" : "已设为管理员")
  fetchUsers()
}

async function handleDeleteSingle(row: AdminUser) {
  await deleteUser([row.id])
  message.success("已删除")
  fetchUsers()
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return
  dialog.warning({
    title: "批量删除",
    content: `确定删除选中的 ${checkedRowKeys.value.length} 个用户吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await deleteUser(checkedRowKeys.value as number[])
      message.success("已删除")
      fetchUsers()
    },
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users-page">
    <n-h1 prefix="bar">
      <n-text type="primary">
        用户管理
      </n-text>
    </n-h1>
    <div class="toolbar">
      <n-button type="error" :disabled="checkedRowKeys.length === 0" @click="handleBatchDelete">
        批量删除 ({{ checkedRowKeys.length }})
      </n-button>
    </div>

    <n-data-table :columns="columns" :data="users" :loading="loading" :row-key="rowKey"
      :checked-row-keys="checkedRowKeys" :bordered="false" @update:checked-row-keys="checkedRowKeys = $event" />

    <div class="pagination-wrapper">
      <n-pagination v-model:page="page" :page-size="pageSize" :item-count="total" :page-sizes="[5, 10, 20, 50]"
        show-size-picker @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
    </div>
  </div>
</template>

<style scoped>
.users-page {
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
