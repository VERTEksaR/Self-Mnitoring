import { useState } from 'react';
import {
    createBank,
    updateBank,
    deleteBank,
} from '../../api/finance/banks.ts';
import { FormError } from '../FormError.jsx';
import { extractErrorMessage } from '../../utils/errors.ts';

export function BanksPanel({ banks, setBanks }) {
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setError(null);
    };

    const startEditing = (bank) => {
        setEditingId(bank.id);
        setName(bank.name);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (busy) return;

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Введите название банка');
            return;
        }

        setBusy(true);
        setError(null);

        try {
            if (editingId === null) {
                const created = await createBank({ name: trimmedName });
                setBanks(previous => [...previous, created]);
            } else {
                const updated = await updateBank(editingId, {
                    name: trimmedName,
                });

                setBanks(previous => 
                    previous.map(bank =>
                        bank.id === updated.id ? updated : bank
                    )
                );
            }

            resetForm();
        } catch (err) {
            setError(
                extractErrorMessage(err, 'Не удалось сохранить банк')
            );
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (bank) => {
        if (busy) return;

        if (!window.confirm(`Удалить банк «${bank.name}»?`)) {
            return;
        }

        setBusy(true);
        setError(null);

        try {
            await deleteBank(bank.id);

            setBanks(previous => 
                previous.filter(item => item.id !== bank.id)
            );

            if (editingId === bank.id) {
                resetForm();
            }
        } catch (err) {
            setError(
                extractErrorMessage(err, 'Не удалось удалить банк')
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-strong)',
                    }}
                >
                    Банки
                </span>
                <span className="section-count">{banks.length}</span>
            </div>

            <div style={{ padding: '12px 16px' }}>
                {banks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
                        Пока нет банков. Добавьте банк, чтобы привязать к нему счета.
                    </p>
                ) : (
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 16px',
                            maxHeight: 280,
                            overflowY: 'auto',
                        }}
                    >
                        {banks.map(bank => (
                            <li
                                key={bank.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                    padding: '10px 0',
                                    borderBottom: '1px solid var(--border)',
                                }}
                            >
                                <span style={{ overflowWrap: 'anywhere' }}>
                                    {bank.name}
                                </span>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        disabled={busy}
                                        onClick={() => startEditing(bank)}
                                        aria-label={`Изменить банк «${bank.name}»`}
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        disabled={busy}
                                        onClick={() => handleDelete(bank)}
                                        aria-label={`Удалить банк «${bank.name}»`}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="bank-name">
                            {editingId === null
                                ? 'Новый банк'
                                : 'Изменить название банка'}
                        </label>

                        <input
                            id="bank-name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Название банка"
                            disabled={busy}
                            required
                        />
                    </div>

                    <FormError>{error}</FormError>

                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={busy || !name.trim()}
                        >
                            {busy
                                ? 'Подождите…'
                                : editingId === null
                                    ? 'Добавить банк'
                                    : 'Сохранить'}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={resetForm}
                                disabled={busy}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}