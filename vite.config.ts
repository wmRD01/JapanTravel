import vue from '@vitejs/plugin-vue';
import obfuscator from 'rollup-plugin-obfuscator';
import { defineConfig } from 'vite';

//開關log要修改三個地方disableConsoleOutput、drop_console、drop_debugger

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [
            vue({
                script: {
                    defineModel: true,
                    propsDestructure: true,
                },
            }),
        ],
        base: './',             // 若要相對路徑部署可加這行
        resolve: {
            alias: {
                vue: 'vue/dist/vue.esm-bundler.js',
            },
        },
        define: {
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        },
        build: {
            outDir: 'docs',  // 你希望的輸出資料夾
            emptyOutDir: true,     // 建議清空舊輸出
            minify: 'terser', // 使用 terser 進行壓縮（支援移除 console）
            terserOptions: {
                compress: {
                    drop_console: true, // 移除所有 console.* 調用（console.log, console.warn, console.error 等）
                    drop_debugger: true, // 移除 debugger 語句
                },
            },
            rollupOptions: {
                plugins: [
                    // 只在 production 模式下啟用混淆
                    isProduction && obfuscator({
                        // 排除 Firebase 相關檔案，保護動態導入和關鍵功能
                        exclude: [
                            '**/constants/index.js',
                            '**/constants/index.ts',
                            '**/services/firebase.js',
                            '**/services/firebase.ts',
                            '**/services/cloudTripService.js',
                            '**/services/cloudTripService.ts',
                        ],
                        // rollup-plugin-obfuscator 的配置結構
                        options: {
                            // 基本混淆選項
                            compact: true,
                            identifierNamesGenerator: 'hexadecimal',
                            log: false,
                            numbersToExpressions: true,
                            renameGlobals: false,
                            simplify: true,

                            // 控制流混淆（適度使用，避免影響 Firebase）
                            controlFlowFlattening: false, // 關閉以避免影響 Firebase 調用
                            controlFlowFlatteningThreshold: 0,

                            // 死碼注入（關閉以避免影響 Firebase）
                            deadCodeInjection: false,
                            deadCodeInjectionThreshold: 0,

                            // 自我防護（關閉以避免影響 Firebase 模組載入）
                            selfDefending: false,

                            // 字串處理（關鍵：保護 Firebase 集合名稱，但混淆 API Key）
                            splitStrings: false, // 關閉字串分割，保護 Firestore 集合名稱
                            splitStringsChunkLength: 0,
                            stringArray: true,
                            stringArrayCallsTransform: false, // 關閉以避免影響 Firebase API 調用
                            stringArrayEncoding: ['base64', 'rc4'], // 使用多種編碼隱藏 API Key
                            stringArrayIndexShift: true,
                            stringArrayRotate: true,
                            stringArrayShuffle: true,
                            stringArrayWrappersCount: 5, // 增加包裝層數，加強隱藏
                            stringArrayWrappersChainedCalls: true,
                            stringArrayWrappersParametersMaxCount: 5,
                            stringArrayWrappersType: 'function',
                            stringArrayThreshold: 0.85, // 85% 字串放入陣列（保留 Firebase URL 等關鍵字串）

                            // 物件鍵轉換（關閉以避免影響 Firebase 資料結構）
                            transformObjectKeys: false,

                            // 其他選項
                            debugProtection: false,
                            debugProtectionInterval: 0,
                            disableConsoleOutput: true, // 移除 console 輸出（與 terser 配合）
                            unicodeEscapeSequence: true, // 啟用 Unicode 轉義，加強隱藏

                            // 保留關鍵字串（Firebase 集合名稱和 API 方法，但不包括 API Key）
                            reservedStrings: [
                                // Firestore 集合名稱
                                'trips',
                                'days',
                                'sharedExpenses',
                                'personalExpenses',
                                // Firebase API 方法
                                'collection',
                                'doc',
                                'getDocs',
                                'setDoc',
                                'addDoc',
                                'deleteDoc',
                                'query',
                                'where',
                                'getDoc',
                                'writeBatch',
                                'Timestamp',
                                'getFirestore',
                                'firestore',
                                'initializeApp',
                                // URL 相關
                                'code',
                                'origin',
                                'pathname',
                                'search',
                                // Firebase 配置欄位名稱（但值會被混淆）
                                'authDomain',
                                'projectId',
                                'storageBucket',
                                'messagingSenderId',
                                'appId',
                                // Firebase CDN URL 完整字串（保護動態導入，必須完整匹配）
                                'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
                                'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js',
                                'https://www.gstatic.com/firebasejs/',
                                'firebase-app.js',
                                'firebase-firestore.js',
                                'gstatic.com',
                                'firebasejs',
                                '10.7.1',
                            ],

                            // 保留關鍵識別符（避免混淆 Firebase 相關變數）
                            reservedNames: [
                                'collection',
                                'doc',
                                'getDocs',
                                'setDoc',
                                'addDoc',
                                'deleteDoc',
                                'query',
                                'where',
                                'getDoc',
                                'writeBatch',
                                'Timestamp',
                                'getFirestore',
                                'firestore',
                                'initializeApp',
                                'firestoreDb',
                                'firestoreModule',
                                'FirebaseConfig',
                                'FIREBASE_APP_URL',
                                'FIREBASE_FIRESTORE_URL',
                                'FIREBASE_VERSION',
                                'loadFirebaseApp',
                                'loadFirebaseFirestore',
                                'firebaseAppModule',
                                'firebaseFirestoreModule',
                                'window',
                                'navigator',
                                'clipboard',
                                'location',
                                'URLSearchParams',
                            ],
                        },
                    }),
                ].filter(Boolean), // 過濾掉 false 值
            },
        }
    };
});

