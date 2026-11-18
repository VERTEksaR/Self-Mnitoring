import {useCallback, useEffect, useState} from "react";
import {Plus, Settings2} from "lucide-react";
import {createWord, deleteWord, getWords, updateWord} from "../../api/languages/words.ts";
import {EmptyHint} from "../EmptyHint.jsx";
import {WordRow} from "./WordRow.jsx";
import {WordFormModal} from "./WordFormModal.jsx";
import {WORD_FORM_DEFAULT, formToWord, wordToForm} from "../../utils/languages.ts";
import {createTag, deleteTag, getTags, updateTag} from "../../api/languages/tags.ts";
import {TagsModal} from "./TagsModal.jsx";

const PAGE_SIZE = 20;

export function DictionarySection({ languageId, speech }) {
    const [data, setData] = useState({ items: [], total: 0, pages: 1 });
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [wordForm, setWordForm] = useState(null);

    const [tags, setTags] = useState([]);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [tagId, setTagId] = useState(null);

    const loadTags = useCallback(() => {
        getTags(languageId)
            .then(setTags)
            .catch(err => console.error('[Tags] load failed:', err?.response?.status));
    }, [languageId]);

    useEffect(() => {
        loadTags();
    }, [loadTags]);

    const pickTag = (id) => { setTagId(id); setPage(1); };

    const createTagInline = async (name) => {
        const tag = await createTag(languageId, { name });
        setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
        return tag;
    };

    const renameTag = async (id, name) => {
        const updated = await updateTag(languageId, id, { name });
        setTags(prev => prev.map(t => t.id === id ? updated : t).sort((a, b) => a.name.localeCompare(b.name)));
        load();
    };

    const removeTag = async tag => {
        if (!window.confirm(`Удалить тег «${tag.name}»? Со слов он снимется, сами слова останутся.`)) return;
        await deleteTag(languageId, tag.id);
        setTags(prev => prev.filter(t => t.id !== tag.id));

        if (tagId === tag.id) {
            pickTag(null);
        } else {
            load();
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setData(await getWords(languageId, { page, size: PAGE_SIZE, search: query, tag_id: tagId ?? undefined }));
        } catch (err) {
            console.error('[Dictionary] load failed:', err?.response?.status);
        } finally {
            setLoading(false);
        }
    }, [languageId, page, query, tagId]);

    useEffect(() => {
        load();
    }, [load]);

    // Запрос уходит через 300 мс после последней буквы, а не на каждую
    useEffect(() => {
        const t = setTimeout(() => {
            setQuery(search.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    // Ошибку не ловим: её покажет модалка. Сюда дойдём, только если запрос прошёл
    const saveWord = async (form) => {
        const payload = formToWord(form);
        if (form.id) {
            await updateWord(languageId, form.id, payload);
            load();
        } else {
            await createWord(languageId, payload);
            // новое слово — на 1-й странице; setPage(1) сам вызовет загрузку, но если страница уже 1, ничего не изменится
            if (page !== 1) setPage(1); else load();
        }
        setWordForm(null);
    };

    const removeWord = async (word) => {
        if (!window.confirm(`Удалить «${word.word}»?`)) return;
        try {
            await deleteWord(languageId, word.id);
        } catch (err) {
            console.error('[Dictionary] delete failed:', err?.response?.status);
        }
        // удалили последнее слово на странице — шаг назад, иначе останется пустая страница
        if (data.items.length === 1 && page > 1) setPage(p => p - 1);
        else load();
    };

    return (
        <>
            <div className="card" style={{ padding: 16 }}>
                <div className="section-header">
                    <span className="section-title">Словарь <span className="section-count">{data.total}</span></span>
                    <button className="btn btn-primary btn-sm" onClick={() => setWordForm({ ...WORD_FORM_DEFAULT })}>
                        <Plus size={14} /> Слово
                    </button>
                </div>
                <input className="input" placeholder="Поиск по слову или переводу…"
                       value={search} onChange={e => setSearch(e.target.value)}
                       style={{ marginBottom: 12 }} />
                {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        <button className={'btn btn-sm ' + (tagId === null ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => pickTag(null)}>Все</button>
                        {tags.map(t => (
                            <button key={t.id} className={'btn btn-sm ' + (tagId === t.id ? 'btn-primary' : 'btn-ghost')}
                                    onClick={() => pickTag(t.id)}>#{t.name}</button>
                        ))}
                        <button className="btn btn-ghost btn-icon btn-sm" title="Управление тегами" onClick={() => setTagsOpen(true)}>
                            <Settings2 size={14} />
                        </button>
                    </div>
                )}

                {/* затемняем, а не прячем: при каждом поиске список не мигает */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: loading ? 0.5 : 1 }}>
                    {data.items.length === 0 && !loading ? (
                        <EmptyHint title={query || tagId ? 'Ничего не найдено' : 'Словарь пуст'}
                                   hint={query || tagId ? 'Попробуй другой запрос или тег' : 'Добавь первое слово'} />
                        ) : data.items.map(w => (
                        <WordRow key={w.id} word={w} onEdit={() => setWordForm(wordToForm(w))} onDelete={() => removeWord(w)} speech={speech} />
                    ))}
                </div>

                {data.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page} / {data.pages}</span>
                        <button className="btn btn-ghost btn-sm" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>→</button>
                    </div>
                )}
            </div>

            {/* Вне .card: у неё backdrop-filter, и position: fixed оверлея считался бы от карточки, а не от экрана */}
            {wordForm && (
                <WordFormModal form={wordForm} setForm={setWordForm} onSave={saveWord}
                               tags={tags} onCreateTag={createTagInline} />
            )}
            {tagsOpen && (
                <TagsModal tags={tags} onRename={renameTag} onDelete={removeTag} onClose={() => setTagsOpen(false)} />
            )}
        </>
    );
}