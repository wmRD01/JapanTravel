# UI 共用元件

這個目錄包含專案中使用的共用 UI 元件，用於統一應用程式的視覺風格和交互模式。

## 元件列表

### 1. Button（按鈕）

統一的按鈕元件，支援多種樣式和尺寸。

**使用範例：**

```vue
<template>
    <!-- 主要按鈕 -->
    <Button variant="primary" @click="handleClick">儲存</Button>

    <!-- 次要按鈕 -->
    <Button variant="secondary" @click="handleCancel">取消</Button>

    <!-- 危險按鈕 -->
    <Button variant="danger" @click="handleDelete">刪除</Button>

    <!-- 漸層按鈕 -->
    <Button variant="gradient" icon="ph-bold ph-save">儲存</Button>

    <!-- 全寬按鈕 -->
    <Button variant="primary" full-width>提交</Button>

    <!-- 不同尺寸 -->
    <Button size="sm">小按鈕</Button>
    <Button size="md">中按鈕</Button>
    <Button size="lg">大按鈕</Button>
</template>
```

**Props：**

-   `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' (預設: 'primary')
-   `size`: 'sm' | 'md' | 'lg' (預設: 'md')
-   `icon`: string - 圖標類名（例如: 'ph-bold ph-save'）
-   `text`: string - 按鈕文字
-   `disabled`: boolean - 是否禁用
-   `type`: 'button' | 'submit' | 'reset' (預設: 'button')
-   `fullWidth`: boolean - 是否全寬

---

### 2. Modal（模態框）

統一的模態框元件，用於顯示對話框和表單。

**使用範例：**

```vue
<template>
    <Modal
        v-model:open="isOpen"
        title="編輯標題"
        subtitle="請輸入新的標題"
        title-color="teal"
        size="md"
        @close="handleClose"
    >
        <input v-model="title" class="w-full border rounded-lg px-3 py-2" />

        <template #footer>
            <Button variant="secondary" @click="handleClose">取消</Button>
            <Button variant="primary" @click="handleSave">儲存</Button>
        </template>
    </Modal>
</template>
```

**Props：**

-   `open`: boolean - 是否顯示（支援 v-model:open）
-   `title`: string - 標題
-   `subtitle`: string - 副標題
-   `size`: 'sm' | 'md' | 'lg' (預設: 'md')
-   `titleColor`: 'teal' | 'blue' | 'orange' | 'red' (預設: 'teal')
-   `showClose`: boolean - 是否顯示關閉按鈕 (預設: true)
-   `closeOnBackdrop`: boolean - 點擊背景是否關閉 (預設: true)

**Slots：**

-   `default`: 主要內容
-   `header`: 自訂標題區域
-   `footer`: 底部按鈕區域

---

### 3. IconLabel（圖標標籤）

圖標與文字的組合元件，用於統一顯示圖標和文字的模式。

**使用範例：**

```vue
<template>
    <!-- 水平排列 -->
    <IconLabel icon="ph-bold ph-map-pin" text="地點" />

    <!-- 垂直排列 -->
    <IconLabel icon="ph-bold ph-calendar" text="日期" direction="col" />

    <!-- 不同變體 -->
    <IconLabel icon="ph-bold ph-check" text="成功" variant="success" />
    <IconLabel icon="ph-bold ph-warning" text="警告" variant="warning" />

    <!-- 使用 slot -->
    <IconLabel icon="ph-bold ph-user">
        <span class="font-bold">使用者名稱</span>
    </IconLabel>
</template>
```

**Props：**

-   `icon`: string - 圖標類名
-   `text`: string - 文字內容
-   `size`: 'xs' | 'sm' | 'md' | 'lg' (預設: 'md')
-   `variant`: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' (預設: 'default')
-   `direction`: 'row' | 'col' (預設: 'row')
-   `gap`: 'none' | 'sm' | 'md' | 'lg' (預設: 'md')

---

### 4. Card（卡片）

統一的卡片元件，用於顯示內容區塊。

**使用範例：**

```vue
<template>
    <!-- 基本卡片 -->
    <Card title="標題" padding="md">
        <p>卡片內容</p>
    </Card>

    <!-- 漸層卡片 -->
    <Card variant="gradient" title="總支出">
        <div class="text-white">內容</div>
    </Card>

    <!-- 帶有 header 和 footer -->
    <Card title="行程項目">
        <template #header-actions>
            <Button size="sm" variant="ghost" icon="ph-bold ph-plus">新增</Button>
        </template>
        <p>卡片內容</p>
        <template #footer>
            <Button variant="primary">確認</Button>
        </template>
    </Card>
</template>
```

**Props：**

-   `variant`: 'default' | 'gradient' | 'outlined' | 'elevated' (預設: 'default')
-   `title`: string - 標題
-   `padding`: 'none' | 'sm' | 'md' | 'lg' (預設: 'md')

**Slots：**

-   `default`: 主要內容
-   `header`: 自訂標題區域
-   `header-actions`: 標題右側操作按鈕
-   `footer`: 底部內容

---

## 使用建議

1. **優先使用共用元件**：當需要按鈕、模態框、卡片等 UI 元素時，優先使用這些共用元件，而不是直接寫 HTML 和 CSS。

2. **保持一致性**：使用共用元件可以確保整個應用程式的視覺風格保持一致。

3. **易於維護**：如果需要修改樣式，只需在共用元件中修改一次，所有使用該元件的地方都會自動更新。

4. **擴展性**：如果現有元件無法滿足需求，可以通過 props 和 slots 進行擴展，或創建新的變體。

---

## 未來擴展

可以考慮添加以下元件：

-   Input（輸入框）
-   Select（下拉選單）
-   Badge（標籤）
-   Loading（載入中）
-   Toast（提示訊息）
