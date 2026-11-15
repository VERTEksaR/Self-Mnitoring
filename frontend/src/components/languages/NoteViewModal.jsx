import {Pencil, Trash2} from "lucide-react";
import {WkModal} from "../workouts/modals/WorkoutModal.jsx";
import {formatNoteDate, formToWord, WORD_FORM_DEFAULT} from "../../utils/languages.ts";
import {Markdown} from "./Markdown.jsx";
import {useRef, useState, useEffect} from 'react';
import {translateNoteWord} from '../../api/languages/notes.ts';
import {extractErrorMessage} from '../../utils/errors.ts';
import {FormError} from '../FormError.jsx';
import {createWord, lookupWord} from "../../api/languages/words.ts";
import {createTag, getTags} from '../../api/languages/tags.ts';
import {WordFormModal} from './WordFormModal.jsx';

const TEXT_BLOCK = 'p, li, h1, h2, h3, h4, h5, h6, td, th';
const WORD_PATTERN = /[\p{L}\p{N}\p{M}]+(?:['-][\p{L}\p{N}\p{M}]+)*/gu;

function getClickRange(clientX, clientY) {
    if (typeof document.caretPositionFromPoint === 'function') {
        const caret = document.caretPositionFromPoint(clientX, clientY);

        if (!caret) return null;

        const range = document.createRange();
        range.setStart(caret.offsetNode, caret.offset);
        range.collapse(true);
        return range;
    };

    return document.caretRangeFromPoint?.(clientX, clientY) ?? null;
}

function readSelectedWord(root, clickRange) {
    const selection = window.getSelection();

    const range = selection?.rangeCount && !selection.isCollapsed ? selection.getRangeAt(0) : clickRange;

    if (!root || !range) return null;

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
    const selectionStart = prefix.toString().length;
    const selectedText = range.toString();

    if (!range.collapsed && !selectedText.trim()) return null;


    const start = selectionStart + (selectedText.length - selectedText.trimStart().length);
    const end = selectionStart + selectedText.trimEnd().length;
    const sentence = block.textContent.replace(/’/g, "'");

    if (sentence.length > 2000) return null;

    for (const match of sentence.matchAll(WORD_PATTERN)) {
        const word = match[0];
        const wordStart = match.index;
        const wordEnd = wordStart + word.length;

        const matchesWord = range.collapsed ? start >= wordStart && start <= wordEnd : start >= wordStart && end <= wordEnd;

        if (matchesWord && word.length <= 100) {
            return {word, sentence, selection_start: wordStart, selection_end: wordEnd}
        };
    };

    return null;
}

export function NoteViewModal({ note, onClose, onEdit, onDelete }) {
    const markdownRef = useRef(null);
    const [target, setTarget] = useState(null);
    const [translation, setTranslation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [anchor, setAnchor] = useState(null);
    const closeWordCard = () => {
        setTarget(null);
        setAnchor(null);
        setTranslation(null);
        setError(null);
        setLookup(null);
    };

    const [lookup, setLookup] = useState(null);
    const lookupWordText = translation?.word ?? target?.word;
    const currentLookup = lookup?.word === lookupWordText ? lookup : null;
    const lookupLanguageId = note.language_id;

    const [wordForm, setWordForm] = useState(null);
    const [tags, setTags] = useState([]);
    const [openingWordForm, setOpeningWordForm] = useState(false);
    const canAddWord = Boolean(
        translation &&
        currentLookup &&
        !currentLookup.error &&
        currentLookup.entry === null
    );

    const openWordForm = async () => {
        if (!canAddWord || openingWordForm || loading) return;

        setOpeningWordForm(true);
        setError(null);

        try {
            setTags(await getTags(note.language_id));
            setWordForm({
                ...WORD_FORM_DEFAULT,
                word: translation.word,
                translation: translation.translation,
                part_of_speech: translation.part_of_speech ?? '',
                example: translation.example,
                tag_ids: [],
            });
        } catch (err) {
            setError(extractErrorMessage(err, 'Не удалось открыть форму слова'));
        } finally {
            setOpeningWordForm(false);
        }
    };

    const saveWord = async form => {
        const entry = await createWord(note.language_id, formToWord(form));

        if (entry.word === lookupWordText) {
            setLookup({word: lookupWordText, entry, error: null});
        } else {
            closeWordCard();
        }

        setWordForm(null);
    };

    const createTagInline = async name => {
        const tag = await createTag(note.language_id, {name});
        setTags(previous => [...previous, tag].sort((a, b) => a.name.localeCompare(b.name)));
        return tag;
    };

    useEffect(() => {
        if (!lookupWordText) return;

        let ignore = false;

        const findWord = async () => {
            try {
                const entry = await lookupWord(lookupLanguageId, lookupWordText);

                if (!ignore) {
                    setLookup({word: lookupWordText, entry, error: null});
                }
            } catch (err) {
                if (!ignore) {
                    setLookup({
                        word: lookupWordText,
                        entry: null,
                        error: extractErrorMessage(err, 'Не удалось проверить словарь'),
                    });
                }
            }
        };

        void findWord();

        return () => {
            ignore = true;
        };
    }, [lookupLanguageId, lookupWordText]);

    const captureSelection = event => {
        if (loading || openingWordForm) return;

        if (event.target instanceof Element && event.target.closest('a')) {
            return;
        };

        const root = markdownRef.current;
        const clickRange = getClickRange(event.clientX, event.clientY);
        const nextTarget = readSelectedWord(root, clickRange);

        if (!nextTarget) {
            closeWordCard();
            return;
        };

        const bounds = root.getBoundingClientRect();

        if (nextTarget.word !== lookupWordText) {
            setLookup(null);
        }

        setAnchor({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });
        setTarget(nextTarget);
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

    if (wordForm) {
        return (
            <WordFormModal
                form={wordForm}
                setForm={setWordForm}
                onSave={saveWord}
                tags={tags}
                onCreateTag={createTagInline}
            />
        );
    }

    return (
        <WkModal open title={note.title} onClose={onClose} width={800} footer={<>
            <button className="btn btn-danger btn-sm" style={{ marginRight: 'auto' }} onClick={onDelete}>
                <Trash2 size={14} /> Удалить
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}><Pencil size={14} /> Изменить</button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Закрыть</button>
        </>}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{formatNoteDate(note)}</div>
            <div className="note-word-area" ref={markdownRef}>
                <div onClick={captureSelection}>
                    <Markdown>{note.content}</Markdown>
                </div>

                {target && anchor && (
                    <div
                        className="note-word-card"
                        style={{
                            '--word-card-x': `${anchor.x}px`,
                            top: anchor.y + 16,
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm note-word-card-close"
                            aria-label="Закрыть карточку слова"
                            onClick={closeWordCard}
                            disabled={loading|| openingWordForm}
                        >
                            ×
                        </button>

                        {!currentLookup ? (
                            <p>Ищу в словаре…</p>
                        ) : currentLookup.error ? (
                            <FormError>{currentLookup.error}</FormError>
                        ) : currentLookup.entry ? (
                            <p>
                                В словаре: <strong>{currentLookup.entry.word}</strong>
                                {' — '}{currentLookup.entry.translation}
                                {currentLookup.entry.part_of_speech
                                    && ` (${currentLookup.entry.part_of_speech})`}
                            </p>
                        ) : (
                            <p>«{lookupWordText}» пока нет в словаре.</p>
                        )}

                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={translate}
                            disabled={loading|| openingWordForm}
                        >
                            {loading ? 'Перевожу…' : `Перевести «${target.word}»`}
                        </button>

                        {canAddWord && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={openWordForm}
                                disabled={loading || openingWordForm}
                            >
                                {openingWordForm ? 'Открываю…' : 'В словарь'}
                            </button>
                        )}

                        {translation && (
                            <p>
                                В этом предложении: <strong>{translation.word}</strong> — {translation.translation}
                                {translation.part_of_speech && ` (${translation.part_of_speech})`}
                            </p>
                        )}

                        <FormError>{error}</FormError>
                    </div>
                )}
            </div>
        </WkModal>
    );
}
