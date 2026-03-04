export function TransactionForm({
    form,
    setForm,
    accounts,
    categories,
    accountId,
    categoryId,
    setAccountId,
    setCategoryId,
    onSubmit,
    onClose,
    onSaved,
}) {
    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
               <form onSubmit={onSubmit}>
                    <select value={accountId} onChange={e => setAccountId(e.target.value)} required>
                        <option value="">Выберите счет</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>

                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                        <option value="">Выберите категорию</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Сумма"
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                        required
                    />

                    <input
                        type="number"
                        placeholder="Кэшбэк"
                        value={form.cashback}
                        onChange={e => setForm({ ...form, cashback: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Описание"
                        value={form.destination}
                        onChange={e => setForm({ ...form, destination: e.target.value })}
                    />

                    <input
                        type="date"
                        value={form.transaction_date}
                        onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                        required
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={form.replenishment}
                            onChange={e => setForm({ ...form, replenishment: e.target.checked })}
                        />
                        Доход
                    </label>

                    <button type="submit">Сохранить</button>
                    <button type="button" onClick={onClose}>Отмена</button>
               </form>
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