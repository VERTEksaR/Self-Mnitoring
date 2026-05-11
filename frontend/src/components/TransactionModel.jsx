import {useEffect, useState} from 'react';

import { getCategories, getAccounts, createTransaction, updateTransaction } from '../api/api';
import { TransactionForm } from './TransactionForm';


export function AddTransactionModel({ onClose, onSaved }) {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');

    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState('');

    const [form, setForm] = useState({
        amount: '',
        destination: '',
        replenishment: false,
        transaction_date: '',
        cashback: '',
    });

    useEffect(() => {
        getAccounts().then(res => {
            setAccounts(res.data.items ?? []);
        });
    }, []);

    useEffect(() => {
        getCategories().then(res => {
            setCategories(res.data.items ?? []);
        });
    }, []);

    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // account_id, category_id, user_id — именно такие поля ждёт TransactionCreate на бэке
        const payload = {
            ...form,
            amount: Number(form.amount),
            cashback: Number(form.cashback),
            account_id: Number(accountId),
            category_id: Number(categoryId),
            user_id: Number(localStorage.getItem('user_id')),
        };

        try {
            const res = await createTransaction(payload);
            console.log('created', res.data);
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };

    return (
        <TransactionForm
            form={form}
            setForm={setForm}
            accounts={accounts}
            categories={categories}
            accountId={accountId}
            categoryId={categoryId}
            setAccountId={setAccountId}
            setCategoryId={setCategoryId}
            onSubmit={handleSubmit}
            onClose={onClose}
        />
    );
}


export function EditTransactionModel({ transaction, onClose, onSaved }) {

    const [categories, setCategories] = useState([]);
    // Бэк возвращает category_id (число), не вложенный объект
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
        getAccounts().then(res => {
            setAccounts(res.data.items ?? []);
        });
    }, []);

    useEffect(() => {
        getCategories().then(res => {
            setCategories(res.data.items ?? []);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            amount: Number(form.amount),
            cashback: Number(form.cashback),
            account_id: Number(accountId),
            category_id: Number(categoryId),
            user_id: Number(localStorage.getItem('user_id')),
        };

        try {
            const res = await updateTransaction(transaction.id, payload);
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.error(err.response?.data || err);
        };
    };

    return (
         <TransactionForm
            form={form}
            setForm={setForm}
            accounts={accounts}
            categories={categories}
            accountId={accountId}
            categoryId={categoryId}
            setAccountId={setAccountId}
            setCategoryId={setCategoryId}
            onSubmit={handleSubmit}
            onClose={onClose}
        />
    );
}


export function TransactionModel({ transaction, onClose, onDelete, onEdit, categoriesMap = {}, accountsMap = {} }) {

    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h3>Детали транзакции</h3>

                <p><strong>Счет:</strong> {accountsMap[transaction.account_id] ?? transaction.account_id}</p>
                <p><strong>Сумма:</strong> {transaction.amount}</p>
                <p><strong>Категория:</strong> {categoriesMap[transaction.category_id] ?? transaction.category_id}</p>
                <p><strong>Описание:</strong> {transaction.destination}</p>
                <p><strong>Дата:</strong> {transaction.transaction_date}</p>

                <button onClick={() => onDelete(transaction.id)}>
                    Удалить
                </button>

                <button onClick={() => onEdit(transaction)}>
                    Изменить
                </button>

                <button onClick={onClose}>
                    Закрыть
                </button>
            </div>
        </div>
    );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "8px",
  minWidth: "300px",
};