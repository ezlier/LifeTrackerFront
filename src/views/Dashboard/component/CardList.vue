<template>
  <div class="card-list">
    <div v-if="items.length === 0" class="card-list-empty">
      暂无数据
    </div>
    <div v-else class="card-grid">
      <ItemCard v-for="item in items" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemRecord } from '@/api/item'
import ItemCard from '@/components/ItemCard.vue'

defineProps<{
  items: ItemRecord[]
}>()
</script>

<style scoped>
.card-list {
  width: 100%;
}

.card-list-empty {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
</style>
