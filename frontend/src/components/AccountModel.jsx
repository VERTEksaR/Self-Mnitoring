import { useEffect, useState } from 'react';
import { createAccount, updateAccount } from '../api/api';
import { AccountForm } from './AccountForm';


export function AddAccountModel({ onClose, onSaved }) {
    const [form, setForm] = useState({ name: '', account_type: 'Обычный', goal_amount: '' });

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createAccount({
                name: form.name,
                account_type: form.account_type,
                goal_amount: form.goal_amount === '' ? null : Number(form.goal_amount),
            });
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.log(err.response?.data || err);
        }
    };

    return <AccountForm form={form} setForm={setForm} onClose={onClose} onSubmit={handleSubmit} />;
}


export function AccountModel({ account, onClose, onDelete, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: account.name,
        account_type: account.account_type,
        goal_amount: account.goal_amount ?? '',
    });

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateAccount(account.id, {
                name: form.name,
                account_type: form.account_type,
                goal_amount: form.goal_amount === '' ? null : Number(form.goal_amount),
            });
            onUpdate?.(res.data);
            setEditing(false);
        } catch (err) {
            console.log(err.response?.data || err);
        }
    };

    if (editing) {
        return <AccountForm form={form} setForm={setForm} onClose={() => setEditing(false)} onSubmit={handleSubmit} />;
    }

    const isSavings = account.account_type === 'Накопительный';

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Счёт</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ margin: 0 }}><strong>Название:</strong> {account.name}</p>
                    <p style={{ margin: 0 }}><strong>Тип:</strong> {account.account_type}</p>
                    {isSavings && (
                        <p style={{ margin: 0 }}>
                            <strong>Цель:</strong> {account.goal_amount != null ? `${account.goal_amount} ₽` : 'без лимита'}
                        </p>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setEditing(true)}>Изменить</button>
                    <button className="btn btn-danger" onClick={() => onDelete(account.id)}>Удалить</button>
                    <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}
