export function TransactionForm({
    form, setForm,
    accounts, categories,
    accountId, categoryId,
    setAccountId, setCategoryId,
    onSubmit, onClose,
}) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Транзакция</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form className="form" onSubmit={onSubmit}>
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
                        <label className="form-label">Категория</label>
                        <select
                            className="select"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
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

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn-primary">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
