import {useState} from "react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {FormError} from "../FormError.jsx";
import {extractErrorMessage} from "../../utils/errors.ts";
import {Markdown} from "./Markdown.jsx";
import {NoteEditor} from "./NoteEditor.jsx";

export function NoteFormModal({ form, setForm, onSave }) {
    const [initial] = useState(form);   // с чем открыли: useState берёт значение только при первой отрисовке
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [preview, setPreview] = useState(false);

    const dirty = form.fromImage || form.title !== initial.title || form.content !== initial.content;
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label className="form-label">Текст</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button type="button" className={'btn btn-sm ' + (preview ? 'btn-ghost' : 'btn-primary')}
                                    onClick={() => setPreview(false)}>Редактировать</button>
                            <button type="button" className={'btn btn-sm ' + (preview ? 'btn-primary' : 'btn-ghost')}
                                    onClick={() => setPreview(true)}>Просмотр</button>
                        </div>
                    </div>
                    {preview ? (
                        <div className="input" style={{ minHeight: 340, overflow: 'auto' }}>
                            {form.content.trim() ? <Markdown>{form.content}</Markdown>
                                                : <span style={{ color: 'var(--text-faint)' }}>Пока пусто</span>}
                        </div>
                    ) : (
                        <div
                            className="input"
                            style={{minHeight: 340}}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    submit();
                                }
                            }}
                        >
                            <NoteEditor
                                initialMarkdown={form.content}
                                onChange={markdown => {
                                    setForm(current => ({
                                        ...current,
                                        content: markdown,
                                    }));
                                }}
                            />
                        </div>
                    )}
                </div>
                <FormError>{error}</FormError>
            </div>
        </WkModal>
    );
}
