import {useState} from "react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {FormError} from "../FormError.jsx";
import {extractErrorMessage} from "../../utils/errors.ts";
import {STUDY_TYPES, todayISO} from "../../utils/languages.ts";

const MINUTE_PRESETS = [15, 30, 45, 60];

export function StudyFormModal({ form, setForm, onSave }) {
    const [initial] = useState(form);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const dirty = form.study_date !== initial.study_date || form.minutes !== initial.minutes ||
        form.study_type !== initial.study_type || form.comment !== initial.comment;
    const canSave = !saving && form.study_date && Number(form.minutes) > 0;

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
        <WkModal open title={form.id ? 'Изменить занятие' : 'Новое занятие'} onClose={close} width={460} footer={<>
            <span style={{ marginRight: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>Ctrl+Enter — сохранить</span>
            <button className="btn btn-secondary btn-sm" onClick={close}>Отмена</button>
            <button className="btn btn-primary btn-sm" disabled={!canSave} onClick={submit}>
                {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
        </>}>
            <div className="form">
                <div className="form-group">
                    <label className="form-label">Дата</label>
                    <input className="input" value={form.study_date} type="date" max={todayISO()} onChange={set('study_date')}
                    autoFocus/>
                </div>
                <div className="form-group">
                    <label className="form-label">Минуты</label>
                    <input className="input" value={form.minutes} type="number" min="1" max="1440" onChange={set('minutes')}/>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        {MINUTE_PRESETS.map(m => (
                            <button key={m} className={'btn btn-sm ' + (Number(form.minutes) === m ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => setForm(f => ({ ...f, minutes: String(m) }))}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Тип</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {STUDY_TYPES.map(t => (
                            <button key={t} className={'btn btn-sm ' + (form.study_type === t ? 'btn-primary' : 'btn-ghost')}
                                    onClick={() => setForm(f => ({ ...f, study_type: t }))}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Комментарий</label>
                    <textarea className="input" rows={3} value={form.comment} onChange={set('comment')}
                              style={{ resize: 'vertical', lineHeight: 1.6 }}
                              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }} />
                </div>
                <FormError>{error}</FormError>
            </div>
        </WkModal>
    )
}