import {formatNoteDate} from "../../utils/languages.ts";

export function NoteCard({ note, onClick }) {
    return (
        <div className="card module-card" onClick={onClick} style={{ padding: 16 }}>
            <div className="module-card__title" style={{ fontSize: 15 }}>{note.title}</div>
            <div style={{
                fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5,
                whiteSpace: 'pre-wrap',                     // сохраняем переносы строк из textarea
                display: '-webkit-box', WebkitLineClamp: 3, // показываем только первые 3 строки…
                WebkitBoxOrient: 'vertical', overflow: 'hidden',   // …остальное обрезается с «…»
            }}>
                {note.content}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 10 }}>{formatNoteDate(note)}</div>
        </div>
    );
}