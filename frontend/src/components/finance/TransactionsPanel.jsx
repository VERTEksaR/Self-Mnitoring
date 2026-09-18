import { useMemo, useState } from 'react';
import { TransactionItem } from './items/TransactionItem.jsx';
import { EmptyHint } from '../EmptyHint.jsx';
import { dateLabel, daysAgoStr, groupByDate, PERIODS, todayStr, TX_LIMITS } from '../../utils/finance.ts';


export function TransactionsPanel({ transactions, categoriesMap, selectedTransaction, onSelect, onAdd }) {
    const [txLimit, setTxLimit] = useState(5);
    const [periodFilter, setPeriodFilter] = useState('all');

    const sortedTransactions = useMemo(
        () => [...transactions].sort((a, b) => {
        if (!a.transaction_date) return 1;
        if (!b.transaction_date) return -1;
        return b.transaction_date.localeCompare(a.transaction_date);
    }),[transactions]
    );

    const filteredByPeriod = useMemo(() => {
        if (periodFilter === 'today') return sortedTransactions.filter(t => t.transaction_date === todayStr());
        if (periodFilter === 'week')  return sortedTransactions.filter(t => t.transaction_date >= daysAgoStr(7));
        if (periodFilter === 'month') return sortedTransactions.filter(t => t.transaction_date >= daysAgoStr(30));
        return sortedTransactions;
    }, [sortedTransactions, periodFilter]);

    const visibleTransactions = periodFilter === 'all'
        ? filteredByPeriod.slice(0, txLimit)
        : filteredByPeriod;

    const groupedTransactions = useMemo(
        () => groupByDate(visibleTransactions),
        [visibleTransactions]
    );

    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>Операции</span>
                        <span className="section-count">{filteredByPeriod.length}</span>
                    </div>
                    {periodFilter === 'all' && (
                        <div style={{ display: 'flex', gap: 5 }}>
                            {TX_LIMITS.map(n => (
                                <button key={n} onClick={() => setTxLimit(n)} style={{
                                    padding: '3px 9px', borderRadius: 6, border: '1px solid var(--border)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                    background: txLimit === n ? 'var(--brand)' : 'var(--surface-sunken)',
                                    color: txLimit === n ? '#fff' : 'var(--text-muted)',
                                }}>{n}</button>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {PERIODS.map(p => (
                        <button key={p.id} onClick={() => setPeriodFilter(p.id)} style={{
                            padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            background: periodFilter === p.id ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                            color: periodFilter === p.id ? 'var(--brand)' : 'var(--text-muted)',
                            borderColor: periodFilter === p.id ? 'var(--brand-subtle-bd)' : 'var(--border)',
                        }}>{p.label}</button>
                    ))}
                </div>
            </div>
            <div className="tx-list">
                {visibleTransactions.length === 0 ? (
                    <EmptyHint
                        title="Транзакций не найдено"
                        hint={periodFilter !== 'all'
                            ? 'За этот период операций не найдено. Попробуйте другой период.'
                            : 'Нажмите «+ Транзакция» выше, чтобы добавить первую операцию.'}
                        action="+ Создать транзакцию"
                        onAction={onAdd}
                    />
                ) : (
                    groupedTransactions.map(([date, txs]) => (
                        <div key={date}>
                            <div style={{
                                padding: '8px 16px 4px',
                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '.06em', color: 'var(--text-faint)',
                                background: 'var(--surface-card)',
                                borderBottom: '1px solid var(--border)',
                            }}>
                                {date === 'unknown' ? 'Без даты' : dateLabel(date)}
                            </div>
                            {txs.map(t => (
                                <TransactionItem
                                    key={t.id} transaction={t}
                                    onClick={() => onSelect(t)}
                                    isSelected={selectedTransaction?.id === t.id}
                                    categories={categoriesMap}
                                />
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}