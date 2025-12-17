<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
      role="status"
      aria-live="polite"
    >
      <div class="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-5 text-center border border-slate-100">
        <!-- 動態圖示：外圈脈衝 + 內圈 icon 動畫 -->
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex w-14 h-14 rounded-full bg-teal-400/30 animate-ping"></span>
          <div
            class="relative mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white shadow-md"
          >
            <i :class="icon || 'ph-bold ph-spinner animate-spin'" class="text-xl"></i>
          </div>
        </div>
        <p class="mt-4 text-base font-bold text-slate-800 tracking-wide">
          {{ title || '處理中' }}
        </p>
        <p class="mt-1.5 text-sm text-slate-500 leading-relaxed">
          {{ message || '請稍候...' }}
        </p>
        <!-- 底部三個跳動的小點，營造等待感 -->
        <div class="mt-3 flex items-center justify-center gap-1.5">
          <span class="loading-dot animation-delay-0"></span>
          <span class="loading-dot animation-delay-1"></span>
          <span class="loading-dot animation-delay-2"></span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title?: string;
  message?: string;
  icon?: string;
}>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgb(45, 212, 191); /* teal-400 */
  animation: dot-bounce 1s infinite ease-in-out;
}

.animation-delay-0 {
  animation-delay: 0s;
}
.animation-delay-1 {
  animation-delay: 0.15s;
}
.animation-delay-2 {
  animation-delay: 0.3s;
}
</style>

