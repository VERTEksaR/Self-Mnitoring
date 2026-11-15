import {Pencil, Trash2} from "lucide-react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {formatNoteDate} from "../../utils/languages.ts";
import {Markdown} from "./Markdown.jsx";
import {useRef, useState} from 'react';
import {translateNoteWord} from '../../api/languages/notes.ts';
import {extractErrorMessage} from '../../utils/errors.ts';
import {FormError} from '../FormError.jsx';

const TEXT_BLOCK = 'p, li, h1, h2, h3, h4, h5, h6, td, th';
const WORD_PATTERN = /[\p{L}\p{N}\p{M}]+(?:['-][\p{L}\p{N}\p{M}]+)*/gu;

function readSelectedWord(root) {
    const selection = window.getSelection();

    if (!selection?.rangeCount || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);

    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
        return null;
    };

    const getBlock = node => {
        const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        return element?.closest(TEXT_BLOCK);
    };

    const block = getBlock(range.startContainer);

    if (!block || !root.contains(block) || block !== getBlock(range.endContainer)) {
        return null;
    };

    const prefix = document.createRange();
    prefix.selectNodeContents(block);
    prefix.setEnd(range.startContainer, range.startOffset);

    const start = prefix.toString().length;
    const end = start + range.toString().length;
    const sentence = block.textContent.replace(/’/g, "'");

    if (sentence.length > 2000) return null;

    for (const match of sentence.matchAll(WORD_PATTERN)) {
        const word = match[0];
        const wordStart = match.index;
        const wordEnd = wordStart + word.length;

        if (start >= wordStart && end <= wordEnd && word.length <= 100) {
            return {
                word, sentence, selection_start: wordStart, selection_end: wordEnd
            };
        }
    };

    return null;
}

export function NoteViewModal({ note, onClose, onEdit, onDelete }) {
    const markdownRef = useRef(null);
    const [target, setTarget] = useState(null);
    const [translation, setTranslation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const captureSelection = () => {
        setTarget(readSelectedWord(markdownRef.current));
        setTranslation(null);
        setError(null);
    };

    const translate = async () => {
        if (!target || loading) return;

        setLoading(true);
        setError(null);

        try {
            const result = await translateNoteWord(note.language_id, note.id, target);
            setTranslation(result);
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось перевести слово'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <WkModal open title={note.title} onClose={onClose} width={680} footer={<>
            <button className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }} onClick={onDelete}>
                <Trash2 size={14} /> Удалить
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}><Pencil size={14} /> Изменить</button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Закрыть</button>
        </>}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{formatNoteDate(note)}</div>
            <div
                ref={markdownRef}
                onPointerUp={() => {
                    if (!loading) captureSelection();
                }}>
                    <Markdown>{note.content}</Markdown>
            </div>

            {target && (
                <div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={translate}
                        disabled={loading}
                    >
                        {loading ? 'Перевожу…' : `Перевести «${target.word}»`}
                    </button>

                    {translation && (
                        <p>
                            <strong>{translation.word}</strong> — {translation.translation}
                            {translation.part_of_speech && ` (${translation.part_of_speech})`}
                        </p>
                    )}

                    <FormError>{error}</FormError>
                </div>
            )}
        </WkModal>
    );
}
