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

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="finance-page">
            {/* Нав */}
            <nav className="finance-nav">
                <div className="finance-nav-brand">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ padding:'4px 8px' }}>←</button>
                    Финансы
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Выйти</button>
            </nav>

            {/* Стат-карточки */}
            <div style={{ padding: '16px 20px 0' }}>
                <div className="stats-row">
                    <div className="card stat-card">
                        <span className="stat-card__label">Доход</span>
                        <span className="stat-card__value amount-income">+{fmt(totals.income)} ₽</span>
                    </div>
                    <div className="card stat-card">
                        <span className="stat-card__label">Расход</span>
                        <span className="stat-card__value amount-expense">−{fmt(totals.expense)} ₽</span>
                    </div>
                    <div className="card stat-card stat-card--accent">
                        <span className="stat-card__label">Баланс</span>
                        <span className="stat-card__value">
                            {totals.isIncome ? '+' : '−'}{fmt(Math.abs(totals.balance))} ₽
                        </span>
                    </div>
                </div>
            </div>

            {/* Тело */}
            <div className="finance-body">
                {/* Сайдбар */}
                <aside className="finance-sidebar">
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Период</div>
                        <DateRangeCalendar draftRange={dateRange} onChange={setDateRange} />
                    </div>

                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Категории</div>
                        <div className="filter-scroll">
                            {categories.map(c => (
                                <label key={c.id} className="checkbox-label">
                                    <input type="checkbox" checked={categoryFilters.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                                    {c.name}
                                </label>
                            ))}
                            {categories.length === 0 && <span style={{ fontSize:12, color:'var(--text-faint)' }}>Нет категорий</span>}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Счета</div>
                        <div className="filter-scroll">
                            {accounts.map(a => (
                                <label key={a.id} className="checkbox-label">
                                    <input type="checkbox" checked={accountFilters.includes(a.id)} onChange={() => toggleAccount(a.id)} />
                                    {a.name}
                                </label>
                            ))}
                            {accounts.length === 0 && <span style={{ fontSize:12, color:'var(--text-faint)' }}>Нет счетов</span>}
                        </div>
                    </div>

                    <button className="btn btn-secondary btn-full btn-sm" onClick={resetFilter}>
                        Сбросить фильтры
                    </button>
                </aside>

                {/* Главное */}
                <main className="finance-main">
                    <div className="charts-tx-row">
                        <div className="card chart-card">
                            <div className="section-title" style={{ marginBottom: 12 }}>По категориям</div>
                            <CategoryPieChart
                                data={totalByCategories}
                                onClickCategory={(name) => {
                                    const cat = categories.find(c => c.name === name);
                                    if (cat) toggleCategory(cat.id);
                                }}
                            />
                        </div>

                        <div className="card tx-card">
                            <div className="tx-list-header">
                                <span className="section-title">Операции</span>
                                <button className="btn btn-primary btn-sm" onClick={() => setAddTransaction({})}>+ Добавить</button>
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

                    <div className="card bottom-section">
                        <div className="section-header">
                            <span className="section-title">Категории</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setAddCategory({})}>+ Добавить</button>
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

                    <div className="card bottom-section">
                        <div className="section-header">
                            <span className="section-title">Счета</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setAddAccount({})}>+ Добавить</button>
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

            {/* Модалки */}
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
