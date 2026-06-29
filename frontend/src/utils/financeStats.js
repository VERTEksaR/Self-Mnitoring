const round2 = (n) => Math.round(n * 100) / 100;

export function getTotals(transactions) {
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
        if (t.replenishment) {
            income += Number(t.amount);
        } else {
            expense += Number(t.amount);
        }
    }

    const balance = round2(income - expense);

    return {
        income: round2(income),
        expense: round2(expense),
        balance,
        isIncome: balance >= 0,
    };
}


// categoriesMap: { [id]: name } — передаётся из FinancePage
// Учитывает только расходы (replenishment === false)
export function totalByCategory(transactions, categoriesMap = {}) {
    const categories = transactions
        .filter(t => !t.replenishment)
        .reduce((acc, t) => {
            const name = categoriesMap[t.category_id] ?? `Категория ${t.category_id}`;
            acc[name] = round2((acc[name] ?? 0) + Number(t.amount));
            return acc;
        }, {});

    return Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .map(([category, total]) => ({ category, total }));
}
