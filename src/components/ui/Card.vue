<template>
    <div :class="cardClasses">
        <div v-if="title || $slots.header" class="mb-4">
            <div v-if="title" class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
                <slot name="header-actions"></slot>
            </div>
            <slot name="header"></slot>
        </div>
        <div :class="bodyClasses">
            <slot></slot>
        </div>
        <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-slate-100">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    variant?: 'default' | 'gradient' | 'outlined' | 'elevated';
    title?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    padding: 'md',
});

const cardClasses = computed(() => {
    const base = 'rounded-xl shadow-sm';
    const variants = {
        default: 'bg-white border border-slate-100',
        gradient: 'bg-gradient-to-r from-teal-600 to-blue-500 text-white',
        outlined: 'bg-transparent border-2 border-slate-200',
        elevated: 'bg-white border border-slate-100 shadow-lg',
    };
    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };
    return `${base} ${variants[props.variant]} ${paddings[props.padding]}`;
});

const bodyClasses = computed(() => {
    return props.padding === 'none' ? '' : '';
});
</script>

