import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../api/finance/transactions.ts';
import { getCategories } from "../api/finance/categories.ts";
import { getAccounts } from "../api/finance/accounts.ts";
import { FinanceAnalytics } from '../components/FinanceAnalytics';
import { Savings } from '../components/finance/Savings.jsx';
import {FinanceModals} from "../components/finance/FinanceModals.jsx";
import {FinanceSummaryCard} from "../components/finance/FinanceSummaryCard.jsx";
import {TransactionsPanel} from "../components/finance/TransactionsPanel.jsx";
import {AccountsPanel} from "../components/finance/AccountsPanel.jsx";
import {CategoriesPanel} from "../components/finance/CategoriesPanel.jsx";

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

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    useEffect(() => {
        Promise.all([getCategories(), getTransactions({ size: 500 }), getAccounts()])
            .then(([catRes, txRes, accRes]) => {
                setCategories(catRes.items ?? []);
                setAllTransactions(txRes.items ?? []);
                setAccounts(accRes.items ?? []);
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
    const sections = [
        { id: 'overview',   label: 'Общая информация'},
        { id: 'analytics',  label: 'Аналитика'},
        { id: 'savings',    label: 'Накопления'},
    ];

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} aria-label="Назад">
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
                        <p>Главная</p>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--workouts" onClick={() => navigate('/workouts')} title="Тренировки">
                        <p>Тренировки</p>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--steam" onClick={() => navigate('/steam')} title="Steam">
                        <p>Steam</p>
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
                            <FinanceSummaryCard transactions={allTransactions} />

                            {/* ── Кнопки создания ── */}
                            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => setAddTransaction({})}>+ Транзакция</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddCategory({})}>+ Категория</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddAccount({})}>+ Счёт</button>
                            </div>

                            {/* ── Двухколоночная сетка ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 20, alignItems: 'start' }}>
                                <TransactionsPanel
                                    transactions={allTransactions}
                                    categoriesMap={categoriesMap}
                                    selectedTransaction={selectedTransaction}
                                    onSelect={setSelectedTransaction}
                                    onAdd={() => setAddTransaction({})}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <AccountsPanel
                                        accounts={accounts}
                                        selectedAccount={selectedAccount}
                                        onSelect={setSelectedAccount}
                                        onAdd={() => setAddAccount({})}
                                    />
                                    <CategoriesPanel
                                        categories={categories}
                                        selectedCategory={selectedCategory}
                                        onSelect={setSelectedCategory}
                                        onAdd={() => setAddCategory({})}
                                    />
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

            <FinanceModals
                selectedTransaction={selectedTransaction} setSelectedTransaction={setSelectedTransaction}
                addTransaction={addTransaction} setAddTransaction={setAddTransaction}
                editTransaction={editTransaction} setEditTransaction={setEditTransaction}
                selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                addCategory={addCategory} setAddCategory={setAddCategory}
                selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}
                addAccount={addAccount} setAddAccount={setAddAccount}
                categoriesMap={categoriesMap} accountsMap={accountsMap}
                setAllTransactions={setAllTransactions} setCategories={setCategories} setAccounts={setAccounts}
            />
        </div>
    );
}