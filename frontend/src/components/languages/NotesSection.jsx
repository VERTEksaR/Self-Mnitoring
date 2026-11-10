import {useCallback, useEffect, useState, useRef} from "react";
import {Plus, Camera} from "lucide-react";
import {createNote, deleteNote, getNotes, noteFromImage, updateNote} from "../../api/languages/notes.ts";
import {NOTE_FORM_DEFAULT, noteToForm} from "../../utils/languages.ts";
import {EmptyHint} from "../EmptyHint.jsx";
import {NoteCard} from "./NoteCard.jsx";
import {NoteViewModal} from "./NoteViewModal.jsx";
import {NoteFormModal} from "./NoteFormModal.jsx";
import {FormError} from "../FormError.jsx";
import {extractErrorMessage} from "../../utils/errors.ts";

const PAGE_SIZE = 12;

export function NotesSection({ languageId }) {
    const [data, setData] = useState({ items: [], total: 0, pages: 1 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [viewNote, setViewNote] = useState(null);
    const [noteForm, setNoteForm] = useState(null);

    const [recognizing, setRecognizing] = useState(false);
    const [photoError, setPhotoError] = useState(null);
    const fileRef = useRef(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setData(await getNotes(languageId, { page, size: PAGE_SIZE }));
        } catch (err) {
            console.error('[Notes] load failed:', err?.response?.status);
        } finally {
            setLoading(false);
        }
    }, [languageId, page]);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => setNoteForm({ ...NOTE_FORM_DEFAULT });

    const recognizePhoto = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setRecognizing(true);
        setPhotoError(null);

        try {
            const draft = await noteFromImage(languageId, file);
            setNoteForm({ ...NOTE_FORM_DEFAULT, ...draft, fromImage: true });
        } catch (err) {
            setPhotoError(extractErrorMessage(err, 'Не удалось распознать фото'));
        } finally {
            setRecognizing(false);
        }
    };

    const saveNote = async (form) => {
        const payload = { title: form.title.trim(), content: form.content };
        if (form.id) {
            const updated = await updateNote(languageId, form.id, payload);
            setViewNote(updated);   // правку открывают из просмотра — возвращаемся в него с новым текстом
            load();
        } else {
            await createNote(languageId, payload);
            if (page !== 1) setPage(1); else load();
        }
        setNoteForm(null);
    };

    const removeNote = async (note) => {
        if (!window.confirm(`Удалить конспект «${note.title}»?`)) return;
        try {
            await deleteNote(languageId, note.id);
        } catch (err) {
            console.error('[Notes] delete failed:', err?.response?.status);
        }
        setViewNote(null);
        // удалили последний конспект на странице — шаг назад, иначе останется пустая страница
        if (data.items.length === 1 && page > 1) setPage(p => p - 1);
        else load();
    };

    return (
        <>
            <div>
                <div className="section-header">
                    <span className="section-title">Конспекты <span className="section-count">{data.total}</span></span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={recognizePhoto} />
                        <button className="btn btn-secondary btn-sm" disabled={recognizing} onClick={() => fileRef.current?.click()}>
                            <Camera size={14} /> {recognizing ? 'Распознаю…' : 'Из фото'}
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={openCreate}>
                            <Plus size={14} /> Конспект
                        </button>
                    </div>
                </div>
                {photoError && <div style={{ marginBottom: 12 }}><FormError>{photoError}</FormError></div>}

                {data.items.length === 0 && !loading ? (
                    <div className="card">
                        <EmptyHint title="Конспектов пока нет" hint="Правила, разборы, грамматика"
                                   action="Написать конспект" onAction={openCreate} />
                    </div>
                ) : (
                    <div className="module-grid" style={{ opacity: loading ? 0.5 : 1 }}>
                        {data.items.map(n => <NoteCard key={n.id} note={n} onClick={() => setViewNote(n)} />)}
                    </div>
                )}

                {data.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page} / {data.pages}</span>
                        <button className="btn btn-ghost btn-sm" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>→</button>
                    </div>
                )}
            </div>

            {/* Модалки вне карточек: у .card есть backdrop-filter, и position: fixed считался бы от карточки */}
            {viewNote && (
                <NoteViewModal note={viewNote} onClose={() => setViewNote(null)}
                               onEdit={() => { setNoteForm(noteToForm(viewNote)); setViewNote(null); }}
                               onDelete={() => removeNote(viewNote)} />
            )}
            {noteForm && <NoteFormModal form={noteForm} setForm={setNoteForm} onSave={saveNote} />}
        </>
    );
}
