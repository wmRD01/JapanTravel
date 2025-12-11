/**
 * Firebase 雲端旅程服務層
 * 處理所有 Firebase Firestore 的 CRUD 操作
 */
import { useFirebase } from '../constants/index';
import type { Day, Expense, Setup } from '../types/index';
import { getFirestoreModule, waitForDb } from './firebase';

/**
 * 檢查 Firebase 是否準備就緒（針對雲端旅程）
 */
export async function checkCloudFirebaseReady(cloudTripId: string | null): Promise<any> {
    if (!useFirebase || !cloudTripId) return null;
    const { checkFirebaseReady } = await import('./firebase');
    const result = await checkFirebaseReady();
    return result.ready ? result.db : null;
}

/**
 * 上傳旅程主文件到 Firestore
 */
export async function uploadTripDocument(
    cloudTripId: string | null,
    setup: Setup,
    daysCount: number,
    participantsStr: string,
    inviteCode: string,
    isUpdate: boolean = false
): Promise<string> {
    const firestoreDb = await waitForDb();
    if (!firestoreDb) throw new Error('Firebase 連線失敗');

    const firestoreModule = await getFirestoreModule();
    const { collection, doc, setDoc, addDoc, Timestamp } = firestoreModule;

    if (!collection || !doc || !setDoc || !addDoc) {
        throw new Error('Firestore 模組缺少必要的函數');
    }

    if (isUpdate && cloudTripId) {
        // 更新現有文件
        await setDoc(doc(firestoreDb, 'trips', cloudTripId), {
            title: setup.title || '',
            destination: setup.destination || '',
            startDate: setup.startDate,
            daysCount: daysCount,
            inviteCode: inviteCode,
            participants: participantsStr,
            config: {
                currency: setup.currency,
                rate: setup.rate,
                langCode: setup.langCode,
                langName: setup.langName,
            },
            updatedAt: Timestamp.now(),
        });
        return cloudTripId;
    } else {
        // 建立新文件
        const tripRef = await addDoc(collection(firestoreDb, 'trips'), {
            title: setup.title || '',
            destination: setup.destination || '',
            startDate: setup.startDate,
            daysCount: daysCount,
            inviteCode: inviteCode,
            participants: participantsStr,
            config: {
                currency: setup.currency,
                rate: setup.rate,
                langCode: setup.langCode,
                langName: setup.langName,
            },
            createdAt: Timestamp.now(),
        });
        return tripRef.id;
    }
}

/**
 * 上傳 days 子集合到 Firestore
 */
export async function uploadDays(cloudTripId: string, days: Day[]): Promise<void> {
    const firestoreDb = await waitForDb();
    if (!firestoreDb) throw new Error('Firebase 連線失敗');

    const firestoreModule = await getFirestoreModule();
    const { collection, addDoc } = firestoreModule;

    if (!collection || !addDoc) {
        throw new Error('Firestore 模組缺少必要的函數');
    }

    const daysCollection = collection(firestoreDb, `trips/${cloudTripId}/days`);
    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        await addDoc(daysCollection, {
            order: i,
            date: day.date || '',
            shortDate: day.shortDate || '',
            fullDate: day.fullDate || '',
            title: day.title || '',
            flight: day.flight || null,
            items: day.items || [],
        });
    }
}

/**
 * 刪除舊的 days 子集合
 */
export async function deleteOldDays(cloudTripId: string): Promise<void> {
    const firestoreDb = await waitForDb();
    if (!firestoreDb) return;

    const firestoreModule = await getFirestoreModule();
    const { collection, getDocs, deleteDoc, writeBatch } = firestoreModule;

    if (!collection || !getDocs || !deleteDoc || !writeBatch) {
        throw new Error('Firestore 模組缺少必要的函數');
    }

    const oldDaysSnapshot = await getDocs(collection(firestoreDb, `trips/${cloudTripId}/days`));
    const batch = writeBatch(firestoreDb);
    oldDaysSnapshot.forEach((docSnap: any) => {
        batch.delete(docSnap.ref);
    });
    await batch.commit();
}

