<script setup lang="ts">
function scrollToTop() {
    window.scrollTo({ top: 0 })
}
</script>

<template>
    <button @click="scrollToTop" class="to-top-btn">
        <span class="to-top-btn__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                    d="M572.235 205.282v600.365a30.118 30.118 0 1 1-60.235 0V205.282L292.382 438.633a28.913 28.913 0 0 1-42.646 0 33.43 33.43 0 0 1 0-45.236l271.058-288.045a28.913 28.913 0 0 1 42.647 0L834.5 393.397a33.43 33.43 0 0 1 0 45.176 28.913 28.913 0 0 1-42.647 0l-219.618-233.23z">
                </path>
            </svg>
        </span>
    </button>
</template>

<style scoped>
.to-top-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.04);
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s, transform 0.15s;
    overflow: hidden;
    position: relative;
    z-index: 10;
}

.to-top-btn:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: scale(1.08);
}

.dark .to-top-btn {
    background: rgba(255, 255, 255, 0.06);
}

.dark .to-top-btn:hover {
    background: rgba(255, 255, 255, 0.12);
}

.to-top-btn__icon {
    line-height: 1;
    color: var(--color-text);
    width: 24px;
    height: 24px;
}
</style>
