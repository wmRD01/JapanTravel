<template>
    <div :class="containerClasses">
        <i v-if="icon" :class="iconClasses"></i>
        <span v-if="$slots.default || text" :class="textClasses">
            <slot>{{ text }}</slot>
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    icon?: string;
    text?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    direction?: 'row' | 'col';
    gap?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    variant: 'default',
    direction: 'row',
    gap: 'md',
});

const containerClasses = computed(() => {
    const direction = props.direction === 'row' ? 'flex-row items-center' : 'flex-col items-center';
    const gaps = {
        none: 'gap-0',
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
    };
    return `flex ${direction} ${gaps[props.gap]}`;
});

const iconClasses = computed(() => {
    const iconBase = props.icon || '';
    const sizeMap = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };
    const variantMap = {
        default: 'text-slate-600',
        primary: 'text-teal-600',
        secondary: 'text-slate-400',
        success: 'text-green-600',
        warning: 'text-orange-500',
        danger: 'text-red-500',
    };
    return `${iconBase} ${sizeMap[props.size]} ${variantMap[props.variant]}`;
});

const textClasses = computed(() => {
    const sizeMap = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };
    const variantMap = {
        default: 'text-slate-700',
        primary: 'text-teal-700',
        secondary: 'text-slate-500',
        success: 'text-green-700',
        warning: 'text-orange-600',
        danger: 'text-red-600',
    };
    return `${sizeMap[props.size]} ${variantMap[props.variant]}`;
});
</script>

