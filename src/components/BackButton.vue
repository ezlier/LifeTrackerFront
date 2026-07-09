<template>
    <button @click="goBack" class="back-btn">
        <span class="back-btn__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64"></path>
                <path fill="currentColor"
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z">
                </path>
            </svg>
        </span>
    </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
    router.back()
}

function goForward() {
    router.forward()
}
</script>

<style scoped>
.back-btn {
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

.back-btn:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: scale(1.08);
}

.dark .back-btn {
    background: rgba(255, 255, 255, 0.06);
}

.dark .back-btn:hover {
    background: rgba(255, 255, 255, 0.12);
}

.back-btn__icon {
    line-height: 1;
    color: var(--color-text);
    width: 24px;
    height: 24px;
}
</style>
