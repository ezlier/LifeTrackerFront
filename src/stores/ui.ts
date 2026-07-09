import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const isDark = ref(false)

  function apply() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // init from system preference or localStorage
  const saved = localStorage.getItem('theme')
  if (saved !== null) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  apply()

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    apply()
  })

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleTheme }
})
