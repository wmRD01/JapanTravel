<template>
    <transition name="fade">
        <div
            v-if="open"
            class="fixed inset-0 z-[70] flex items-center justify-center p-4"
            @click.self="handleBackdropClick"
        >
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleBackdropClick"></div>

            <!-- Modal Content -->
            <div
                :class="contentClasses"
                class="relative bg-white rounded-2xl shadow-2xl animate-fade-in"
                @click.stop
            >
                <!-- Header -->
                <div v-if="title || $slots.header" class="flex justify-between items-center mb-4">
                    <div v-if="title" class="space-y-1">
                        <p :class="titleColorClass" class="text-lg font-bold">{{ title }}</p>
                        <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
                    </div>
                    <slot name="header"></slot>
                    <button
                        v-if="showClose"
                        @click="handleClose"
                        class="text-slate-400 hover:text-slate-600 transition"
                    >
                        <i class="ph-bold ph-x text-xl"></i>
                    </button>
                </div>

                <!-- Body -->
                <div class="space-y-4">
                    <slot></slot>
                </div>

                <!-- Footer -->
                <div v-if="$slots.footer" class="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    open: boolean;
    title?: string;
    subtitle?: string;
    size?: 'sm' | 'md' | 'lg';
    titleColor?: 'teal' | 'blue' | 'orange' | 'red';
    showClose?: boolean;
    closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    titleColor: 'teal',
    showClose: true,
    closeOnBackdrop: true,
});

const emit = defineEmits<{
    close: [];
    'update:open': [value: boolean];
}>();

const contentClasses = computed(() => {
    const sizes = {
        sm: 'w-full max-w-sm p-6',
        md: 'w-full max-w-md p-6',
        lg: 'w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto',
    };
    return sizes[props.size];
});

const titleColorClass = computed(() => {
    const colors = {
        teal: 'text-teal-600',
        blue: 'text-blue-500',
        orange: 'text-orange-500',
        red: 'text-red-500',
    };
    return colors[props.titleColor];
});

const handleClose = () => {
    emit('close');
    emit('update:open', false);
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        handleClose();
    }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.animate-fade-in {
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>

