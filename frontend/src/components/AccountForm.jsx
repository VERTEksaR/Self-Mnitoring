const ACCOUNT_TYPES = ['Обычный', 'Накопительный'];

export function AccountForm({ form, setForm, onClose, onSubmit }) {
    const isSavings = form.account_type === 'Накопительный';

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Счёт</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form className="form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Название</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Название счёта"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Тип счёта</label>
                        <select
                            className="input"
                            value={form.account_type}
                            onChange={e => setForm({ ...form, account_type: e.target.value })}
                        >
                            {ACCOUNT_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {isSavings && (
                        <div className="form-group">
                            <label className="form-label">Цель накопления (необязательно)</label>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Без лимита"
                                value={form.goal_amount}
                                onChange={e => setForm({ ...form, goal_amount: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn-primary">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
