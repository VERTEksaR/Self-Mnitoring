import {formatNoteDate, stripMarkdown} from "../../utils/languages.ts";

export function NoteCard({ note, onClick }) {
    return (
        <button type="button" className="ln-note-row" onClick={onClick}>
            <span className="ln-note-title">{note.title}</span>
            <span className="ln-note-excerpt">{stripMarkdown(note.content)}</span>
            <span className="ln-note-date">{formatNoteDate(note)}</span>
        </button>
    );
}
