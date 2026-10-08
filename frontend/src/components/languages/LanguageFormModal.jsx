import {useState} from "react";
import {extractErrorMessage} from "../../utils/errors";
import {WkModal} from "../workouts/modals/WorkoutModal";
import {LANGUAGE_LEVELS} from "../../utils/languages";
import {FormError} from "../FormError.jsx";

export function LanguageFormModal({ form, setForm, onSave }) {
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const close = () => setForm(null);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const submit = async () => {
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
        <WkModal open title="Новый язык" onClose={close} footer={<>
            <button className="btn btn-secondary btn-sm" onClick={close}>Отмена</button>
            <button className="btn btn-primary btn-sm" disabled={saving || !form.name.trim()} onClick={submit}>
                {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
        </>}>
            <div className="form">
                <div className="form-group">
                    <label className="form-label">Название</label>
                    <input className="input" value={form.name} onChange={set('name')} autoFocus />
                </div>
                <div className="form-group">
                    <label className="form-label">Код языка (для озвучки)</label>
                    <input className="input" value={form.code} onChange={set('code')}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Текущий уровень</label>
                        <select className="select" value={form.current_level} onChange={set('current_level')}>
                            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Целевой уровень</label>
                        <select className="select" value={form.target_level} onChange={set('target_level')}>
                            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
                <FormError>{error}</FormError>
            </div>
        </WkModal>
    );
}