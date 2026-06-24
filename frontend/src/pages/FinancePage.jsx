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

import { DateRangeCalendar } from '../components/calendar/Calendar';
import { SetFormatDate } from '../components/calendar/FormatingDate';

import { CategoryPieChart } from '../components/charts/PieChart';
import { getTotals, totalByCategory } from '../utils/financeStats';

const fmt = (n) =>
    Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const ChevronDown = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

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

const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);

const ArrowUp = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
    </svg>
);

const ArrowDown = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
    </svg>
);

const WalletIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7"/>
        <path d="M18 12h.01"/>
    </svg>
);

const FilterIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
    </svg>
);


export default function FinancePage() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [addTransaction, setAddTransaction] = useState(null);
    const [editTransaction, setEditTransaction] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [addCategory, setAddCategory] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [addAccount, setAddAccount] = useState(null);

    const [categoryFilters, setCategoryFilters] = useState([]);
    const [accountFilters, setAccountFilters] = useState([]);
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

    const [openSections, setOpenSections] = useState({ period: true, categories: true, accounts: true });
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    const toggleCategory = (id) =>
        setCategoryFilters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAccount = (id) =>
        setAccountFilters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const loadTransactions = async (params = {}) => {
        const res = await getTransactions({ ...params, size: 500 });
        setAllTransactions(res.data.items ?? []);
    };

    const resetFilter = () => {
        setDateRange({ from: undefined, to: undefined });
        setCategoryFilters([]);
        setAccountFilters([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    useEffect(() => {
        loadTransactions({
            transaction_date_from: dateRange.from ? SetFormatDate(dateRange.from) : undefined,
            transaction_date_to:   dateRange.to   ? SetFormatDate(dateRange.to)   : undefined,
            category_id: categoryFilters.length > 0 ? categoryFilters : undefined,
            account_id:  accountFilters.length  > 0 ? accountFilters  : undefined,
        });
    }, [dateRange, categoryFilters, accountFilters]);

    useEffect(() => {
        Promise.all([getCategories(), getAccounts()])
            .then(([catRes, accRes]) => {
                setCategories(catRes.data.items ?? []);
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

    const totals = getTotals(allTransactions);
    const totalByCategories = totalByCategory(allTransactions, categoriesMap);
    const activeFilterCount = categoryFilters.length + accountFilters.length + (dateRange.from ? 1 : 0);

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="finance-page">
            {/* Nav */}
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} aria-label="Назад">
                        <ArrowLeft />
                    </button>
                    <span className="finance-nav-brand">Финансы</span>
                </div>
                <div className="finance-nav-group">
                    <button className="btn btn-primary btn-sm" onClick={() => setAddTransaction({})}>+ Транзакция</button>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Выйти</button>
                </div>
            </nav>

            {/* Body */}
            <div className="finance-body">
                {/* Module quick-nav (left) */}
                <nav className="finance-module-nav">
                    <span className="finance-module-nav__label">Модули</span>
                    <button className="finance-module-nav__btn finance-module-nav__btn--home" onClick={() => navigate('/')} title="Главная">
                        <HomeIcon />
                        <span>Главная</span>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--workouts" onClick={() => navigate('/workouts')} title="Тренировки">
                        <DumbbellIcon />
                        <span>Трен.</span>
                    </button>
                </nav>

                {/* Sidebar */}
                <aside className={`finance-sidebar${drawerOpen ? ' finance-sidebar--open' : ''}`}>
                    <div className={`sidebar-section${openSections.period ? ' sidebar-section--open' : ''}`}>
                        <div className="sidebar-section-header" onClick={() => toggleSection('period')}>
                            <span className="sidebar-section-title">Период</span>
                            <span className="sidebar-section-chevron"><ChevronDown /></span>
                        </div>
                        <div className="sidebar-section-body">
                            <div className="sidebar-section-inner">
                                <div className="sidebar-section-content">
                                    <DateRangeCalendar draftRange={dateRange} onChange={setDateRange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`sidebar-section${openSections.categories ? ' sidebar-section--open' : ''}`}>
                        <div className="sidebar-section-header" onClick={() => toggleSection('categories')}>
                            <span className="sidebar-section-title">
                                Категории
                                {categoryFilters.length > 0 && (
                                    <span className="sidebar-section-badge">{categoryFilters.length}</span>
                                )}
                            </span>
                            <span className="sidebar-section-chevron"><ChevronDown /></span>
                        </div>
                        <div className="sidebar-section-body">
                            <div className="sidebar-section-inner">
                                <div className="sidebar-section-content">
                                    <div className="filter-scroll">
                                        {categories.map(c => (
                                            <label key={c.id} className="checkbox-label">
                                                <input type="checkbox" checked={categoryFilters.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                                                {c.name}
                                            </label>
                                        ))}
                                        {categories.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Нет категорий</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`sidebar-section${openSections.accounts ? ' sidebar-section--open' : ''}`}>
                        <div className="sidebar-section-header" onClick={() => toggleSection('accounts')}>
                            <span className="sidebar-section-title">Счета</span>
                            <span className="sidebar-section-chevron"><ChevronDown /></span>
                        </div>
                        <div className="sidebar-section-body">
                            <div className="sidebar-section-inner">
                                <div className="sidebar-section-content">
                                    <div className="filter-scroll">
                                        {accounts.map(a => (
                                            <label key={a.id} className="checkbox-label">
                                                <input type="checkbox" checked={accountFilters.includes(a.id)} onChange={() => toggleAccount(a.id)} />
                                                {a.name}
                                            </label>
                                        ))}
                                        {accounts.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Нет счетов</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-secondary btn-full btn-sm" onClick={resetFilter}>
                        Сбросить фильтры
                    </button>
                </aside>

                <div
                    className={`sidebar-backdrop${drawerOpen ? ' sidebar-backdrop--open' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                />

                {/* Main */}
                <main className="finance-main">
                    {/* Stats */}
                    <div className="stats-row">
                        <div className="card stat-card stat-card--income">
                            <div className="stat-card__head">
                                <span className="stat-card__icon"><ArrowUp /></span>
                                <span className="stat-card__label">Доход</span>
                            </div>
                            <span className="stat-card__value">+{fmt(totals.income)} ₽</span>
                            <span className="stat-card__sub">за период</span>
                        </div>
                        <div className="card stat-card stat-card--expense">
                            <div className="stat-card__head">
                                <span className="stat-card__icon"><ArrowDown /></span>
                                <span className="stat-card__label">Расход</span>
                            </div>
                            <span className="stat-card__value">−{fmt(totals.expense)} ₽</span>
                            <span className="stat-card__sub">за период</span>
                        </div>
                        <div className="card stat-card stat-card--accent">
                            <div className="stat-card__head">
                                <span className="stat-card__icon"><WalletIcon /></span>
                                <span className="stat-card__label">Баланс</span>
                            </div>
                            <span className="stat-card__value">
                                {totals.isIncome ? '+' : '−'}{fmt(Math.abs(totals.balance))} ₽
                            </span>
                            <span className="stat-card__sub">{totals.isIncome ? 'профицит' : 'дефицит'}</span>
                        </div>
                    </div>

                    {/* Chart + Transactions */}
                    <div className="charts-tx-row">
                        <div className="card chart-card">
                            <div className="section-header">
                                <span className="section-title">По категориям</span>
                            </div>
                            <div className="chart-canvas">
                                <CategoryPieChart
                                    data={totalByCategories}
                                    onClickCategory={(name) => {
                                        const cat = categories.find(c => c.name === name);
                                        if (cat) toggleCategory(cat.id);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="card tx-card">
                            <div className="tx-list-header">
                                <span className="section-title">Операции</span>
                                <span className="section-count">{allTransactions.length}</span>
                            </div>
                            <div className="tx-list">
                                {allTransactions.length === 0 && <div className="empty">Нет транзакций</div>}
                                {allTransactions.map(t => (
                                    <TransactionItem
                                        key={t.id} transaction={t}
                                        onClick={() => setSelectedTransaction(t)}
                                        isSelected={selectedTransaction?.id === t.id}
                                        categories={categoriesMap}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="card bottom-section">
                        <div className="section-header">
                            <span className="section-title">Категории</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className="section-count">{categories.length}</span>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddCategory({})}>+ Добавить</button>
                            </div>
                        </div>
                        {categories.length === 0
                            ? <div className="empty">Нет категорий</div>
                            : <div className="entity-grid">{categories.map(c => (
                                <CategoryItem key={c.id} category={c}
                                    onClick={() => setSelectedCategory(c)}
                                    isSelected={selectedCategory?.id === c.id} />
                            ))}</div>
                        }
                    </div>

                    {/* Accounts */}
                    <div className="card bottom-section">
                        <div className="section-header">
                            <span className="section-title">Счета</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className="section-count">{accounts.length}</span>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddAccount({})}>+ Добавить</button>
                            </div>
                        </div>
                        {accounts.length === 0
                            ? <div className="empty">Нет счетов</div>
                            : <div className="entity-grid">{accounts.map(a => (
                                <AccountItem key={a.id} account={a}
                                    onClick={() => setSelectedAccount(a)}
                                    isSelected={selectedAccount?.id === a.id} />
                            ))}</div>
                        }
                    </div>
                </main>

            </div>

            {/* Mobile FAB */}
            <button className="filter-fab" onClick={() => setDrawerOpen(true)}>
                <FilterIcon />
                Фильтры
                {activeFilterCount > 0 && <span className="filter-fab__count">{activeFilterCount}</span>}
            </button>

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
                    onDelete={async (id) => { await deleteCategory(id); setCategories(p => p.filter(c => c.id !== id)); setSelectedCategory(null); }} />
            )}
            {addCategory && (
                <AddCategoryModel onClose={() => setAddCategory(null)}
                    onSaved={(c) => setCategories(p => [c, ...p])} />
            )}
            {selectedAccount && (
                <AccountModel account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onDelete={async (id) => { await deleteAccount(id); setAccounts(p => p.filter(a => a.id !== id)); setSelectedAccount(null); }} />
            )}
            {addAccount && (
                <AddAccountModel onClose={() => setAddAccount(null)}
                    onSaved={(a) => setAccounts(p => [a, ...p])} />
            )}
        </div>
    );
}
