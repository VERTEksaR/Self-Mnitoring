const fmt = (amount) =>
    Number(amount).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const fmtDate = (str) => {
    if (!str) return '';
    return new Date(str).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

export function TransactionItem({ transaction, onClick, isSelected, categories }) {
    const isIncome = transaction.replenishment;

    return (
        <div
            onClick={onClick}
            className={`card tx-item${isSelected ? ' tx-item--selected' : ''}`}
        >
            <div className="tx-item__left">
                <span className={`amount ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                    {isIncome ? '+' : '−'}{fmt(transaction.amount)} ₽
                </span>
                {transaction.destination && (
                    <span className="tx-item__desc">{transaction.destination}</span>
                )}
            </div>
            <div className="tx-item__right">
                <span className="badge badge-neutral">
                    {categories[transaction.category_id] || 'Без категории'}
                </span>
                <span className="tx-item__date">{fmtDate(transaction.transaction_date)}</span>
                {transaction.cashback > 0 && (
                    <span className="amount amount-cashback" style={{ fontSize: '11px' }}>
                        +{fmt(transaction.cashback)} кэшбэк
                    </span>
                )}
            </div>
        </div>
    );
}
