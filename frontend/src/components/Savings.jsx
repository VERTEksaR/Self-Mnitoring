import { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getSavingsAccounts, getSavingsTrend, getTransactions } from '../api/finance';
import { TransactionItem } from './TransactionItem';

const fmt  = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtK = (n) => Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
function monthLabel(key) {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[Number(m) - 1]} ${y.slice(2)}`;
}

// ── Tooltip для графика по месяцам ──
function TrendTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const v = payload[0].value;
    return (
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 6px 18px rgba(0,0,0,.5)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4, fontSize: 13 }}>{label}</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: v >= 0 ? '#3ee07a' : '#ef4444' }}>
                {v >= 0 ? '+' : '−'}{fmt(Math.abs(v))} ₽
            </div>
        </div>
    );
}

// ── График изменения накоплений по месяцам ──
function SavingsTrendChart({ data }) {
    if (data.length === 0) {
        return (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Нет данных за выбранный период
            </div>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<TrendTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="net" radius={[4, 4, 4, 4]} maxBarSize={40}>
                    {data.map((d, i) => (
                        <Cell key={i} fill={d.net >= 0 ? '#3ee07a' : '#ef4444'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

// ── Карточка накопительного счёта ──
function SavingsAccountCard({ account, onClick }) {
    const hasGoal = account.goal_amount != null;
    const pct = hasGoal && account.goal_amount > 0
        ? Math.min(100, Math.round(account.balance / account.goal_amount * 100))
        : null;

    return (
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={onClick}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>
                {account.account_name}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: 'var(--brand)', marginBottom: 10 }}>
                {fmt(account.balance)} ₽
            </div>
            {hasGoal ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Цель: {fmt(account.goal_amount)} ₽</span>
                        <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand)', borderRadius: 999 }} />
                    </div>
                </>
            ) : (
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Без лимита</div>
            )}
        </div>
    );
}

// ── Модалка со всеми транзакциями счёта ──
function AccountTransactionsModal({ account, categoriesMap, onClose }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTransactions({ account_id: [account.account_id], size: 200 })
            .then(res => setTransactions(res.data.items ?? []))
            .catch(err => console.error('[Savings] transactions load failed:', err?.response?.status))
            .finally(() => setLoading(false));
    }, [account.account_id]);

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="modal-header">
                    <span className="modal-title">{account.account_name}</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body" style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {loading ? (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Загрузка...</div>
                    ) : transactions.length === 0 ? (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Транзакций пока нет</div>
                    ) : (
                        transactions.map(t => (
                            <TransactionItem key={t.id} transaction={t} categories={categoriesMap} />
                        ))
                    )}
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}

// ── Раздел «Накопления» ──
export function Savings({ categoriesMap }) {
    const [accounts, setAccounts] = useState([]);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);

    useEffect(() => {
        Promise.all([getSavingsAccounts(), getSavingsTrend(6)])
            .then(([accRes, trendRes]) => {
                setAccounts(accRes.data ?? []);
                setTrend((trendRes.data ?? []).map(p => ({ ...p, label: monthLabel(p.month) })));
            })
            .catch(err => console.error('[Savings] load failed:', err?.response?.status))
            .finally(() => setLoading(false));
    }, []);

    const totalBalance = useMemo(
        () => accounts.reduce((s, a) => s + Number(a.balance), 0),
        [accounts]
    );

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div>
            {/* ── Итого ── */}
            <div className="card" style={{ padding: '18px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Всего накоплено
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {fmt(totalBalance)} ₽
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    по {accounts.length} {accounts.length === 1 ? 'накопительному счёту' : 'накопительным счетам'}
                </div>
            </div>

            {/* ── График по месяцам ── */}
            <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>
                    Изменение накоплений по месяцам
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    Насколько стало больше (зелёным) или меньше (красным) накоплений за месяц
                </div>
                <SavingsTrendChart data={trend} />
            </div>

            {/* ── Список накопительных счетов ── */}
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 12 }}>
                Накопительные счета
            </div>
            {accounts.length === 0 ? (
                <div className="card empty" style={{ padding: '28px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>
                        Нет накопительных счетов
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Отметьте счёт как «Накопительный» в его настройках, чтобы он появился здесь.
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {accounts.map(a => (
                        <SavingsAccountCard key={a.account_id} account={a} onClick={() => setSelectedAccount(a)} />
                    ))}
                </div>
            )}

            {selectedAccount && (
                <AccountTransactionsModal
                    account={selectedAccount}
                    categoriesMap={categoriesMap}
                    onClose={() => setSelectedAccount(null)}
                />
            )}
        </div>
    );
}
