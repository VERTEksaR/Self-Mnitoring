import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getTransactions, getAccounts } from '../api/finance';
import { deleteTransaction, deleteCategory, deleteAccount } from '../api/api';

import { TransactionItem } from '../components/TransactionItem';
import { TransactionModel, AddTransactionModel, EditTransactionModel } from '../components/TransactionModel';

import { CategoryItem } from '../components/CategoryItem';
import { CategoryModel, AddCategoryModel } from '../components/CategoryModel';

import { AccountItem } from '../components/AccountItem';
import { AccountModel, AddAccountModel } from '../components/AccountModel';
import { FinanceAnalytics } from '../components/FinanceAnalytics';
import { Savings } from '../components/Savings';

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n) =>
    Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysAgoStr(n) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

function dateLabel(iso) {
    const t = todayStr();
    const y = daysAgoStr(1);
    if (iso === t) return 'Сегодня';
    if (iso === y) return 'Вчера';
    const [yr, m, d] = iso.split('-');
    return `${d}.${m}.${yr}`;
}

function groupByDate(transactions) {
    const map = new Map();
    for (const tx of transactions) {
        const key = tx.transaction_date ?? 'unknown';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(tx);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
}

const SECTION_LIMIT = 5;
const TX_LIMITS = [5, 10, 20];
const PERIODS = [
    { id: 'today', label: 'Сегодня' },
    { id: 'week',  label: 'Неделя'  },
    { id: 'month', label: 'Месяц'   },
    { id: 'all',   label: 'Всё'     },
];

// ── Icons ────────────────────────────────────────────────────
const ArrowLeft = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6"/>
    </svg>
);
const DumbbellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829 2 2 0 1 1 2.828 2.829l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>
    </svg>
);
const SteamIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
    </svg>
);
const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);
const LayoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
);
const BarChartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
);
const PiggyBankIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 5c-1.5 0-2.7 1.1-3 2.5-3.7-1.3-11-.2-11 5 0 1.4.5 2.3 1 3v3.5h3V17h4v1.5h3V15c1-.6 1.7-1.7 2-3h2V8h-2c-.2-1.1-.7-2-3-3Z"/>
        <path d="M9 12h.01"/>
    </svg>
);

// ── EmptyHint ─────────────────────────────────────────────────
function EmptyHint({ icon, title, hint, action, onAction }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '28px 20px', textAlign: 'center',
        }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>{hint}</div>
            {action && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }} onClick={onAction}>
                    {action}
                </button>
            )}
        </div>
    );
}

