import { useEffect, useState } from 'react';
import { getCategories, getAccounts, createTransaction, updateTransaction } from '../api/api';
import { TransactionForm } from './TransactionForm';

const fmt = (amount) =>
    Number(amount).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });


export function AddTransactionModel({ onClose, onSaved }) {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState('');
    const [form, setForm] = useState({
        amount: '', destination: '', replenishment: false,
        transaction_date: '', cashback: '',
    });

    useEffect(() => {
        getAccounts().then(res => setAccounts(res.data.items ?? []));
        getCategories().then(res => setCategories(res.data.items ?? []));
    }, []);

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createTransaction({
                ...form,
                amount: Number(form.amount),
                cashback: Number(form.cashback),
                account_id: Number(accountId),
                category_id: Number(categoryId),
            });
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };

    return (
        <TransactionForm
            form={form} setForm={setForm}
            accounts={accounts} categories={categories}
            accountId={accountId} categoryId={categoryId}
            setAccountId={setAccountId} setCategoryId={setCategoryId}
            onSubmit={handleSubmit} onClose={onClose}
        />
    );
}


export function EditTransactionModel({ transaction, onClose, onSaved }) {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(transaction.category_id);
    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState(transaction.account_id);
    const [form, setForm] = useState({
        amount: transaction.amount,
        destination: transaction.destination,
        replenishment: transaction.replenishment,
        transaction_date: transaction.transaction_date,
        cashback: transaction.cashback,
    });

    useEffect(() => {
        getAccounts().then(res => setAccounts(res.data.items ?? []));
        getCategories().then(res => setCategories(res.data.items ?? []));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateTransaction(transaction.id, {
                ...form,
                amount: Number(form.amount),
                cashback: Number(form.cashback),
                account_id: Number(accountId),
                category_id: Number(categoryId),
            });
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };

    return (
        <TransactionForm
            form={form} setForm={setForm}
            accounts={accounts} categories={categories}
            accountId={accountId} categoryId={categoryId}
            setAccountId={setAccountId} setCategoryId={setCategoryId}
            onSubmit={handleSubmit} onClose={onClose}
        />
    );
}


export function TransactionModel({ transaction, onClose, onDelete, onEdit, categoriesMap = {}, accountsMap = {} }) {
    const isIncome = transaction.replenishment;

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Детали транзакции</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <p>
                        <strong>Сумма:</strong>
                        <span className={`amount ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                            {isIncome ? '+' : '−'}{fmt(transaction.amount)} ₽
                        </span>
                    </p>
                    {transaction.cashback > 0 && (
                        <p>
                            <strong>Кэшбэк:</strong>
                            <span className="amount amount-cashback">+{fmt(transaction.cashback)} ₽</span>
                        </p>
                    )}
                    <p><strong>Счёт:</strong> {accountsMap[transaction.account_id] ?? '—'}</p>
                    <p><strong>Категория:</strong> {categoriesMap[transaction.category_id] ?? '—'}</p>
                    {transaction.destination && (
                        <p><strong>Описание:</strong> {transaction.destination}</p>
                    )}
                    <p><strong>Дата:</strong> {transaction.transaction_date}</p>
                    <p>
                        <strong>Тип:</strong>{' '}
                        <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                            {isIncome ? 'Доход' : 'Расход'}
                        </span>
                    </p>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-danger" onClick={() => onDelete(transaction.id)}>
                        Удалить
                    </button>
                    <button className="btn btn-secondary" onClick={() => onEdit(transaction)}>
                        Изменить
                    </button>
                    <button className="btn btn-primary" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
