export function getTotals(transactions) {
    let income = 0
    let expense = 0

    for (const t of transactions) {
        if (t.replenishment) {
            income += Number(t.amount)
        } else {
            expense += Number(t.amount)
        }
    };

    let balance = income - expense

    let isIncome = false

    if (balance >= 0) {
        isIncome = true
    };

    return {
        income, expense, balance, isIncome
    };
};


// categoriesMap: { [id]: name } — передаётся из FinancePage
export function totalByCategory(transactions, categoriesMap = {}) {
    let resultData = []

    const categories = transactions.reduce((acc, t) => {
        const name = categoriesMap[t.category_id] ?? `Категория ${t.category_id}`;

        if (!acc[name]) {
            acc[name] = 0
        };

        acc[name] += Number(t.amount)

        return acc;
    }, {});

    const top3 = Object.entries(categories)
        .sort(([, a], [, b]) => b - a).slice(0, 3);

    for (const i of top3) {
        resultData.push({'category': i[0], 'total': i[1]})
    }

    return resultData
}
