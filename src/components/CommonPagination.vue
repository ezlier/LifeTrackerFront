<template>
  <div class="pagination">
    <n-pagination
      :page="currentPage"
      :page-size="pageSize"
      :item-count="total"
      :page-slot="7"
      @update:page="$emit('change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  pageSize: number
  total: number
}>()

defineEmits<{
  change: [page: number]
}>()
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}
</style>
