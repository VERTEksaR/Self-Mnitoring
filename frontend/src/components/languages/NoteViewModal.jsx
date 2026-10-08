import {Pencil, Trash2} from "lucide-react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {formatNoteDate} from "../../utils/languages.ts";

export function NoteViewModal({ note, onClose, onEdit, onDelete }) {
    return (
        <WkModal open title={note.title} onClose={onClose} width={680} footer={<>
            <button className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }} onClick={onDelete}>
                <Trash2 size={14} /> Удалить
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}><Pencil size={14} /> Изменить</button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Закрыть</button>
        </>}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{formatNoteDate(note)}</div>
            <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.6, color: 'var(--text-body)' }}>
                {note.content}
            </div>
        </WkModal>
    );
}
