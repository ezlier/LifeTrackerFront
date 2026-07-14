<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { getUser, updateUser, changePassword, type User } from '@/api/user'
import { getTypePieChartData, getDurationPieChartData, getFocusStatusPieChartData } from '@/api/heatmap'
import HeatMap from '@/views/Dashboard/component/HeatMap.vue'

type UserProfile = User & { introduction?: string | null }

interface MediaItem {
  key: string
  label: string
  value: number
}

const message = useMessage()

const user = ref<UserProfile>()
const userLoading = ref(false)
const userError = ref('')
const mediaLoading = ref(false)
const mediaError = ref('')
const mediaRecord = ref<Record<string, number>>({})
const durationRecord = ref<Record<string, number>>({})
const durationLoading = ref(false)
const durationError = ref('')
const focusStatusRecord = ref<Record<string, number>>({})
const focusStatusLoading = ref(false)
const focusStatusError = ref('')



const showProfileDialog = ref(false)
const showPasswordDialog = ref(false)

const profileForm = reactive({
  name: '',
  Email: '',
  phone: '',
  avatar: '',
  Introduction: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const mediaLabels: Record<string, string> = {
  anime: '动画',
  book: '书籍',
  movie: '电影',
  tv: '电视剧',
  game: '游戏',
  music: '音乐',
}

const mediaOrder = ['book', 'movie', 'tv', 'anime', 'game', 'music']

const introduction = computed(() =>
  user.value?.introduction
  ?? user.value?.Introduction
  ?? '这个人很安静，还没有写下个人介绍。',
)


const mediaItems = computed<MediaItem[]>(() =>
  Object.entries(mediaRecord.value)
    .map(([key, value]) => ({
      key,
      label: mediaLabels[key] ?? key,
      value: Number(value) || 0,
    }))
    .sort((a, b) => {
      const aIndex = mediaOrder.indexOf(a.key)
      const bIndex = mediaOrder.indexOf(b.key)
      if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    }),
)

const mediaTotal = computed(() =>
  mediaItems.value.reduce((sum, item) => sum + item.value, 0),
)

async function loadUser() {
  userLoading.value = true
  userError.value = ''
  try {
    user.value = await getUser()
  } catch (error) {
    userError.value = error instanceof Error ? error.message : '用户资料加载失败'
  } finally {
    userLoading.value = false
  }
}

async function loadMedia() {
  mediaLoading.value = true
  mediaError.value = ''
  try {
    mediaRecord.value = await getTypePieChartData()
  } catch (error) {
    mediaError.value = error instanceof Error ? error.message : 'Media 数据加载失败'
  } finally {
    mediaLoading.value = false
  }
}

async function loadDuration() {
  durationLoading.value = true
  durationError.value = ''
  try {
    durationRecord.value = await getDurationPieChartData()
  } catch (error) {
    durationError.value = error instanceof Error ? error.message : 'Duration 数据加载失败'
  } finally {
    durationLoading.value = false
  }
}

async function loadFocusStatus() {
  focusStatusLoading.value = true
  focusStatusError.value = ''
  try {
    const raw = await getFocusStatusPieChartData() as unknown as Array<{ cnt: number; status: string }>
    const record: Record<string, number> = {}
    for (const item of raw) {
      record[item.status] = item.cnt
    }
    focusStatusRecord.value = record
  } catch (error) {
    focusStatusError.value = error instanceof Error ? error.message : 'FocusStatus 数据加载失败'
  } finally {
    focusStatusLoading.value = false
  }
}



function openProfileDialog() {
  if (!user.value) return

  profileForm.name = user.value.name ?? ''
  profileForm.Email = user.value.email ?? ''
  profileForm.phone = String(user.value.phone ?? '')
  profileForm.avatar = user.value.avatar ?? ''
  profileForm.Introduction = introduction.value
  showProfileDialog.value = true
}

async function confirmProfile() {
  if (!user.value || !profileForm.name.trim()) {
    message.warning('姓名不能为空')
    return false
  }

  try {
    const updated = await updateUser({
      name: profileForm.name.trim(),
      Email: profileForm.Email.trim() || undefined,
      phone: profileForm.phone ? Number(profileForm.phone) : undefined,
      avatar: profileForm.avatar.trim() || undefined,
      Introduction: profileForm.Introduction.trim() || undefined,
    } as any)

    user.value = {
      ...user.value,
      name: updated?.name ?? profileForm.name.trim(),
      email: updated?.email ?? profileForm.Email.trim(),
      phone: (String(updated?.phone ?? profileForm.phone) || ''),
      avatar: (updated?.avatar ?? profileForm.avatar.trim()) || null,
      Introduction: ((updated as any)?.Introduction ?? profileForm.Introduction.trim()) || null,
    }
    message.success('资料修改成功')
    return true
  } catch (error) {
    message.error(error instanceof Error ? error.message : '修改失败')
    return false
  }
}

function openPasswordDialog() {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showPasswordDialog.value = true
}

async function confirmPassword() {
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    message.warning('请填写当前密码和新密码')
    return false
  }
  if (passwordForm.newPassword.length < 6) {
    message.warning('新密码至少需要 6 位')
    return false
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入的新密码不一致')
    return false
  }

  try {
    await changePassword({
      password: passwordForm.currentPassword,
      newPwd: passwordForm.newPassword,
      newPwd2: passwordForm.confirmPassword,
    })
    message.success('密码修改成功')
    return true
  } catch (error) {
    message.error(error instanceof Error ? error.message : '密码修改失败')
    return false
  }
}

onMounted(() => {
  void loadUser()
  void loadMedia()
  void loadDuration()
  void loadFocusStatus()
})
</script>

<template>
  <div class="settings-page">
    <n-alert v-if="userError" type="error" closable @close="userError = ''">
      {{ userError }}
    </n-alert>

    <section class="profile-panel surface-panel">
      <div class="avatar-wrap">
        <n-avatar :size="120" :src="user?.avatar || undefined" object-fit="cover" class="profile-avatar" />

      </div>

      <div class="profile-content">
        <div class="profile-name-row">
          <span class="eyebrow">PROFILE</span>
          <h1>{{ userLoading ? '加载中…' : (user?.name || '未命名用户') }}</h1>
        </div>
        <div class="introduction-box">
          <span class="introduction-label">INTRODUCTION</span>
          <p>{{ introduction }}</p>
        </div>
      </div>

      <div class="profile-actions">
        <n-button type="primary" :disabled="!user" @click="openProfileDialog">
          编辑资料
        </n-button>
        <n-button :disabled="!user" @click="openPasswordDialog">
          修改密码
        </n-button>
      </div>
    </section>

    <div class="settings-grid">
      <main class="settings-main">
        <section class="heatmap-panel surface-panel">
          <div class="section-heading">
            <div>
              <span class="eyebrow">ACTIVITY</span>
              <h2>年度热力图</h2>
            </div>
          </div>
          <div class="heatmap-content">
            <HeatMap />
          </div>
        </section>

        <div class="number-grid">
          <section class="number-card surface-panel">
            <span class="number-title">累计专注</span>
            <n-statistic label="你一共专注了" tabular-nums>
              <n-number-animation ref="numberAnimationInstRef" :from="0" :to="durationRecord.totalActualDuration / 60" />
              <template #suffix>
                分钟
              </template>
            </n-statistic>
            <n-space vertical>
              花时间、花精力、花心思，愿你每一份努力都不负所望
            </n-space>
          </section>
          <section class="number-card surface-panel">
            <span class="number-title">完成记录</span>
            <n-statistic label="你一共完成了" tabular-nums>
              <n-number-animation ref="numberAnimationInstRef" :from="0" :to="focusStatusRecord['completed'] || 0" />
              <template #suffix>
                次
              </template>
            </n-statistic>
            <n-space vertical>
              时间会告诉我们答案的
            </n-space>
          </section>
        </div>
      </main>

      <aside class="media-panel surface-panel">
        <div class="media-heading">
          <div>
            <span class="eyebrow">LIBRARY</span>
            <h2>Media</h2>
          </div>
          <n-tag round :bordered="false">{{ mediaTotal }}</n-tag>
        </div>

        <n-spin :show="mediaLoading">
          <n-alert v-if="mediaError" type="error" class="media-error">
            {{ mediaError }}
          </n-alert>
          <ul v-else-if="mediaItems.length" class="media-list">
            <li v-for="item in mediaItems" :key="item.key" class="media-item">
              <span class="media-label">
                <i class="media-dot" />
                {{ item.label }}
              </span>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
          <n-empty v-else description="暂无 Media 数据" size="small" />
        </n-spin>
      </aside>
    </div>

    <n-modal v-model:show="showProfileDialog" preset="dialog" title="编辑资料" positive-text="确认" negative-text="取消"
      class="settings-dialog" @positive-click="confirmProfile">
      <n-form label-placement="top" class="dialog-form">
        <div class="dialog-form-grid">
          <n-form-item label="姓名" required>
            <n-input v-model:value="profileForm.name" placeholder="请输入姓名" />
          </n-form-item>
          <n-form-item label="邮箱">
            <n-input v-model:value="profileForm.Email" placeholder="请输入邮箱" />
          </n-form-item>
          <n-form-item label="手机号码">
            <n-input v-model:value="profileForm.phone" placeholder="请输入手机号码" />
          </n-form-item>
          <n-form-item label="头像 URL">
            <n-input v-model:value="profileForm.avatar" placeholder="请输入头像地址" />
          </n-form-item>
        </div>
        <n-form-item label="个人简介">
          <n-input v-model:value="profileForm.Introduction" type="textarea" placeholder="介绍一下自己"
            :autosize="{ minRows: 3, maxRows: 6 }" />
        </n-form-item>
      </n-form>
    </n-modal>

    <n-modal v-model:show="showPasswordDialog" preset="dialog" title="修改密码" positive-text="确认" negative-text="取消"
      class="settings-dialog" @positive-click="confirmPassword">
      <n-form label-placement="top" class="dialog-form">
        <n-form-item label="当前密码" required>
          <n-input v-model:value="passwordForm.currentPassword" type="password" show-password-on="click"
            placeholder="请输入当前密码" />
        </n-form-item>
        <n-form-item label="新密码" required>
          <n-input v-model:value="passwordForm.newPassword" type="password" show-password-on="click"
            placeholder="至少 6 位" />
        </n-form-item>
        <n-form-item label="确认新密码" required>
          <n-input v-model:value="passwordForm.confirmPassword" type="password" show-password-on="click"
            placeholder="请再次输入新密码" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<style scoped>
.settings-page {
  width: 100%;
  box-sizing: border-box;
  padding: 28px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.surface-panel {
  background: color-mix(in srgb, var(--color-card-bg) 92%, transparent);
  border: 1px solid var(--color-card-border);
  border-radius: var(--border-radius);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  transition: all 0.3s ease-in-out;
}

.profile-panel {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr) auto;
  gap: 28px;
  align-items: stretch;
  padding: 24px;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar {
  border: 3px solid color-mix(in srgb, var(--color-sidebar-text-active) 55%, transparent);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);
  font-size: 34px;
  font-weight: 700;
}

.profile-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-name-row h1,
.section-heading h2,
.media-heading h2 {
  margin: 3px 0 0;
  color: var(--color-text);
}

.profile-name-row h1 {
  font-size: 24px;
  line-height: 1.2;
}

.eyebrow {
  display: block;
  color: var(--color-sidebar-text-active);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.introduction-box {
  position: relative;
  min-height: 72px;
  box-sizing: border-box;
  padding: 22px 18px 14px;
  border: 1px solid color-mix(in srgb, var(--color-card-border) 60%, transparent);
  border-radius: var(--border-radius);
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  transition: all 0.3s ease-in-out;
}

.introduction-label {
  position: absolute;
  top: 7px;
  left: 18px;
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.3px;
}

.introduction-box p {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.profile-actions {
  min-width: 112px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 20px;
  align-items: stretch;
}

.settings-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.heatmap-panel,
.media-panel,
.number-card {
  padding: 20px;
}

.section-heading,
.media-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-heading h2,
.media-heading h2 {
  font-size: 18px;
}

.heatmap-content {
  width: 100%;
  min-height: 210px;
  overflow-x: auto;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.number-card {
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.number-title {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
}

.number-placeholder {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed color-mix(in srgb, var(--color-sidebar-text-active) 45%, transparent);
  border-radius: 9px;
  color: var(--color-sidebar-text-active);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
}

.media-panel {
  min-height: 386px;
}

.media-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.media-item {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--color-card-border) 22%, transparent);
  color: var(--color-text);
}

.media-item:last-child {
  border-bottom: 0;
}

.media-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--color-text-muted);
}

.media-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--color-sidebar-text-active);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-sidebar-text-active) 14%, transparent);
}

.media-item strong {
  font-variant-numeric: tabular-nums;
}

.media-error {
  margin-bottom: 12px;
}

.dialog-form {
  margin-top: 16px;
}

.dialog-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
}

:global(.settings-dialog) {
  width: min(560px, calc(100vw - 32px));
}

@media (max-width: 900px) {
  .profile-panel {
    grid-template-columns: 112px minmax(0, 1fr);
  }

  .profile-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .profile-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .media-panel {
    min-height: 0;
  }

  .media-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
  }
}

@media (max-width: 600px) {
  .settings-page {
    padding: 18px 14px 36px;
  }

  .profile-panel {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 20px;
  }

  .profile-content {
    text-align: center;
  }

  .introduction-label {
    right: 18px;
  }

  .profile-actions {
    grid-column: auto;
    justify-content: center;
  }

  .number-grid,
  .dialog-form-grid,
  .media-list {
    grid-template-columns: 1fr;
  }

  .heatmap-panel,
  .media-panel,
  .number-card {
    padding: 16px;
  }
}
</style>
