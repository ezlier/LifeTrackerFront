<script setup lang="ts"></script>

<template>
  <div class="flex items-center justify-center h-full p-8">
    <div class="text-center">
      <div class="text-7xl mb-4 text-slate-300">404</div>
      <h2 class="text-xl font-semibold text-slate-700">页面不存在</h2>
      <p class="mt-2 mb-6 text-sm text-slate-400">你访问的路径似乎不存在</p>
      <router-link
        to="/dashboard"
        class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
      >
        返回首页
      </router-link>
    </div>
  </div>
</template>
