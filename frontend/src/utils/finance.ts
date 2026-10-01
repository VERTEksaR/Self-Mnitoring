import {Transaction} from "../types/finances/transaction";

export const fmt = (n: string) =>
    Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// Дата в локальном часовом поясе (toISOString даёт UTC и сдвигает день)
export function toLocalISO(d: Date) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

export function todayStr() {
    return toLocalISO(new Date());
}

export function daysAgoStr(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toLocalISO(d);
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
        const key = tx.transaction_date ?? "unknown";

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