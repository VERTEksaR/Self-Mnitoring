export function CategoryForm({ form, setForm, onClose, onSubmit }) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Категория</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form className="form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Название</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Название категории"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <label style={{
                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        padding: '10px 12px', borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-sunken)',
                        userSelect: 'none',
                    }}>
                        <input
                            type="checkbox"
                            checked={form.show_analytics ?? true}
                            onChange={e => setForm({ ...form, show_analytics: e.target.checked })}
                            style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }}
                        />
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                                Показывать в аналитике
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                Если выключено — категория не попадает в график расходов по категориям
                            </div>
                        </div>
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