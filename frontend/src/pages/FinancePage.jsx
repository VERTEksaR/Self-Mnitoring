import { useEffect, useState, useMemo } from 'react';
import { getCategories, getTransactions, getAccounts } from '../api/finance';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionModel, AddTransactionModel, EditTransactionModel } from '../components/TransactionModel';
import { getTotals, totalByCategory } from '../utils/financeStats';

import { CategoryItem } from '../components/CategoryItem';
import { CategoryModel, AddCategoryModel } from '../components/CategoryModel';

import { AccountItem } from '../components/AccountItem';
import { AccountModel, AddAccountModel } from '../components/AccountModel';

import { DateRangeCalendar } from '../components/calendar/Calendar';
import { SetFormatDate } from '../components/calendar/FormatingDate';

import { CategoryPieChart } from '../components/charts/PieChart';

import { deleteTransaction, deleteCategory, deleteAccount } from '../api/api';


export default function FinancePage() {
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

    // Множественные фильтры: массивы выбранных ID
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [accountFilters, setAccountFilters] = useState([]);

    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

    const transactions = allTransactions;

    const toggleCategory = (id) => {
        setCategoryFilters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAccount = (id) => {
        setAccountFilters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const loadTransactions = async (params = {}) => {
        const res = await getTransactions({ ...params, size: 500 });
        setAllTransactions(res.data.items ?? []);
    };

    const resetFilter = () => {
        setDateRange({ from: undefined, to: undefined });
        setCategoryFilters([]);
        setAccountFilters([]);
    };

    const TransactionDelete = async (id) => {
        await deleteTransaction(id);
        setAllTransactions(prev => prev.filter(tx => tx.id !== id));
        setSelectedTransaction(null);
    };

    const CategoryDelete = async (id) => {
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        setSelectedCategory(null);
    };

    const AccountDelete = async (id) => {
        await deleteAccount(id);
        setAccounts(prev => prev.filter(a => a.id !== id));
        setSelectedAccount(null);
    };

    useEffect(() => {
        loadTransactions({
            transaction_date_from: dateRange.from ? SetFormatDate(dateRange.from) : undefined,
            transaction_date_to: dateRange.to ? SetFormatDate(dateRange.to) : undefined,
            category_id: categoryFilters.length > 0 ? categoryFilters : undefined,
            account_id: accountFilters.length > 0 ? accountFilters : undefined,
        });
    }, [dateRange, categoryFilters, accountFilters]);

    useEffect(() => {
        Promise.all([getCategories(), getAccounts()])
            .then(([categoriesRes, accountsRes]) => {
                setCategories(categoriesRes.data.items ?? []);
                setAccounts(accountsRes.data.items ?? []);
            })
            .finally(() => setLoading(false));
    }, []);

    const categoriesMap = useMemo(() => {
        return Object.fromEntries(categories.map(cat => [cat.id, cat.name]));
    }, [categories]);

    const accountsMap = useMemo(() => {
        return Object.fromEntries(accounts.map(acc => [acc.id, acc.name]));
    }, [accounts]);

    const totals = getTotals(transactions);
    const totalByCategories = totalByCategory(transactions, categoriesMap);

    if (loading) return <p>Загрузка...</p>;

    return (
        <div>
            <h1>Денежная страница</h1>
            <div style={{ display: "flex", gap: "20px" }}>
                {/* Боковая панель фильтров */}
                <div style={{ width: "200px", flexShrink: 0, borderRight: "1px solid #ddd", paddingRight: "12px" }}>
                    <h3 style={{ marginTop: 0 }}>Фильтры</h3>

                    <DateRangeCalendar draftRange={dateRange} onChange={setDateRange} />

                    <div style={{ marginTop: "8px" }}>
                        <strong style={{ fontSize: "13px" }}>Категории</strong>
                        <div style={{ maxHeight: "140px", overflowY: "auto", marginTop: "4px" }}>
                            {categories.map(c => (
                                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", padding: "2px 0" }}>
                                    <input
                                        type="checkbox"
                                        checked={categoryFilters.includes(c.id)}
                                        onChange={() => toggleCategory(c.id)}
                                    />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <strong style={{ fontSize: "13px" }}>Счета</strong>
                        <div style={{ maxHeight: "100px", overflowY: "auto", marginTop: "4px" }}>
                            {accounts.map(a => (
                                <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", padding: "2px 0" }}>
                                    <input
                                        type="checkbox"
                                        checked={accountFilters.includes(a.id)}
                                        onChange={() => toggleAccount(a.id)}
                                    />
                                    {a.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button onClick={resetFilter} style={{ marginTop: "12px", width: "100%" }}>
                        Сбросить
                    </button>
                </div>

                {/* Диаграмма */}
                <div style={{ width: "320px", flexShrink: 0 }}>
                    <h3>Расходы по категориям</h3>
                    <CategoryPieChart
                        data={totalByCategories}
                        onClickCategory={(categoryName) => {
                            const category = categories.find(c => c.name === categoryName);
                            if (category) toggleCategory(category.id);
                        }}
                    />
                </div>

                {/* Список транзакций */}
                <div style={{ flex: 1 }}>
                    <h3>Операции</h3>
                    {transactions.length === 0 && <p>Нет транзакций</p>}
                    {transactions.map((t) => (
                        <TransactionItem key={t.id} transaction={t}
                            onClick={() => setSelectedTransaction(t)}
                            isSelected={selectedTransaction?.id === t.id}
                            categories={categoriesMap} />
                    ))}
                </div>

                {/* Итоги */}
                <div style={{ flexShrink: 0, minWidth: "160px" }}>
                    <button onClick={() => setAddTransaction({})}>
                        + Добавить транзакцию
                    </button>
                    <div style={{ marginTop: "12px" }}>
                        <p style={{ margin: "4px 0" }}>Доход: <strong>{totals.income}</strong></p>
                        <p style={{ margin: "4px 0" }}>Расход: <strong>{totals.expense}</strong></p>
                        <p style={{ margin: "4px 0", color: totals.isIncome ? "green" : "red" }}>
                            Итого: <strong>{totals.balance}</strong>
                        </p>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                        <strong>Расходы по категориям</strong>
                        {totalByCategories.length === 0 && <p>Нет данных</p>}
                        {totalByCategories.map((c) => (
                            <div key={c.category} style={{ fontSize: "13px", margin: "3px 0" }}>
                                {c.category}: <strong>{c.total}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Категории и счета */}
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <div style={{ width: "200px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <h3>Категории трат</h3>
                    {categories.length === 0 && <p>Нет категорий</p>}
                    {categories.map((c) => (
                        <CategoryItem key={c.id} category={c}
                            onClick={() => setSelectedCategory(c)}
                            isSelected={selectedCategory?.id === c.id} />
                    ))}
                </div>
                <div>
                    <button onClick={() => setAddCategory({})}>+ Добавить категорию</button>
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <div style={{ width: "200px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <h3>Счета</h3>
                    {accounts.length === 0 && <p>Нет счетов</p>}
                    {accounts.map((a) => (
                        <AccountItem key={a.id} account={a}
                            onClick={() => setSelectedAccount(a)}
                            isSelected={selectedAccount?.id === a.id} />
                    ))}
                </div>
                <div>
                    <button onClick={() => setAddAccount({})}>+ Добавить счет</button>
                </div>
            </div>

            {/* Модальные окна */}
            {selectedTransaction && (
                <TransactionModel transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onDelete={TransactionDelete}
                    onEdit={(tx) => {
                        setSelectedTransaction(null);
                        setEditTransaction(tx);
                    }}
                    categoriesMap={categoriesMap}
                    accountsMap={accountsMap}
                />
            )}
            {addTransaction && (
                <AddTransactionModel onClose={() => setAddTransaction(null)}
                    onSaved={(newTx) => setAllTransactions(prev => [newTx, ...prev])}
                />
            )}
            {editTransaction && (
                <EditTransactionModel
                    transaction={editTransaction}
                    onClose={() => setEditTransaction(null)}
                    onSaved={(updated) => {
                        setAllTransactions(prev =>
                            prev.map(tx => tx.id === updated.id ? updated : tx)
                        );
                    }}
                />
            )}
            {selectedCategory && (
                <CategoryModel category={selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                    onDelete={CategoryDelete}
                />
            )}
            {addCategory && (
                <AddCategoryModel onClose={() => setAddCategory(null)}
                    onSaved={(newCat) => setCategories(prev => [newCat, ...prev])}
                />
            )}
            {selectedAccount && (
                <AccountModel account={selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    onDelete={AccountDelete}
                />
            )}
            {addAccount && (
                <AddAccountModel onClose={() => setAddAccount(null)}
                    onSaved={(newAcc) => setAccounts(prev => [newAcc, ...prev])}
                />
            )}
        </div>
    );
}
