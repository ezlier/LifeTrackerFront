<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useDialog, useMessage } from "naive-ui"
import { getBillList, createBill, deleteBill, uploadBillFile, type Bill, type BillListParams } from "@/api/bill"

const dialog = useDialog()
const message = useMessage()

// ----------- data -----------
const bills = ref<Bill[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const incomeFilter = ref<string | undefined>(undefined)

// ----------- modals -----------
const showCreate = ref(false)
const showUpload = ref(false)
const submitting = ref(false)

const form = ref({
  counterparty: "",
  goods: "",
  income: "支出",
  money: 0 as number | null,
  tradingHours: null as number | null,
})

function resetForm() {
  form.value = { counterparty: "", goods: "", income: "支出", money: null, tradingHours: null }
}

// ----------- fetch -----------
async function fetchBills(append = false) {
  loading.value = true
  try {
    const params: BillListParams = { pageNum: page.value, pageSize: pageSize.value }
    if (incomeFilter.value) params.income = incomeFilter.value
    const res = await getBillList(params)
    if (append) {
      bills.value.push(...res.list)
    } else {
      bills.value = res.list
    }
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function loadNext() {
  page.value++
  fetchBills(true)
}

function switchFilter(filter: string | undefined) {
  incomeFilter.value = filter
  page.value = 1
  bills.value = []
  fetchBills()
}

const hasMore = computed(() => bills.value.length < total.value)

// ----------- create -----------
async function handleCreate() {
  if (!form.value.counterparty || !form.value.goods || form.value.money == null) return
  submitting.value = true
  try {
    await createBill({
      counterparty: form.value.counterparty,
      goods: form.value.goods,
      income: form.value.income,
      money: form.value.money,
      tradingHours: form.value.tradingHours
        ? new Date(form.value.tradingHours).toISOString().slice(0, 19)
        : new Date().toISOString().slice(0, 19),
    })
    message.success("创建成功")
    showCreate.value = false
    resetForm()
    page.value = 1
    bills.value = []
    fetchBills()
  } finally {
    submitting.value = false
  }
}

// ----------- delete -----------
async function handleDelete(bill: Bill) {
  dialog.warning({
    title: "删除账单",
    content: `确定删除与「${bill.counterparty}」的账单吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      await deleteBill([bill.id])
      message.success("已删除")
      bills.value = bills.value.filter((b) => b.id !== bill.id)
      total.value--
    },
  })
}

// ----------- upload -----------
const uploadRef = ref<HTMLInputElement | null>(null)
function handleUploadFile() {
  uploadRef.value?.click()
}
async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    await uploadBillFile(file)
    message.success("上传成功")
    showUpload.value = false
    page.value = 1
    bills.value = []
    fetchBills()
  } catch {
    message.error("上传失败")
  } finally {
    target.value = ""
  }
}

// ----------- format -----------
function formatMoney(m: number): string {
  return m.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatTime(t: string): string {
  if (!t) return "-"
  return new Date(t).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

onMounted(() => fetchBills())
</script>

<template>
  <div class="bill-page">
    <!-- ====== Toolbar ====== -->
    <div class="bill-toolbar">
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: incomeFilter === undefined }"
          @click="switchFilter(undefined)"
        >
          全部
        </button>
        <button
          class="filter-tab"
          :class="{ active: incomeFilter === '收入' }"
          @click="switchFilter('收入')"
        >
          收入
        </button>
        <button
          class="filter-tab"
          :class="{ active: incomeFilter === '支出' }"
          @click="switchFilter('支出')"
        >
          支出
        </button>
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-secondary" @click="showUpload = true">上传</button>
        <button class="btn btn-primary" @click="showCreate = true">+ 新建</button>
      </div>
    </div>

    <!-- ====== Empty State ====== -->
    <div v-if="!loading && bills.length === 0" class="empty-state">
      <p class="empty-text">暂无账单记录</p>
      <button class="btn btn-primary" @click="showCreate = true">添加第一笔账单</button>
    </div>

    <!-- ====== Card Grid ====== -->
    <div class="card-grid">
      <div v-for="bill in bills" :key="bill.id" class="bill-card">
        <!-- card header -->
        <div class="card-header">
          <span class="counterparty">{{ bill.counterparty }}</span>
          <span class="income-badge" :class="bill.income">
            {{ bill.income }}
          </span>
        </div>

        <!-- card body -->
        <div class="card-body">
          <div class="field-row">
            <span class="field-label">商品</span>
            <span class="field-value">{{ bill.goods }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">金额</span>
            <span class="field-value money" :class="bill.income">
              ¥ {{ formatMoney(bill.money) }}
            </span>
          </div>
          <div class="field-row">
            <span class="field-label">时间</span>
            <span class="field-value time">{{ formatTime(bill.tradingHours) }}</span>
          </div>
        </div>

        <!-- card footer -->
        <div class="card-footer">
          <button class="btn btn-danger" @click="handleDelete(bill)">删除</button>
        </div>
      </div>
    </div>

    <!-- ====== Loading ====== -->
    <div v-if="loading" class="load-state">
      <span class="loading-text">加载中...</span>
    </div>

    <!-- ====== Load More ====== -->
    <div v-else-if="hasMore" class="load-state">
      <button class="btn btn-secondary" @click="loadNext">加载更多</button>
    </div>
    <div v-else-if="bills.length > 0" class="load-state">
      <span class="no-more">没有更多了</span>
    </div>

    <!-- ====== Create Modal ====== -->
    <n-modal v-model:show="showCreate" preset="card" title="新建账单" style="width: 480px" :bordered="false">
      <n-form label-placement="left" label-width="72">
        <n-form-item label="交易对方" required>
          <n-input v-model:value="form.counterparty" placeholder="请输入交易对方" />
        </n-form-item>
        <n-form-item label="商品" required>
          <n-input v-model:value="form.goods" placeholder="请输入商品名称" />
        </n-form-item>
        <n-form-item label="类型" required>
          <n-select
            v-model:value="form.income"
            :options="[
              { label: '收入', value: '收入' },
              { label: '支出', value: '支出' },
            ]"
          />
        </n-form-item>
        <n-form-item label="金额" required>
          <n-input-number v-model:value="form.money" placeholder="请输入金额" :min="0" />
        </n-form-item>
        <n-form-item label="交易时间">
          <n-date-picker v-model:value="form.tradingHours" type="datetime" clearable />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreate = false">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleCreate">
            {{ submitting ? "创建中..." : "确认" }}
          </button>
        </div>
      </template>
    </n-modal>

    <!-- ====== Upload Modal ====== -->
    <n-modal v-model:show="showUpload" preset="card" title="上传账单" style="width: 420px" :bordered="false">
      <p style="margin: 0 0 16px; color: var(--color-text-muted); font-size: 14px">
        上传 .xlsx 文件批量导入账单
      </p>
      <input ref="uploadRef" type="file" accept=".xlsx,.xls" style="display: none" @change="onFileChange" />
      <button class="btn btn-primary btn-block" @click="handleUploadFile">选择文件</button>
      <template #footer>
        <button class="btn btn-secondary" @click="showUpload = false">关闭</button>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.bill-page {
  padding: 24px 32px;
  height: 100%;
  overflow-y: auto;
}

/* ===== Toolbar ===== */
.bill-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: var(--color-ui);
  padding: 3px;
  border-radius: 8px;
}

.filter-tab {
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s;
  min-height: 36px;
}

.filter-tab:hover {
  color: var(--color-text);
}

.filter-tab.active {
  background: var(--color-card-bg);
  color: var(--color-text);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

/* ===== Buttons ===== */
.btn {
  border: none;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 40px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #b15e6c;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #9d4f5d;
}

.btn-secondary {
  background: var(--color-ui);
  color: var(--color-text);
  border: 1px solid var(--color-ui2);
}

.btn-secondary:hover {
  border-color: #b15e6c;
  color: #b15e6c;
}

.btn-danger {
  background: transparent;
  color: #d15252;
  border: 1px solid #e8b4b4;
  padding: 4px 14px;
  min-height: 34px;
}

.btn-danger:hover {
  background: #fef2f2;
  border-color: #d15252;
}

.btn-block {
  width: 100%;
}

/* ===== Empty ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 16px;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
}

/* ===== Card Grid ===== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* ===== Bill Card ===== */
.bill-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-ui);
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s;
}

.bill-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.counterparty {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.income-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}

.income-badge.收入 {
  background: #e6f7ec;
  color: #1a8a4a;
}

.income-badge.支出 {
  background: #fde8e8;
  color: #c24141;
}

/* Card body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.field-value {
  font-size: 14px;
  color: var(--color-text);
}

.field-value.time {
  font-size: 13px;
  color: var(--color-text-muted);
}

.field-value.money.收入 {
  color: #1a8a4a;
  font-weight: 600;
}

.field-value.money.支出 {
  color: #c24141;
  font-weight: 600;
}

/* Card footer */
.card-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

/* ===== Load states ===== */
.load-state {
  display: flex;
  justify-content: center;
  padding: 28px 0;
}

.loading-text {
  font-size: 13px;
  color: var(--color-text-muted);
}

.no-more {
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* ===== Modal ===== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
