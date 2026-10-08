import {useState} from "react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {FormError} from "../FormError.jsx";
import {extractErrorMessage} from "../../utils/errors.ts";

export function NoteFormModal({ form, setForm, onSave }) {
    const [initial] = useState(form);   // с чем открыли: useState берёт значение только при первой отрисовке
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const dirty = form.title !== initial.title || form.content !== initial.content;
    const canSave = !saving && form.title.trim() !== '' && form.content.trim() !== '';

    // Сюда ведут Esc, клик мимо модалки, крестик и «Отмена» — длинный текст не потеряется случайно
    const close = () => {
        if (dirty && !window.confirm('Есть несохранённые изменения. Закрыть без сохранения?')) return;
        setForm(null);
    };

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const submit = async () => {
        if (!canSave) return;
        setSaving(true);
        setError(null);
        try {
            await onSave(form);
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось сохранить'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <WkModal open title={form.id ? 'Изменить конспект' : 'Новый конспект'} onClose={close} width={680} footer={<>
            <span style={{ marginRight: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>Ctrl+Enter — сохранить</span>
            <button className="btn btn-secondary btn-sm" onClick={close}>Отмена</button>
            <button className="btn btn-primary btn-sm" disabled={!canSave} onClick={submit}>
                {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
        </>}>
            <div className="form">
                <div className="form-group">
                    <label className="form-label">Заголовок</label>
                    <input className="input" value={form.title} onChange={set('title')} placeholder="Ser и estar" autoFocus />
                </div>
                <div className="form-group">
                    <label className="form-label">Текст</label>
                    <textarea className="input" rows={14} value={form.content} onChange={set('content')}
                              style={{ resize: 'vertical', lineHeight: 1.6 }}
                              placeholder="ser — постоянные признаки, estar — состояние…"
                              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }} />
                </div>
                <FormError>{error}</FormError>
            </div>
        </WkModal>
    );
}
