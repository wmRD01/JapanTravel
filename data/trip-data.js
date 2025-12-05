// 日本東京富士行程與預設支出資料
export const JP_TRIP_ID = 'trip_japan_2025_feb';

export const JP_TRIP_DATA = [{
        date: "02/17 (一)",
        shortDate: "02/17",
        fullDate: "2025-02-17",
        title: "抵達日本・成田住宿",
        flight: {
            type: "arrival",
            startTime: "12:50",
            startAirport: "TPE",
            number: "FLIGHT",
            endTime: "16:50",
            endAirport: "NRT",
            arrivalOffset: 0
        },
        items: [{
                time: "16:50",
                type: "transport",
                activity: "抵達日本",
                location: "Narita International Airport",
                note: "第二航廈"
            },
            {
                time: "19:00",
                type: "spot",
                activity: "飯店 Check-in",
                location: "HOTEL MYSTAYS Narita",
                note: "熟悉周邊便利店超市"
            }
        ]
    },
    {
        date: "02/18 (二)",
        shortDate: "02/18",
        fullDate: "2025-02-18",
        title: "箱根・蘆之湖・溫泉",
        items: [{
                time: "10:00",
                type: "transport",
                activity: "新船橋取車",
                location: "Funabashi",
                note: "確認租車文件、導航設定好目的地"
            },
            {
                time: "10:00",
                type: "food",
                activity: "開車前往海老名服務區",
                location: "Ebina SA",
                note: "上洗手間、買點心、簡單午餐"
            },
            {
                time: "11:00",
                type: "transport",
                activity: "前往箱根地區／海賊觀光船搭乘處",
                location: "Ashinoko",
                note: "依實際交通調整時間"
            },
            {
                time: "13:00",
                type: "transport",
                activity: "搭海賊船遊蘆之湖",
                location: "Ashinoko",
                note: "拍照、欣賞湖景"
            },
            {
                time: "14:00",
                type: "spot",
                activity: "從桃源台站搭纜車前往大涌谷",
                location: "Togendai Station",
                note: "留意大涌谷天候與開放狀況"
            },
            {
                time: "15:00",
                type: "spot",
                activity: "大涌谷參觀",
                location: "Owakudani",
                note: "可品嚐黑玉子等名物"
            },
            {
                time: "16:30",
                type: "transport",
                activity: "搭海賊船回到蘆之湖",
                location: "Ashinoko",
                note: "返回蘆之湖"
            },
            {
                time: "17:00",
                type: "spot",
                activity: "前往富士八景泡湯",
                location: "Fuji Hakkei no Yu",
                note: "Check-in、享受溫泉（住宿含）"
            },
            {
                time: "晚上",
                type: "food",
                activity: "前往足炳服務區",
                location: "Ashigara SA",
                note: "晚餐、休息"
            }
        ]
    },
    {
        date: "02/19 (三)",
        shortDate: "02/19",
        fullDate: "2025-02-19",
        title: "蘆之湖・富士 Safari・山中湖・忍野八海",
        items: [{
                time: "早上",
                type: "spot",
                activity: "前往蘆之湖鳥居拍照",
                location: "Hakone Shrine",
                note: "建議清晨人較少、光線佳"
            },
            {
                time: "09:00",
                type: "spot",
                activity: "前往富士野生動物園（Fuji Safari Park）",
                location: "Fuji Safari Park",
                note: "可自駕或搭園內巴士遊園"
            },
            {
                time: "下午",
                type: "transport",
                activity: "山中湖河馬水陸兩用船",
                location: "Yamanakako",
                note: "留意班次時刻表"
            },
            {
                time: "下午",
                type: "spot",
                activity: "前往忍野八海散步、吃晚餐",
                location: "Oshino Hakkai",
                note: "可品嚐蕎麥麵等當地料理"
            },
            {
                time: "晚上",
                type: "spot",
                activity: "紅富士之湯泡湯（也可在此吃晚餐）",
                location: "Benifuji no Yu",
                note: "看當天想在忍野或這裡吃晚餐（¥600）"
            },
            {
                time: "夜間",
                type: "spot",
                activity: "前往富士吉田休息站住宿／休息",
                location: "Fujiyoshida Rest Area",
                note: "準備隔天一早拍照行程"
            }
        ]
    },
    {
        date: "02/20 (四)",
        shortDate: "02/20",
        fullDate: "2025-02-20",
        title: "富士吉田・新倉山淺間公園・大池公園・精進湖・露營",
        items: [{
                time: "一大早",
                type: "spot",
                activity: "富士吉田懷舊商店街拍照後離開",
                location: "Fujiyoshida",
                note: "利用清晨街上人少時拍照"
            },
            {
                time: "早上",
                type: "food",
                activity: "羅森便利商店拍照、買早餐",
                location: "Lawson Fujikawaguchiko",
                note: "可選有富士山景觀的羅森"
            },
            {
                time: "09:00",
                type: "spot",
                activity: "新倉山淺間公園五重塔＋富士山絕景",
                location: "Chureito Pagoda",
                note: "需爬階梯，預留體力與時間"
            },
            {
                time: "中午",
                type: "spot",
                activity: "大池公園散步",
                location: "Oike Park",
                note: "可遠眺富士山"
            },
            {
                time: "下午",
                type: "spot",
                activity: "前往精進湖",
                location: "Lake Shoji",
                note: "看湖景與富士山倒影（視天氣）"
            },
            {
                time: "下午",
                type: "shop",
                activity: "前往賣場採買露營食材",
                location: "Ogino",
                note: "如超市、道の駅等"
            },
            {
                time: "15:00",
                type: "spot",
                activity: "抵達 Fumotoppara Campground 露營",
                location: "Fumotoppara Campground",
                note: "★務必15:00前進入，17:00後車輛不能移動"
            }
        ]
    },
    {
        date: "02/21 (五)",
        shortDate: "02/21",
        fullDate: "2025-02-21",
        title: "朝霧高原・西湖・大石公園・大池公園煙火・酒酒井休息站",
        items: [{
                time: "早上",
                type: "spot",
                activity: "朝露自然公園",
                location: "Asagiri Kogen",
                note: "依天候散步拍照"
            },
            {
                time: "上午",
                type: "spot",
                activity: "Asagiri Kogen Mochiya 兒童主題公園",
                location: "Drive-in Mochiya",
                note: "若有小朋友可多留時間"
            },
            {
                time: "下午",
                type: "spot",
                activity: "西湖 療癒之里根場",
                location: "Saiko Iyashi-no-Sato Nenba",
                note: "走古民家、拍照、喝茶"
            },
            {
                time: "下午",
                type: "spot",
                activity: "前往大石公園",
                location: "Oishi Park",
                note: "眺望富士山與河口湖景色"
            },
            {
                time: "20:00",
                type: "spot",
                activity: "大池公園觀賞煙火",
                location: "Oike Park",
                note: "欣賞煙火表演（20:00-20:20）"
            },
            {
                time: "晚上",
                type: "spot",
                activity: "前往酒酒井休息站住宿／休息",
                location: "Shisui PA",
                note: "為隔天還車與搭機做準備"
            }
        ]
    },
    {
        date: "02/22 (六)",
        shortDate: "02/22",
        fullDate: "2025-02-22",
        title: "還車・個人行程 (船橋)",
        items: [{
                time: "08:00",
                type: "transport",
                activity: "從酒酒井 PA 出發，前往船橋車站",
                location: "Funabashi Station",
                note: "預留塞車時間，建議提早出發"
            },
            {
                time: "09:00",
                type: "transport",
                activity: "船橋車站寄放行李",
                location: "Funabashi Station",
                note: "車站周邊臨停不易，需預留找車位與置物櫃時間"
            },
            {
                time: "09:30",
                type: "transport",
                activity: "前往還車點（溫泉附近）辦理還車",
                location: "Funabashi",
                note: "10:00前完成還車手續"
            },
            {
                time: "10:00",
                type: "spot",
                activity: "Funabashi Onsen Yura no Sato 泡湯",
                location: "Funabashi Onsen Yura no Sato",
                note: "船橋温泉 湯楽の里，步行或接駁前往（¥950平日/¥1,000週末+置物櫃¥100）"
            },
            {
                time: "12:30",
                type: "transport",
                activity: "移動前往船橋車站",
                location: "Funabashi Station",
                note: ""
            },
            {
                time: "13:00",
                type: "food",
                activity: "船橋車站周邊午餐",
                location: "Funabashi Station",
                note: "車站與百貨內有眾多餐廳選擇"
            },
            {
                time: "14:30",
                type: "shop",
                activity: "船橋車站血拚購物",
                location: "Tobu Department Store Funabashi",
                note: "東武百貨、Shapo、藥妝店等（約3小時）"
            },
            {
                time: "17:30",
                type: "transport",
                activity: "搭乘 JR 前往千葉市",
                location: "Chiba Station",
                note: "取回行李，搭 JR 總武線快速（約15分鐘，¥240）"
            },
            {
                time: "18:00",
                type: "spot",
                activity: "千葉市區飯店 Check-in",
                location: "Chiba",
                note: "辦理入住手續，放置行李"
            },
            {
                time: "晚上",
                type: "food",
                activity: "自由活動／晚餐（鳥貴族 千葉駅前店）",
                location: "Chiba Station",
                note: "行程留空，可於千葉車站周邊覓食或休息"
            },
            {
                time: "15:20",
                type: "flight",
                activity: "【主團體】成田機場起飛",
                location: "NRT",
                note: "主團體返台"
            }
        ]
    },
    {
        date: "02/23 (日)",
        shortDate: "02/23",
        fullDate: "2025-02-23",
        title: "成田山新勝寺・川豐鰻魚飯・返國（國泰 CX451 15:30 起飛）",
        flight: {
            type: "departure",
            startTime: "15:30",
            startAirport: "NRT",
            number: "CX451",
            endTime: "18:40",
            endAirport: "TPE",
            arrivalOffset: 0
        },
        items: [{
                time: "07:30",
                type: "transport",
                activity: "退房、從千葉前往成田站",
                location: "Narita Station",
                note: "JR 成田線（約30分，¥510），行李寄放成田站"
            },
            {
                time: "08:00",
                type: "transport",
                activity: "抵達成田站、置物櫃寄放行李",
                location: "Narita Station",
                note: "確保一身輕便前往新勝寺"
            },
            {
                time: "08:30",
                type: "spot",
                activity: "參拜成田山新勝寺＋逛表參道老街",
                location: "Naritasan Shinshoji Temple",
                note: "建議09:30前先到川豐抽號碼牌，再去參拜"
            },
            {
                time: "10:00",
                type: "food",
                activity: "川豐 本店品嚐鰻魚飯",
                location: "Kawatoyo Honten",
                note: "10點開門，建議第一批入座，預留時間回車站"
            },
            {
                time: "11:30",
                type: "transport",
                activity: "前往成田機場",
                location: "Narita International Airport",
                note: "從京成成田/JR 成田站前往機場僅需約10多分鐘（¥200）"
            },
            {
                time: "12:00",
                type: "transport",
                activity: "辦理報到、托運與安檢",
                location: "Narita International Airport",
                note: "建議提早2.5～3小時抵達機場"
            },
            {
                time: "之後",
                type: "food",
                activity: "機場內用餐、逛免稅，等待15:30起飛",
                location: "Narita International Airport",
                note: "國泰 CX451，在登機口附近等候登機"
            },
            {
                time: "18:40",
                type: "transport",
                activity: "抵達桃園機場、入境、領行李",
                location: "Taoyuan International Airport",
                note: "預估出關約1小時"
            },
            {
                time: "19:40",
                type: "transport",
                activity: "搭乘機場捷運前往高鐵桃園站",
                location: "Taoyuan Airport MRT",
                note: "機捷 A13/A12 → A18（約20分鐘，$35）"
            },
            {
                time: "20:21",
                type: "transport",
                activity: "搭乘高鐵南下（往台中）",
                location: "HSR Taoyuan Station",
                note: "視出關速度搭乘687或857車次（$540）"
            },
            {
                time: "21:00",
                type: "transport",
                activity: "抵達高鐵台中站",
                location: "HSR Taichung Station",
                note: "轉乘台鐵區間車（新烏日站 → 台中站，$15）"
            },
            {
                time: "21:30",
                type: "spot",
                activity: "抵達台中火車站",
                location: "Taichung Station",
                note: "平安賦歸"
            }
        ]
    }
];

export const JP_EXPENSES = [{
        item: 'Suica卡 (短期)',
        amount: 1000,
        payer: '我'
    },
    {
        item: '露營場地與裝備租借',
        amount: 52000,
        payer: '我'
    },
    {
        item: '紅富士之湯',
        amount: 600,
        payer: '我'
    },
    {
        item: '船橋溫泉 (湯樂之里)',
        amount: 1050,
        payer: '我',
        note: '¥950（平日）/ ¥1,000（週末）+ 置物櫃¥100'
    },
    {
        item: 'JR (船橋->千葉)',
        amount: 240,
        payer: '我'
    },
    {
        item: 'JR (千葉->成田)',
        amount: 510,
        payer: '我'
    },
    {
        item: '電車 (成田->機場)',
        amount: 200,
        payer: '我'
    }
];

export const FirebaseConfig = {
    apiKey: "AIzaSyA0CWPIeiD67vD554dQJ6S25d6C1u04zFU",
    authDomain: "gojapen-63adb.firebaseapp.com",
    projectId: "gojapen-63adb",
    storageBucket: "gojapen-63adb.firebasestorage.app",
    messagingSenderId: "118671479926",
    appId: "1:118671479926:web:aea90b63264c28746b7b57"
};
