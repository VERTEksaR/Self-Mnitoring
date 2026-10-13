import {useState} from "react";
import {Trash2} from "lucide-react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {FormError} from "../FormError.jsx";
import {EmptyHint} from "../EmptyHint.jsx";
import {extractErrorMessage} from "../../utils/errors.ts";

export function TagsModal({ tags, onRename, onDelete, onClose }) {
    const [drafts, setDrafts] = useState({});
    const [error, setError] = useState(null);

    const setDraft = (id, value) => setDrafts(d => ({ ...d, [id]: value }));

    const rename = async (tag) => {
        setError(null);

        try {
            await onRename(tag.id, drafts[tag.id].trim());
            setDrafts(d => { const { [tag.id]: _, ...rest } = d; return rest; });
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось переименовать'));
        }
    };

    return (
        <WkModal open title="Теги" onClose={onClose}
                 footer={<button className="btn btn-secondary btn-sm" onClick={onClose}>Готово</button>}>
            <div className="form">
                {tags.length === 0 && <EmptyHint title="Тегов нет" hint="Их можно создать в форме слова" />}
                {tags.map(tag => {
                    const draft = drafts[tag.id] ?? tag.name;
                    const changed = draft.trim() !== '' && draft.trim() !== tag.name;
                    return (
                        <div key={tag.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input className="input" value={draft} onChange={e => setDraft(tag.id, e.target.value)}
                                   onKeyDown={e => { if (e.key === 'Enter' && changed) rename(tag); }} />
                            <button className="btn btn-primary btn-sm" disabled={!changed} onClick={() => rename(tag)}>Сохранить</button>
                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--expense)' }}
                                    title="Удалить тег" onClick={() => onDelete(tag)}><Trash2 size={14} /></button>
                        </div>
                    );
                })}
                <FormError>{error}</FormError>
            </div>
        </WkModal>
    );
}