// ── SetupGuide ────────────────────────────────────────────────
function SetupGuide({ hasCategories, hasAccounts, onAddCategory, onAddAccount }) {
    const steps = [
        {
            done: hasAccounts,
            num: 1,
            title: 'Создайте счёт',
            hint: 'Счёт — это карта, наличные или любой источник средств.',
            action: '+ Создать счёт',
            onAction: onAddAccount,
        },
        {
            done: hasCategories,
            num: 2,
            title: 'Создайте категорию',
            hint: 'Категории помогают группировать расходы: еда, транспорт, развлечения.',
            action: '+ Создать категорию',
            onAction: onAddCategory,
        },
        {
            done: false,
            num: 3,
            title: 'Добавьте первую транзакцию',
            hint: 'Когда есть счёт и категория — нажмите «+ Транзакция» в правом верхнем углу.',
            action: null,
        },
    ];

    return (
        <div className="card" style={{ marginBottom: 20, padding: '20px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
                С чего начать?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
                Выполните три шага, чтобы начать отслеживать финансы
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {steps.map(s => (
                    <div key={s.num} style={{
                        display: 'flex', gap: 14, alignItems: 'flex-start',
                        padding: '12px 14px', borderRadius: 10,
                        border: `1px solid ${s.done ? 'var(--brand)' : 'var(--border)'}`,
                        background: s.done ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                        opacity: s.done ? 0.7 : 1,
                    }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: '50%', flex: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800,
                            background: s.done ? 'var(--brand)' : 'var(--surface-card)',
                            color: s.done ? '#fff' : 'var(--text-muted)',
                            border: `1.5px solid ${s.done ? 'var(--brand)' : 'var(--border)'}`,
                        }}>
                            {s.done ? '✓' : s.num}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>
                                {s.title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.hint}</div>
                        </div>
                        {!s.done && s.action && (
                            <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={s.onAction}>
                                {s.action}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── FinancePage ───────────────────────────────────────────────
export default function FinancePage() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeSection, setActiveSection] = useState('overview');

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [addTransaction, setAddTransaction] = useState(null);
    const [editTransaction, setEditTransaction] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [addCategory, setAddCategory] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [addAccount, setAddAccount] = useState(null);

    const [txLimit, setTxLimit] = useState(5);
    const [periodFilter, setPeriodFilter] = useState('all');
    const [catExpanded, setCatExpanded] = useState(false);
    const [accExpanded, setAccExpanded] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    useEffect(() => {
        Promise.all([getCategories(), getTransactions({ size: 500 }), getAccounts()])
            .then(([catRes, txRes, accRes]) => {
                setCategories(catRes.data.items ?? []);
                setAllTransactions(txRes.data.items ?? []);
                setAccounts(accRes.data.items ?? []);
            })
            .finally(() => setLoading(false));
    }, []);

    const categoriesMap = useMemo(
        () => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]
    );
    const accountsMap = useMemo(
        () => Object.fromEntries(accounts.map(a => [a.id, a.name])), [accounts]
    );

    // ── Derived data ──
    const totalBalance = useMemo(
        () => allTransactions.reduce((s, tx) => tx.replenishment ? s + tx.amount : s - tx.amount, 0),
        [allTransactions]
    );

    const sortedTransactions = useMemo(
        () => [...allTransactions].sort((a, b) => {
            if (!a.transaction_date) return 1;
            if (!b.transaction_date) return -1;
            return b.transaction_date.localeCompare(a.transaction_date);
        }),
        [allTransactions]
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

    const visibleCategories = catExpanded ? categories : categories.slice(0, SECTION_LIMIT);
    const visibleAccounts   = accExpanded ? accounts   : accounts.slice(0, SECTION_LIMIT);

    const isNewUser = allTransactions.length === 0 && (categories.length === 0 || accounts.length === 0);

    const sections = [
        { id: 'overview',   label: 'Общая информация', icon: <LayoutIcon />    },
        { id: 'analytics',  label: 'Аналитика',         icon: <BarChartIcon /> },
        { id: 'savings',    label: 'Накопления',        icon: <PiggyBankIcon /> },
    ];

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} aria-label="Назад">
                        <ArrowLeft />
                    </button>
                    <span className="finance-nav-brand">Финансы</span>
                </div>
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Выйти</button>
                </div>
            </nav>

            <div className="finance-body">
                {/* Module quick-nav */}
                <nav className="finance-module-nav">
                    <span className="finance-module-nav__label">Модули</span>
                    <button className="finance-module-nav__btn finance-module-nav__btn--home" onClick={() => navigate('/')} title="Главная">
                        <HomeIcon /><span>Главная</span>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--workouts" onClick={() => navigate('/workouts')} title="Тренировки">
                        <DumbbellIcon /><span>Трен.</span>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--steam" onClick={() => navigate('/steam')} title="Steam">
                        <SteamIcon /><span>Steam</span>
                    </button>
                </nav>

                {/* Section sidebar */}
                <aside style={{
                    width: 200, flex: 'none', position: 'sticky', top: 56,
                    height: 'calc(100vh - 56px)', padding: '16px 10px',
                    background: 'var(--surface-card)', borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    backdropFilter: 'blur(12px)',
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', padding: '0 10px 8px' }}>
                        Финансы
                    </div>
                    {sections.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8, border: 'none',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                            width: '100%', fontFamily: 'inherit',
                            color: s.id === activeSection ? 'var(--brand)' : 'var(--text-body)',
                            background: s.id === activeSection ? 'var(--brand-subtle)' : 'transparent',
                        }}>
                            {s.icon}<span>{s.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <main className="finance-main">
                    {activeSection === 'overview' && (
                        <>
                            {/* ── Онбординг ── */}
                            {isNewUser && (
                                <SetupGuide
                                    hasCategories={categories.length > 0}
                                    hasAccounts={accounts.length > 0}
                                    onAddCategory={() => setAddCategory({})}
                                    onAddAccount={() => setAddAccount({})}
                                />
                            )}

                            {/* ── Суммарный баланс ── */}
                            {allTransactions.length > 0 && (
                                <div className="card" style={{ marginBottom: 20, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 4 }}>
                                            Общий баланс
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: totalBalance >= 0 ? 'var(--brand)' : '#ef4444', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-.02em' }}>
                                            {totalBalance >= 0 ? '+' : '−'}{fmt(Math.abs(totalBalance))} ₽
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                                            по всем транзакциям · {allTransactions.length} операций
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 24 }}>
                                        {[
                                            { label: 'Доходы',  value: allTransactions.filter(t =>  t.replenishment).reduce((s,t) => s + t.amount, 0), color: 'var(--brand)' },
                                            { label: 'Расходы', value: allTransactions.filter(t => !t.replenishment).reduce((s,t) => s + t.amount, 0), color: '#ef4444'     },
                                        ].map(item => (
                                            <div key={item.label} style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono,monospace' }}>
                                                    {fmt(item.value)} ₽
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Кнопки создания ── */}
                            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => setAddTransaction({})}>+ Транзакция</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddCategory({})}>+ Категория</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddAccount({})}>+ Счёт</button>
                            </div>

                            {/* ── Двухколоночная сетка ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, alignItems: 'start' }}>

                                {/* Левая колонка — транзакции */}
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
                                                icon="💸"
                                                title="Транзакций нет"
                                                hint={periodFilter !== 'all'
                                                    ? 'За этот период операций не найдено. Попробуйте другой период.'
                                                    : 'Нажмите «+ Транзакция» выше, чтобы добавить первую операцию.'}
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
                                                            onClick={() => setSelectedTransaction(t)}
                                                            isSelected={selectedTransaction?.id === t.id}
                                                            categories={categoriesMap}
                                                        />
                                                    ))}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Правая колонка — счета + категории */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                    {/* Счета */}
                                    <div className="card" style={{ overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Счета</span>
                                            <span className="section-count">{accounts.length}</span>
                                        </div>
                                        {accounts.length === 0 ? (
                                            <EmptyHint
                                                icon="💳"
                                                title="Нет счетов"
                                                hint="Счёт — это карта, наличные или кошелёк. Добавьте хотя бы один."
                                                action="+ Создать счёт"
                                                onAction={() => setAddAccount({})}
                                            />
                                        ) : (
                                            <div style={{ padding: '10px 12px' }}>
                                                <div className="entity-grid">
                                                    {visibleAccounts.map(a => (
                                                        <AccountItem key={a.id} account={a}
                                                            onClick={() => setSelectedAccount(a)}
                                                            isSelected={selectedAccount?.id === a.id} />
                                                    ))}
                                                </div>
                                                {accounts.length > SECTION_LIMIT && (
                                                    <button onClick={() => setAccExpanded(x => !x)} style={{
                                                        marginTop: 8, padding: '4px 12px', borderRadius: 6,
                                                        border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                        color: 'var(--text-muted)', fontFamily: 'inherit',
                                                    }}>
                                                        {accExpanded ? 'Свернуть' : `Ещё ${accounts.length - SECTION_LIMIT}`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Категории */}
                                    <div className="card" style={{ overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Категории</span>
                                            <span className="section-count">{categories.length}</span>
                                        </div>
                                        {categories.length === 0 ? (
                                            <EmptyHint
                                                icon="🏷️"
                                                title="Нет категорий"
                                                hint="Категории нужны для классификации транзакций. Без них нельзя добавить операцию."
                                                action="+ Создать категорию"
                                                onAction={() => setAddCategory({})}
                                            />
                                        ) : (
                                            <div style={{ padding: '10px 12px' }}>
                                                <div className="entity-grid">
                                                    {visibleCategories.map(c => (
                                                        <CategoryItem key={c.id} category={c}
                                                            onClick={() => setSelectedCategory(c)}
                                                            isSelected={selectedCategory?.id === c.id} />
                                                    ))}
                                                </div>
                                                {categories.length > SECTION_LIMIT && (
                                                    <button onClick={() => setCatExpanded(x => !x)} style={{
                                                        marginTop: 8, padding: '4px 12px', borderRadius: 6,
                                                        border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                        color: 'var(--text-muted)', fontFamily: 'inherit',
                                                    }}>
                                                        {catExpanded ? 'Свернуть' : `Ещё ${categories.length - SECTION_LIMIT}`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </>
                    )}

                    {activeSection === 'analytics' && (
                        <FinanceAnalytics
                            transactions={allTransactions}
                            categories={categories}
                            categoriesMap={categoriesMap}
                            accountsMap={accountsMap}
                        />
                    )}

                    {activeSection === 'savings' && (
                        <Savings categoriesMap={categoriesMap} />
                    )}
                </main>
            </div>

            {/* Modals */}
            {selectedTransaction && (
                <TransactionModel transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onDelete={async (id) => { await deleteTransaction(id); setAllTransactions(p => p.filter(t => t.id !== id)); setSelectedTransaction(null); }}
                    onEdit={(tx) => { setSelectedTransaction(null); setEditTransaction(tx); }}
                    categoriesMap={categoriesMap} accountsMap={accountsMap}
                />
            )}
            {addTransaction && (
                <AddTransactionModel onClose={() => setAddTransaction(null)}
                    onSaved={(tx) => setAllTransactions(p => [tx, ...p])} />
            )}
            {editTransaction && (
                <EditTransactionModel transaction={editTransaction}
                    onClose={() => setEditTransaction(null)}
                    onSaved={(u) => setAllTransactions(p => p.map(t => t.id === u.id ? u : t))} />
            )}
            {selectedCategory && (
                <CategoryModel category={selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                    onDelete={async (id) => { await deleteCategory(id); setCategories(p => p.filter(c => c.id !== id)); setSelectedCategory(null); }}
                    onUpdate={(updated) => {
                        setCategories(p => p.map(c => c.id === updated.id ? updated : c));
                        setSelectedCategory(updated);
                    }}
                />
            )}
            {addCategory && (
                <AddCategoryModel onClose={() => setAddCategory(null)}
                    onSaved={(c) => setCategories(p => [c, ...p])} />
            )}
            {selectedAccount && (
                <AccountModel account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onDelete={async (id) => { await deleteAccount(id); setAccounts(p => p.filter(a => a.id !== id)); setSelectedAccount(null); }}
                    onUpdate={(updated) => {
                        setAccounts(p => p.map(a => a.id === updated.id ? updated : a));
                        setSelectedAccount(updated);
                    }}
                />
            )}
            {addAccount && (
                <AddAccountModel onClose={() => setAddAccount(null)}
                    onSaved={(a) => setAccounts(p => [a, ...p])} />
            )}
        </div>
    );
}