export function AccountForm({
    form,
    setForm,
    onClose,
    onSubmit
}) {
    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Наименование"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />

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