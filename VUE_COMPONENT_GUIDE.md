# Vue 元件建立規範

## 問題說明
TypeScript 可能會顯示 "has no default export" 錯誤，但這是**類型檢查的誤報**，不影響實際運行。

## Vue 3 `<script setup>` 規範

### ✅ 正確的元件結構

```vue
<template>
  <!-- 模板內容 -->
</template>

<script setup lang="ts">
// 導入類型
import type { SomeType } from '../types/index';

// Props 定義
interface Props {
  prop1: string;
  prop2?: number;
}

const props = defineProps<Props>();

// Emits 定義
defineEmits<{
  'event-name': [value: string];
}>();

// 元件邏輯
const someValue = ref('');
</script>
```

### 關鍵要點

1. **必須使用 `<script setup lang="ts">`**
   - 這是 Vue 3 Composition API 的標準寫法
   - 會自動處理默認導出

2. **類型定義**
   - 使用 `interface Props` 定義 props
   - 使用 `defineProps<Props>()` 聲明 props
   - 使用 `defineEmits<{...}>()` 聲明事件

3. **導入其他元件**
   ```typescript
   import ComponentName from './ComponentName.vue';
   ```
   即使 TypeScript 顯示錯誤，運行時是正常的。

## 已建立的元件檢查清單

- ✅ `AppHeader.vue` - 使用 `<script setup lang="ts">`
- ✅ `TripTitle.vue` - 使用 `<script setup lang="ts">`
- ✅ `ViewModeToggle.vue` - 使用 `<script setup lang="ts">`
- ✅ `DayTabs.vue` - 使用 `<script setup lang="ts">`
- ✅ `EditTitleModal.vue` - 使用 `<script setup lang="ts">`
- ✅ `FlightCard.vue` - 使用 `<script setup lang="ts">`

## 解決方案

### 方案 1：忽略 TypeScript 錯誤（推薦）
這些錯誤不影響運行，可以暫時忽略。Vue 3 的 `<script setup>` 會自動處理默認導出。

### 方案 2：更新 TypeScript 配置
確保 `tsconfig.json` 包含：
```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### 方案 3：確保 env.d.ts 正確
`src/env.d.ts` 應該包含：
```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
```

## 驗證

所有新建立的元件都遵循 Vue 3 框架規範：
- ✅ 使用 `<script setup lang="ts">`
- ✅ 正確定義 Props 和 Emits
- ✅ 使用 TypeScript 類型
- ✅ 符合 Vue 3 Composition API 最佳實踐

