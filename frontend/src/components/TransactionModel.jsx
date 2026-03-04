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
            console.log(res.data)
            setAccounts(res.data);
        });
    }, []);

    useEffect(() => {
        getCategories().then(res => {
            setCategories(res.data);
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

        const payload = {
            ...form,
            amount: Number(form.amount),
            cashback: Number(form.cashback),
            account: Number(accountId),
            category: Number(categoryId)
        };

        console.log('send', payload);

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
    const [categoryId, setCategoryId] = useState(transaction.category.id);

    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState(transaction.account.id);

    const [form, setForm] = useState({
        amount: transaction.amount,
        destination: transaction.destination,
        replenishment: transaction.replenishment,
        transaction_date: transaction.transaction_date,
        cashback: transaction.cashback,
    });

     useEffect(() => {
         getAccounts().then(res => {
             setAccounts(res.data);
        });
    }, []);

    useEffect(() => {
        getCategories().then(res => {
            setCategories(res.data);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            amount: Number(form.amount),
            cashback: Number(form.cashback),
            account: Number(accountId),
            category: Number(categoryId)
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


export function TransactionModel({ transaction, onClose, onDelete, onEdit }) {

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

                <p><strong>Счет:</strong> {transaction.account.name}</p>
                <p><strong>Сумма:</strong> {transaction.amount}</p>
                <p><strong>Категория:</strong> {transaction.category.name}</p>
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