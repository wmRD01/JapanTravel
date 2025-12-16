<template>
    <button :type="type" :disabled="disabled" :class="buttonClasses" @click="$emit('click', $event)">
        <i v-if="icon" :class="iconClass"></i>
        <span v-if="$slots.default || text">
            <slot>{{ text }}</slot>
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    text?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
    fullWidth: false,
});

defineEmits<{
    click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
    const base = 'font-semibold transition-all flex items-center justify-center gap-2';
    const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

    // Variant styles
    const variants = {
        primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md',
        secondary: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
        ghost: 'text-slate-600 hover:bg-slate-100',
        gradient: 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg',
    };

    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-2xl',
    };

    const width = props.fullWidth ? 'w-full' : '';

    return `${base} ${variants[props.variant]} ${sizes[props.size]} ${width} ${disabledClass}`;
});

const iconClass = computed(() => {
    const iconBase = props.icon || '';
    const sizeMap = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };
    return `${iconBase} ${sizeMap[props.size]}`;
});
</script>
