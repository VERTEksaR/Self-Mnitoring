import { useMemo } from 'react';
import { fmt } from '../../utils/finance.ts';


export function FinanceSummaryCard({ transactions }) {
    const totalBalance = useMemo(
        () => transactions.reduce((s, tx) => tx.replenishment ? s + Number(tx.amount) : s - Number(tx.amount), 0),
        [transactions]
    );

    if (transactions.length === 0) return null;

    return (
        <div className="card" style={{
            marginBottom: 20,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
        }}>
            <div>
                <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    color: 'var(--text-muted)',
                    marginBottom: 4
                }}>
                    Общий баланс
                </div>
                <div style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: totalBalance >= 0 ? 'var(--brand)' : '#ef4444',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '-.02em'
                }}>
                    {totalBalance >= 0 ? '+' : '−'}{fmt(Math.abs(totalBalance))} ₽
                </div>
                <div style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 3}}>
                    по всем транзакциям · {transactions.length} операций
                </div>
            </div>
            <div style={{display: 'flex', gap: 24}}>
                {[
                    {
                        label: 'Доходы',
                        value: transactions.filter(t => t.replenishment).reduce((s, t) => s + Number(t.amount), 0),
                        color: 'var(--brand)'
                    },
                    {
                        label: 'Расходы',
                        value: transactions.filter(t => !t.replenishment).reduce((s, t) => s + Number(t.amount), 0),
                        color: '#ef4444'
                    },
                ].map(item => (
                    <div key={item.label} style={{textAlign: 'right'}}>
                        <div style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            marginBottom: 2
                        }}>{item.label}</div>
                        <div style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: item.color,
                            fontFamily: 'JetBrains Mono,monospace'
                        }}>
                            {fmt(item.value)} ₽
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}