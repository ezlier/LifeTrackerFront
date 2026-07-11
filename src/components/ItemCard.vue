<template>
  <router-link :to="`/item/${item.id}`" class="item-card-link">
    <div class="item-card">
      <div class="item-card-image">
        <img v-if="item.cover" :src="item.cover" class="item-card-cover" alt="cover" />
        <span v-else class="item-card-placeholder">LOADIMG...</span>
      </div>
      <div class="item-card-body">
        <h3 class="item-card-title">{{ item.title }}</h3>
        <div class="item-card-meta">
          <n-tag size="small" :bordered="false">{{ item.type }}</n-tag>
          <span class="item-card-time">{{ formatDate(item.createdAt) }}</span>
        </div>
        <p class="item-card-desc">{{ item.description || '暂无描述' }}</p>
        <div class="item-card-rating">
          <n-rate :value="displayRating(item.rating / 2)" readonly size="small" :count="5" allow-half />
          <span class="item-card-rating-text">{{ displayRating(item.rating) }}/10</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { ItemRecord } from '@/api/item'

defineProps<{
  item: ItemRecord
}>()

function displayRating(rating: number | null): number {
  return rating ?? 0
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
</script>

<style scoped>
.item-card-link {
  display: block;
  text-decoration: none;
}



.item-card {
  display: flex;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.item-card-image {
  flex: 0 0 100px;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-card-placeholder {
  font-size: 12px;
  color: var(--color-text-muted);
}

.item-card-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-card-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.item-card-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-card-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
}

.item-card-rating-text {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
