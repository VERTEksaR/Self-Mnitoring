import { useEffect, useState } from 'react';
import { createAccount, updateAccount } from "../../../api/finance/accounts.ts";
import { AccountForm } from '../forms/AccountForm.jsx';
import {FormError} from "../../FormError.jsx";
import {extractErrorMessage} from "../../../utils/errors.ts";


export function AddAccountModel({ onClose, onSaved }) {
    const [form, setForm] = useState({ name: '', account_type: 'Обычный', goal_amount: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await createAccount({
                name: form.name,
                account_type: form.account_type,
                goal_amount: form.goal_amount === '' ? null : Number(form.goal_amount),
            });
            onSaved(res);
            onClose();
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось сохранить счёт'));
        }
    };

    return <AccountForm form={form} setForm={setForm} onClose={onClose} onSubmit={handleSubmit} error={error} />;
}


export function AccountModel({ account, onClose, onDelete, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
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
        setError(null);
        try {
            const res = await updateAccount(account.id, {
                name: form.name,
                account_type: form.account_type,
                goal_amount: form.goal_amount === '' ? null : Number(form.goal_amount),
            });
            onUpdate?.(res);
            setEditing(false);
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось сохранить счёт'));
        }
    };

    const handleDelete = async () => {
        setError(null);
        try {
            await onDelete(account.id);
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось удалить счёт'));   // 409: по счёту есть транзакции
        }
    };

    if (editing) {
        // ошибка правки не должна остаться в режиме просмотра
        return <AccountForm form={form} setForm={setForm} onClose={() => { setEditing(false); setError(null); }}
                            onSubmit={handleSubmit} error={error} />;
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

                    <FormError>{error}</FormError>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => { setError(null); setEditing(true); }}>Изменить</button>
                    <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
                    <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}
