<script setup lang="ts">
import SideNav from './component/SideNav.vue'
import Nav from './component/Nav.vue'
</script>

<template>
  <div class="container">
    <SideNav class="sidenav" />
    <main class="main">
      <Nav />
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100%;
}

.sidenav {
  flex: 0 0 15%;
}

.main {
  flex: 80%;
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  margin: 0 auto;
}

</style>
