import {useState} from "react";
import {WkModal} from "../workouts/modals/WorkoutModal";
import {FormError} from "../FormError.jsx";
import {PARTS_OF_SPEECH} from "../../utils/languages";
import {extractErrorMessage} from "../../utils/errors";

export function WordFormModal({ form, setForm, onSave }) {
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
        <WkModal open title={form.id ? 'Изменить слово' : 'Новое слово'} onClose={close} width={480} footer={<>
            <button className="btn btn-secondary btn-sm" onClick={close}>Отмена</button>
            <button className="btn btn-primary btn-sm" onClick={submit}
                    disabled={saving || !form.word.trim() || !form.translation.trim()}>
                {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
        </>}>
            <div className="form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Слово</label>
                        <input className="input" value={form.word} onChange={set('word')} placeholder="hola" autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Перевод</label>
                        <input className="input" value={form.translation} onChange={set('translation')} placeholder="привет" />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Транскрипция</label>
                        <input className="input" value={form.transcription} onChange={set('transcription')} placeholder="ˈo.la" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Часть речи</label>
                        <select className="select" value={form.part_of_speech} onChange={set('part_of_speech')}>
                            <option value="">—</option>
                            {PARTS_OF_SPEECH.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Пример</label>
                    <textarea className="input" rows={2} style={{ resize: 'vertical' }}
                              value={form.example} onChange={set('example')} placeholder="¡Hola! ¿Qué tal?" />
                </div>
                <div className="form-group">
                    <label className="form-label">Заметка</label>
                    <textarea className="input" rows={2} style={{ resize: 'vertical' }}
                              value={form.note} onChange={set('note')} />
                </div>
                <FormError>{error}</FormError>
            </div>
        </WkModal>
    );
}
