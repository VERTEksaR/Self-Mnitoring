import { useEffect, useState, useMemo } from 'react'


export function filterTransactionByDate( transactions, filter) {
    const base = new Date(filter.date);

    let start, end;

    switch (filter.type) {
        case 'day':
            start = new Date(base.setHours(0, 0, 0));
            end = new Date(base.setHours(23, 59, 59));
            break;
        case 'week':
            const day = base.getDay();
            start = new Date(base.setHours(0, 0, 0));
            start.setDate(start.getDate() - day + 1);
            end = new Date(base.setHours(23, 59, 59));
            end.setDate(start.getDate() + 6);
            break;
        case 'month':
            start = new Date(base.getFullYear(), base.getMonth(), 1);
            end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'year':
            start = new Date(base.getFullYear(), 0, 1);
            end = new Date(base.getFullYear(), 11, 31, 23, 59, 59);
            break;

        default:
            return transactions
    }

    return transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= start && tDate <= end;
    });
}


export function TransactionItem({ transaction, onClick, isSelected, categories }) {
    const isIncome = transaction.replenishment

    return (
        <div onClick={onClick} style={{
            border: isSelected ? "2px solid #4f46e5" : "1px solid #ccc",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "8px",
            cursor: "pointer",
            backgroundColor: isSelected ? "#eef2ff" : "#fff",
        }}>
            <div style={{
                color: isIncome ? "green" : "red",
                fontWeight: "bold",
            }}>
                {isIncome ? "+": "-"}
                {transaction.amount}
            </div>
            <div>
                {transaction.transaction_date}
            </div>
            <div style={{ color: "#666"}}>
                {categories[transaction.category.id] || "Без описания"}
            </div>
        </div>
    );
}