import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getItems,
  createItem,
  updateItem,
  deleteItems,
  type ItemRecord,
  type ItemQuery,
  type ItemCreate,
  type ItemUpdate,
} from '@/api/item'

export const useItemStore = defineStore('item', () => {
  const items = ref<ItemRecord[]>([])
  const total = ref(0)
  const current = ref(1)
  const pages = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItems(params?: ItemQuery) {
    loading.value = true
    error.value = null
    try {
      const data = await getItems(params)
      items.value = data.records
      total.value = data.total
      current.value = data.current
      pages.value = data.pages
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch items'
    } finally {
      loading.value = false
    }
  }

  async function addItem(data: ItemCreate) {
    loading.value = true
    error.value = null
    try {
      await createItem(data)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create item'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function editItem(data: ItemUpdate) {
    loading.value = true
    error.value = null
    try {
      await updateItem(data)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update item'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeItems(ids: number[]) {
    loading.value = true
    error.value = null
    try {
      await deleteItems(ids)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete items'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { items, total, current, pages, loading, error, fetchItems, addItem, editItem, removeItems }
})