/**
 * 上傳 sharedExpenses 子集合到 Firestore
 */
export async function uploadSharedExpenses(
    cloudTripId: string,
    expenses: Expense[],
    defaultParticipants: string[]
): Promise<void> {
    const firestoreDb = await waitForDb();
    if (!firestoreDb) throw new Error('Firebase 連線失敗');

    const firestoreModule = await getFirestoreModule();
    const { collection, addDoc, Timestamp } = firestoreModule;

    if (!collection || !addDoc) {
        throw new Error('Firestore 模組缺少必要的函數');
    }

    const expensesCollection = collection(firestoreDb, `trips/${cloudTripId}/sharedExpenses`);
    for (const expense of expenses) {
        // 確保每一筆帳務都有唯一的 order
        if (!expense.order) {
            expense.order = `${Date.now()}_${expense.payer || 'payer'}`;
        }

        // 確保 splitParticipants 有明確的值
        let splitParts = expense.splitParticipants;
        if (!splitParts || !Array.isArray(splitParts) || splitParts.length === 0) {
            splitParts = [...defaultParticipants];
        }

        await addDoc(expensesCollection, {
            item: expense.item,
            amount: expense.amount,
            payerName: expense.payer,
            order: expense.order,
            splitParticipants: splitParts,
            createdAt: Timestamp.now(),
        });
    }
}

/**
 * 刪除舊的 sharedExpenses 子集合
 */
export async function deleteOldSharedExpenses(cloudTripId: string): Promise<void> {
    const firestoreDb = await waitForDb();
    if (!firestoreDb) return;

    const firestoreModule = await getFirestoreModule();
    const { collection, getDocs, deleteDoc, writeBatch } = firestoreModule;

    if (!collection || !getDocs || !deleteDoc || !writeBatch) {
        throw new Error('Firestore 模組缺少必要的函數');
    }

    const oldExpensesSnapshot = await getDocs(collection(firestoreDb, `trips/${cloudTripId}/sharedExpenses`));
    const batch = writeBatch(firestoreDb);
    oldExpensesSnapshot.forEach((docSnap: any) => {
        batch.delete(docSnap.ref);
    });
    await batch.commit();
}

/**
 * 新增一筆 sharedExpense 到 Firestore（使用 order 作為文件 ID）
 */
export async function addExpenseToCloud(
    cloudTripId: string,
    expense: Expense,
    defaultParticipants: string[]
): Promise<void> {
    const firestoreDb = await checkCloudFirebaseReady(cloudTripId);
    if (!firestoreDb || !expense || !expense.order) return;

    const firestoreModule = await getFirestoreModule();
    const { collection, doc, setDoc, Timestamp } = firestoreModule;

    const expensesCollection = collection(firestoreDb, `trips/${cloudTripId}/sharedExpenses`);
    const expenseDocRef = doc(expensesCollection, expense.order);

    let splitParts = expense.splitParticipants;
    if (!splitParts || !Array.isArray(splitParts) || splitParts.length === 0) {
        splitParts = [...defaultParticipants];
    }

    await setDoc(expenseDocRef, {
        item: expense.item,
        amount: expense.amount,
        payerName: expense.payer,
        order: expense.order,
        splitParticipants: splitParts,
        createdAt: Timestamp.now(),
    });
}

/**
 * 刪除一筆 sharedExpense（使用 order）
 */
export async function deleteExpenseFromCloud(cloudTripId: string, order: string): Promise<void> {
    const firestoreDb = await checkCloudFirebaseReady(cloudTripId);
    if (!firestoreDb) return;

    const firestoreModule = await getFirestoreModule();
    const { collection, query, where, getDocs, deleteDoc } = firestoreModule;

    const expensesCollection = collection(firestoreDb, `trips/${cloudTripId}/sharedExpenses`);
    const q = query(expensesCollection, where('order', '==', order));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('⚠️ Firestore 中找不到對應的帳務（order =', order, '）');
        return;
    }

    for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
    }
}

