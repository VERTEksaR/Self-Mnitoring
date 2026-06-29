export function AccountForm({ form, setForm, onClose, onSubmit }) {
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

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn-primary">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
