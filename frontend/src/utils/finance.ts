import {Transaction} from "../types/finances/transaction";

export const fmt = (n: string) =>
    Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

export function daysAgoStr(n: number) {
    return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

export function dateLabel(iso: string) {
    const t = todayStr();
    const y = daysAgoStr(1);

    if (iso === t) {
        return "Сегодня";
    } else if (iso === y) {
        return "Вчера";
    }

    const [yr, m, d] = iso.split("-");
    return `${d}.${m}.${yr}`;
}

export function groupByDate(transactions: [Transaction]) {
    const map = new Map();

    for (const tx of transactions) {
        const key = tx.transaction_date ?? "Неизвестно";

        if (!map.has(key)) map.set(key, []);
        map.get(key).push(tx);
    }

    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
}

export const SECTION_LIMIT = 5;
export const TX_LIMITS = [5, 10, 20];
export const PERIODS = [
    { id: 'today', label: 'Сегодня' },
    { id: 'week',  label: 'Неделя'  },
    { id: 'month', label: 'Месяц'   },
    { id: 'all',   label: 'Всё'     },
];