/**
 * 新增個人記帳到 Firestore
 */
export async function addPersonalExpenseToCloud(
    cloudTripId: string,
    expense: Expense
): Promise<void> {
    const firestoreDb = await checkCloudFirebaseReady(cloudTripId);
    if (!firestoreDb || !expense || !expense.order) return;

    const firestoreModule = await getFirestoreModule();
    const { collection, doc, setDoc, Timestamp } = firestoreModule;

    const personalExpensesCollection = collection(
        firestoreDb,
        `trips/${cloudTripId}/personalExpenses`
    );
    const expenseDocRef = doc(personalExpensesCollection, expense.order);

    await setDoc(expenseDocRef, {
        item: expense.item,
        amount: expense.amount,
        payerName: expense.payer,
        order: expense.order,
        createdAt: Timestamp.now(),
    });
}

/**
 * 刪除個人記帳
 */
export async function deletePersonalExpenseFromCloud(cloudTripId: string, order: string): Promise<void> {
    const firestoreDb = await checkCloudFirebaseReady(cloudTripId);
    if (!firestoreDb) return;

    const firestoreModule = await getFirestoreModule();
    const { collection, doc, deleteDoc } = firestoreModule;

    const personalExpensesCollection = collection(
        firestoreDb,
        `trips/${cloudTripId}/personalExpenses`
    );
    const expenseDocRef = doc(personalExpensesCollection, order);
    await deleteDoc(expenseDocRef);
}

/**
 * 從 Firestore 同步旅程資料
 */
export async function syncTripFromCloud(cloudTripId: string): Promise<{
    tripData: any;
    days: Day[];
    expenses: Expense[];
}> {
    const firestoreDb = await checkCloudFirebaseReady(cloudTripId);
    if (!firestoreDb) throw new Error('Firebase 連線失敗');

    const firestoreModule = await getFirestoreModule();
    const { collection, getDocs, doc, getDoc } = firestoreModule;

    // 同步 trip 主文件
    const tripDoc = await getDoc(doc(firestoreDb, `trips/${cloudTripId}`));
    const tripData = tripDoc.exists() ? tripDoc.data() : null;

    // 同步 days
    const daysSnapshot = await getDocs(collection(firestoreDb, `trips/${cloudTripId}/days`));
    const syncedDays: Day[] = [];
    daysSnapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        syncedDays.push({
            order: data.order,
            date: data.date,
            shortDate: data.shortDate,
            fullDate: data.fullDate,
            title: data.title,
            flight: data.flight,
            items: data.items || [],
        });
    });
    syncedDays.sort((a, b) => (a.order || 0) - (b.order || 0));

    // 同步 sharedExpenses
    const expensesSnapshot = await getDocs(
        collection(firestoreDb, `trips/${cloudTripId}/sharedExpenses`)
    );
    const syncedExpenses: Expense[] = [];
    expensesSnapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        syncedExpenses.push({
            item: data.item,
            amount: data.amount,
            payer: data.payerName,
            order: data.order || null,
            splitParticipants: data.splitParticipants || [],
        });
    });

    return {
        tripData,
        days: syncedDays,
        expenses: syncedExpenses,
    };
}

/**
 * 根據邀請碼查詢旅程
 */
export async function findTripByInviteCode(inviteCode: string): Promise<{
    tripId: string;
    tripData: any;
} | null> {
    const firestoreDb = await waitForDb();
    if (!firestoreDb) throw new Error('Firebase 連線失敗');

    const firestoreModule = await getFirestoreModule();
    const { collection, query, where, getDocs } = firestoreModule;

    const q = query(collection(firestoreDb, 'trips'), where('inviteCode', '==', inviteCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const tripDoc = snapshot.docs[0];
    return {
        tripId: tripDoc.id,
        tripData: tripDoc.data(),
    };
}

