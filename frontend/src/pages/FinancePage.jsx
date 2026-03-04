import { useEffect, useState, useMemo } from 'react';
import { getCategories, getTransactions , getAccounts} from '../api/finance';
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
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [addTransaction, setAddTransaction] = useState(null);
    const [editTransaction, setEditTransaction] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [addCategory, setAddCategory] = useState(null);

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [addAccount, setAddAccount] = useState(null);

    const [categoryFilter, setCategoryFilter] = useState('');
    const [accountFilter, setAccountFilter] = useState('');

    const [draftRange, setDraftRange] = useState({
        from: undefined,
        to: undefined,
    });

    const [activeRange, setActiveRange] = useState({
        from: undefined,
        to: undefined,
    });

    const loadTransactions = async (params = {}) => {
        const res = await getTransactions(params);
        setTransactions(res.data);
    };

    const resetFilter = () => {
        setDraftRange({ from: null, to: null });
        setActiveRange({ from: null, to: null });
        setCategoryFilter('');
        setAccountFilter('');
    };

    const TransactionDelete = async (id) => {
        await deleteTransaction(id);

        setTransactions(prev =>
            prev.filter(tx => tx.id !== id)
        );

        setSelectedTransaction(null);
    }

    const CategoryDelete = async (id) => {
        await deleteCategory(id);

        setCategories(prev =>
            prev.filter(c => c.id !== id)
        );

        setSelectedCategory(null);
    }

    const AccountDelete = async (id) => {
        await deleteAccount(id);

        setAccounts(prev =>
            prev.filter(a => a.id !== id)
        );

        setSelectedAccount(null);
    }

    useEffect(() => {
        if (!activeRange.from && !activeRange.to) {
            loadTransactions();
            return;
        };
        loadTransactions({

            date_from: activeRange.from ? SetFormatDate(activeRange.from) : undefined,
            date_to: activeRange.to ? SetFormatDate(activeRange.to) : undefined,
            category_id: categoryFilter || undefined,
            account_id: accountFilter || undefined,
        });
    }, [activeRange, categoryFilter, accountFilter]);

    const totals = getTotals(transactions);
    const totalByCategories = totalByCategory(transactions);

    useEffect(() => {
        Promise.all([getCategories(), getAccounts()])
            .then(([categoriesRes, accountsRes]) => {
                setCategories(categoriesRes.data);
                setAccounts(accountsRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const categoriesMap = useMemo(() => {
        return Object.fromEntries(
            categories.map(cat => [cat.id, cat.name]));
    }, [categories])

    if (loading) return <p>Загрузка...</p>

    return (
        <div>
            <h1>Денежная страница</h1>
            <div style={{ display: "flex", gap: "20px" }}>
                {/*  тут будет календарь  */}
                <div style={{ width: "250px", borderRight: "1px solid #ddd" }}>
                    <h3>Просмотр по дате</h3>
                    <div>
                        <DateRangeCalendar
                            draftRange={draftRange}
                            onChange={setDraftRange}
                        />
                    </div>
                    <div>
                        <label>Категория:</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="">Укажите категорию</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Счет:</label>
                        <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)}>
                            <option value="">Укажите счет</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => setActiveRange(draftRange)}>
                        Применить
                    </button>
                    <button onClick={resetFilter}>
                        Сбросить
                    </button>
                </div>
                {/*   тут будут транзакции  */}
                <div style={{ width: "350px", margin: "20px" }}>
                    <h3>Расходы по категориям</h3>
                    <CategoryPieChart
                        data={totalByCategories}
                        onClickCategory={(categoryName) => {
                            const category = categories.find(c => c.name === categoryName);
                            if (category) {
                                setCategoryFilter(category.id);
                            };
                        }}
                    />
                </div>
                <div style={{ flex: 1,  width: "400px" }}>
                    <h3>Операции</h3>
                    {transactions.length === 0 && <p>Нет транзакций</p>}

                    {transactions.map((t) => (
                        <TransactionItem key={t.id} transaction={t}
                        onClick={() => setSelectedTransaction(t)}
                        isSelected={selectedTransaction?.id === t.id}
                        categories={categoriesMap}/>
                    ))}
                </div>
                <div>
                    <button onClick={() => setAddTransaction({})}>
                        + Добавить транзакцию
                    </button>
                    <div>
                        <p>Доход: <strong>{totals.income}</strong></p>
                        <p>Расход: <strong>{totals.expense}</strong></p>
                        <div style={{
                            color: totals.isIncome ? "green" : "red"
                        }}>
                            <p>Итого: <strong>{totals.balance}</strong></p>
                        </div>
                    </div>
                    <div>
                        <h4>Топ категорий по тратам</h4>
                        {totalByCategories.length === 0 && (
                            <p>Нет данных</p>
                        )}

                        {totalByCategories.map((c) => (
                            <div key={c.category}>
                                {c.category}: <strong>{c.total}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ width: "250px" }}>
                </div>
                <div style={{ flex: 1, width: "400px" }}>
                    <h3>Категории трат</h3>
                    { categories.length === 0 && <p>Нет категорий</p> }

                    {categories.map((c) => (
                        <CategoryItem key={c.id} category={c}
                        onClick={() => setSelectedCategory(c)}
                        isSelected={selectedCategory?.id === c.id}/>
                    ))}
                </div>
                <div>
                    <button onClick={() => setAddCategory({})}>
                        + Добавить категорию
                    </button>
                </div>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ width: "250px" }}>
                </div>
                <div style={{ flex: 1, width: "400px" }}>
                    <h3>Счета</h3>
                    { accounts.length === 0 && <p>Нет счетов</p> }

                    {accounts.map((a) => (
                        <AccountItem key={a.id} account={a}
                        onClick={() => setSelectedAccount(a)}
                        isSelected={selectedAccount?.id === a.id}/>
                    ))}
                </div>
                <div>
                    <button onClick={() => setAddAccount({})}>
                        + Добавить счет
                    </button>
                </div>
            </div>
            {selectedTransaction && (
                <TransactionModel transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onDelete={TransactionDelete}
                    onEdit={(tx) => {
                        setSelectedTransaction(null);
                        setEditTransaction(tx);
                    }}
                    />
            )}
            {addTransaction && (
                <AddTransactionModel onClose={() => setAddTransaction(null)}
                    onSaved={(newTransaction) => {
                        setTransactions(prev => [newTransaction, ...prev])}}/>
            )}
            {editTransaction && (
                <EditTransactionModel
                    transaction={editTransaction}
                    onClose={() => setEditTransaction(null)}
                    onSaved={(updatedTransaction) => {
                        setTransactions(prev =>
                            prev.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx)
                        );
                    }}
                />
            )}

            {selectedCategory && (
                <CategoryModel category={selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                    onDelete={CategoryDelete}/>
            )}
            {addCategory && (
                <AddCategoryModel onClose={() => setAddCategory(null)}
                    onSaved={(newCategory) => {
                        setCategories(prev => [newCategory, ...prev])
                    }}
                />
            )}

        {selectedAccount && (
            <AccountModel account={selectedAccount}
                onClose={() => setSelectedAccount(null)}
                onDelete={AccountDelete}/>
        )}
        {addAccount && (
            <AddAccountModel onClose={() => setAddAccount(null)}
                onSaved={(newAccount) =>{
                    setAccounts(prev => [newAccount, ...prev])
                }}
            />
        )}
        </div>
    );
}


