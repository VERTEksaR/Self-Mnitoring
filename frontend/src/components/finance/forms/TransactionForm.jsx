import { useState } from 'react';
import {FormError} from "../../FormError.jsx";

export function TransactionForm({
    form, setForm,
    accounts, categories,
    accountId, categoryId,
    setAccountId, setCategoryId,
    onSubmit, onClose, error,
}) {
    const [categorySearch, setCategorySearch] = useState(null);
    const [categorySearchOpen, setCategorySearchOpen] = useState(false);

    const selectedCategory = categories.find(
        category => String(category.id) === String(categoryId)
    );

    const categoryText = categorySearch ?? selectedCategory?.name ?? '';

    const filteredCategories = categories.filter(category =>
        category.name.toLocaleLowerCase('ru-RU').includes(
            categoryText.trim().toLocaleLowerCase('ru-RU')
        )
    );

    const handleCategoryInput = (e) => {
        setCategorySearch(e.target.value);
        setCategoryId('');
        setCategorySearchOpen(true);
    };

    const handleCategorySelect = (category) => {
        setCategoryId(category.id);
        setCategorySearch(category.name);
        setCategorySearchOpen(false);
    };

    const handleFormSubmit = (e) => {
        if (!categoryId) {
            e.preventDefault();
            setCategorySearchOpen(true);
            return;
        }

        onSubmit(e);
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Транзакция</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form className="form" onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label className="form-label">Счёт</label>
                        <select
                            className="select"
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            required
                        >
                            <option value="">Выберите счёт</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="transaction-category-search">
                            Категория
                        </label>

                        <div
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setCategorySearchOpen(false);
                                }
                            }}
                        >
                            <input
                                id="transaction-category-search"
                                className="input"
                                type="text"
                                value={categoryText}
                                onChange={handleCategoryInput}
                                onFocus={() => setCategorySearchOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !categoryId) {
                                        e.preventDefault();
                                        setCategorySearchOpen(true);
                                    }
                                }}
                                placeholder="Начните вводить название"
                                autoComplete="off"
                                aria-describedby="transaction-category-hint"
                                required
                            />

                            {categorySearchOpen && (
                                <div
                                    style={{
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        marginTop: 4,
                                        padding: 4,
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        background: 'var(--surface-card)',
                                    }}
                                >
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map(category => (
                                            <button
                                                key={category.id}
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() => handleCategorySelect(category)}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    whiteSpace: 'normal',
                                                }}
                                            >
                                                {category.name}
                                            </button>
                                        ))
                                    ) : (
                                        <p style={{ margin: 8, color: 'var(--text-muted)' }}>
                                            Категории не найдены
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <small
                            id="transaction-category-hint"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {categoryId
                                ? 'Категория выбрана'
                                : 'Введите название и выберите категорию из списка'}
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Сумма (₽)</label>
                        <input
                            className="input"
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Кэшбэк (₽)</label>
                        <input
                            className="input"
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={form.cashback}
                            onChange={e => setForm({ ...form, cashback: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Описание</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Необязательно"
                            value={form.destination}
                            onChange={e => setForm({ ...form, destination: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Дата</label>
                        <input
                            className="input"
                            type="date"
                            value={form.transaction_date}
                            onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                            required
                        />
                    </div>

                    <label className={`form-toggle${form.replenishment ? ' form-toggle--active' : ''}`}>
                        <input
                            type="checkbox"
                            checked={form.replenishment}
                            onChange={e => setForm({ ...form, replenishment: e.target.checked })}
                        />
                        Доход (поступление)
                    </label>

                    <FormError>{error}</FormError>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn-primary">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
