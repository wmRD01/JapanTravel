// 日本東京富士行程與預設支出資料（TypeScript 版）
import type { Day, Expense, FirebaseConfig as FirebaseConfigType } from '../src/types';

export const JP_TRIP_ID = 'trip_japan_2025_feb';

export const JP_TRIP_DATA: Day[] = [
    {
        date: '02/17 (一)',
        shortDate: '02/17',
        fullDate: '2025-02-17',
        title: '抵達日本・成田住宿',
        flight: {
            type: 'arrival',
            startTime: '12:50',
            startAirport: 'TPE',
            number: 'FLIGHT',
            endTime: '16:50',
            endAirport: 'NRT',
            arrivalOffset: 0,
        },
        items: [
            {
                time: '16:50',
                type: 'transport',
                activity: '抵達日本',
                location: 'Narita International Airport',
                note: '第二航廈',
            },
            {
                time: '19:00',
                type: 'spot',
                activity: '飯店 Check-in',
                location: 'HOTEL MYSTAYS Narita',
                note: '熟悉周邊便利店超市',
            },
        ],
    },
    {
        date: '02/18 (二)',
        shortDate: '02/18',
        fullDate: '2025-02-18',
        title: '箱根・蘆之湖・溫泉',
        flight: null,
        items: [
            { time: '10:00', type: 'transport', activity: '新船橋取車', location: 'Funabashi', note: '確認租車文件、導航設定好目的地' },
            { time: '10:00', type: 'food', activity: '開車前往海老名服務區', location: 'Ebina SA', note: '上洗手間、買點心、簡單午餐' },
            { time: '11:00', type: 'transport', activity: '前往箱根地區／海賊觀光船搭乘處', location: 'Ashinoko', note: '依實際交通調整時間' },
            { time: '13:00', type: 'transport', activity: '搭海賊船遊蘆之湖', location: 'Ashinoko', note: '拍照、欣賞湖景' },
            { time: '14:00', type: 'spot', activity: '從桃源台站搭纜車前往大涌谷', location: 'Togendai Station', note: '留意大涌谷天候與開放狀況' },
            { time: '15:00', type: 'spot', activity: '大涌谷參觀', location: 'Owakudani', note: '可品嚐黑玉子等名物' },
            { time: '16:30', type: 'transport', activity: '搭海賊船回到蘆之湖', location: 'Ashinoko', note: '返回蘆之湖' },
            { time: '17:00', type: 'spot', activity: '前往富士八景泡湯', location: 'Fuji Hakkei no Yu', note: 'Check-in、享受溫泉（住宿含）' },
            { time: '晚上', type: 'food', activity: '前往足炳服務區', location: 'Ashigara SA', note: '晚餐、休息' },
        ],
    },
    {
        date: '02/19 (三)',
        shortDate: '02/19',
        fullDate: '2025-02-19',
        title: '蘆之湖・富士 Safari・山中湖・忍野八海',
        flight: null,
        items: [
            { time: '早上', type: 'spot', activity: '前往蘆之湖鳥居拍照', location: 'Hakone Shrine', note: '建議清晨人較少、光線佳' },
            { time: '09:00', type: 'spot', activity: '前往富士野生動物園（Fuji Safari Park）', location: 'Fuji Safari Park', note: '可自駕或搭園內巴士遊園' },
            { time: '下午', type: 'transport', activity: '山中湖河馬水陸兩用船', location: 'Yamanakako', note: '留意班次時刻表' },
            { time: '下午', type: 'spot', activity: '前往忍野八海散步、吃晚餐', location: 'Oshino Hakkai', note: '可品嚐蕎麥麵等當地料理' },
            { time: '晚上', type: 'spot', activity: '紅富士之湯泡湯（也可在此吃晚餐）', location: 'Benifuji no Yu', note: '看當天想在忍野或這裡吃晚餐（¥600）' },
            { time: '夜間', type: 'spot', activity: '前往富士吉田休息站住宿／休息', location: 'Fujiyoshida Rest Area', note: '準備隔天一早拍照行程' },
        ],
    },
    {
        date: '02/20 (四)',
        shortDate: '02/20',
        fullDate: '2025-02-20',
        title: '富士吉田・新倉山淺間公園・大池公園・精進湖・露營',
        flight: null,
        items: [
            { time: '一大早', type: 'spot', activity: '富士吉田懷舊商店街拍照後離開', location: 'Fujiyoshida', note: '利用清晨街上人少時拍照' },
            { time: '早上', type: 'food', activity: '羅森便利商店拍照、買早餐', location: 'Lawson Fujikawaguchiko', note: '可選有富士山景觀的羅森' },
            { time: '09:00', type: 'spot', activity: '新倉山淺間公園五重塔＋富士山絕景', location: 'Chureito Pagoda', note: '需爬階梯，預留體力與時間' },
            { time: '中午', type: 'spot', activity: '大池公園散步', location: 'Oike Park', note: '可遠眺富士山' },
            { time: '下午', type: 'spot', activity: '前往精進湖', location: 'Lake Shoji', note: '看湖景與富士山倒影（視天氣）' },
            { time: '下午', type: 'shop', activity: '前往賣場採買露營食材', location: 'Ogino', note: '如超市、道の駅等' },
            { time: '傍晚', type: 'transport', activity: '前往營地搭帳、煮食', location: 'Pica Fuji Grinpa', note: '留意營地 Check-in 時間' },
            { time: '夜間', type: 'spot', activity: '營地觀星與夜景', location: 'Pica Fuji Grinpa', note: '視天氣決定是否夜拍' },
        ],
    },
    {
        date: '02/21 (五)',
        shortDate: '02/21',
        fullDate: '2025-02-21',
        title: '返回東京・迪士尼購物・返台',
        flight: null,
        items: [
            { time: '早上', type: 'food', activity: '營地早餐', location: 'Pica Fuji Grinpa', note: '收帳、整理行李' },
            { time: '10:00', type: 'transport', activity: '返回東京', location: 'Tokyo', note: '視交通預留時間還車' },
            { time: '下午', type: 'shop', activity: '迪士尼商店或市區購物', location: 'Ikspiari / Tokyo', note: '挑選伴手禮' },
            { time: '晚上', type: 'transport', activity: '前往機場、搭機返台', location: 'NRT/HND', note: '確認航班時間' },
        ],
    },
];

export const JP_EXPENSES: Expense[] = [
    { item: '住宿（2晚商務飯店）', amount: 15000, payer: '我', order: 'exp1', splitParticipants: ['我', '旅伴A'] },
    { item: '交通（租車+油資+過路費）', amount: 12000, payer: '我', order: 'exp2', splitParticipants: ['我', '旅伴A'] },
    { item: '餐飲（平均每日）', amount: 8000, payer: '旅伴A', order: 'exp3', splitParticipants: ['我', '旅伴A'] },
    { item: '景點/活動門票', amount: 6000, payer: '我', order: 'exp4', splitParticipants: ['我', '旅伴A'] },
    { item: '泡湯/露營體驗', amount: 5000, payer: '旅伴A', order: 'exp5', splitParticipants: ['我', '旅伴A'] },
];

export const FirebaseConfig: FirebaseConfigType = {
    apiKey: "AIzaSyA0CWPIeiD67vD554dQJ6S25d6C1u04zFU",
    authDomain: "gojapen-63adb.firebaseapp.com",
    projectId: "gojapen-63adb",
    storageBucket: "gojapen-63adb.firebasestorage.app",
    messagingSenderId: "118671479926",
    appId: "1:118671479926:web:aea90b63264c28746b7b57"
};