import {useCallback, useEffect, useState} from "react";
import {answerReview, getReview} from "../../api/languages/review.ts";
import {EmptyHint} from "../EmptyHint.jsx";
import {pluralLabel, wordStatus} from "../../utils/languages.ts";
import {SpeakButton} from "./SpeakButton.jsx";
import {getTags} from "../../api/languages/tags.ts";

const BATCH_SIZE = 20;

// width: 100% — иначе во flex-колонке .finance-main карточка с margin: auto сжимается до ширины слова
const CARD_STYLE = { width: '100%', maxWidth: 560, margin: '0 auto', padding: 32, textAlign: 'center' };

export function ReviewSection({ languageId, speech }) {
    const [batch, setBatch] = useState(null);
    const [queue, setQueue] = useState([]);
    const [pos, setPos] = useState(0);
    const [practiced, setPracticed] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [sending, setSending] = useState(false);
    const [score, setScore] = useState({ remembered: 0, forgot: 0 });

    const [tags, setTags] = useState([]);
    const [tagId, setTagId] = useState(null);

    useEffect(() => {
        getTags(languageId)
            .then(setTags)
            .catch(err => console.error('[Tags] load failed:', err?.response?.status));
    }, [languageId]);

    const loadBatch = useCallback(async () => {
        setBatch(null);
        setQueue([]);
        setPos(0);
        setRevealed(false);
        setScore({ remembered: 0, forgot: 0 });
        setPracticed(0);

        try {
            const data = await getReview(languageId, BATCH_SIZE, tagId ?? undefined);
            setBatch(data);
            setQueue(data.items.map(word => ({ word, practice: false })));
        } catch (err) {
            console.error('[Review] load failed:', err?.response?.status);
            setBatch({ items: [], total: 0 });
        }
    }, [languageId, tagId]);

    useEffect(() => {
        loadBatch();
    }, [loadBatch]);

    const entry = queue[pos];
    const word = entry?.word;

    const answer = useCallback(async (remembered) => {
        if (!entry || !revealed || sending) return;

        if (entry.practice) {
            // повтор забытого: на бэк не отправляем — первый ответ уже записан, второй вернул бы 409
            setPracticed(n => n + 1);
            if (!remembered) setQueue(q => [...q, entry]);                     // снова забыл — ещё раз в конец
        } else {
            setSending(true);
            try {
                await answerReview(languageId, entry.word.id, remembered);
            } catch (err) {
                console.error('[Review] answer failed:', err?.response?.status);
                return;                                                         // ответ не записался — остаёмся на этой карточке
            } finally {
                setSending(false);
            }
            setScore(s => remembered ? { ...s, remembered: s.remembered + 1 } : { ...s, forgot: s.forgot + 1 });
            if (!remembered) setQueue(q => [...q, { word: entry.word, practice: true }]);   // забытое — в конец как повтор
        }

        setPos(p => p + 1);
        setRevealed(false);
    }, [languageId, entry, revealed, sending]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.target.closest?.('input, textarea')) return;
            if (e.key === ' ' || e.key === "Enter") { e.preventDefault(); setRevealed(true); }
            if (e.key === '1' || e.key === "ArrowLeft") answer(false);
            if (e.key === '2' || e.key === "ArrowRight") answer(true);
            if ((e.key === 's' || e.key === 'ы') && word) speech?.speak(word.word);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [answer, word, speech]);   // speech меняется, когда браузер догрузил голоса

    const tagFilter = tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            <button className={'btn btn-sm ' + (tagId === null ? 'btn-primary' : 'btn-ghost')} onClick={() => setTagId(null)}>Все</button>
            {tags.map(t => (
                <button key={t.id} className={'btn btn-sm ' + (tagId === t.id ? 'btn-primary' : 'btn-ghost')}
                        onClick={() => setTagId(t.id)}>#{t.name}</button>
            ))}
        </div>
    );

    let body;

    if (!batch) {
        body = <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Загрузка…</div>;
    } else if (batch.total === 0) {
        body = <div className="card"><EmptyHint title={tagId ? 'По этому тегу на сегодня всё' : 'На сегодня всё'}
                                                hint="Новые повторения появятся завтра" /></div>;
    } else if (!word) {
        const left = batch.total - batch.items.length;
        const next = Math.min(left, BATCH_SIZE);

        body = (
            <div className="card" style={CARD_STYLE}>
                <div className="section-title">Порция готова</div>
                <div style={{ margin: '12px 0' }}>✓ помню: {score.remembered} · ✗ не помню: {score.forgot}</div>
                {practiced > 0 && <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>повторено забытых: {practiced}</div>}
                {left > 0
                    ? <button className="btn btn-primary" onClick={loadBatch}>Ещё {next} {pluralLabel(next, ['слово', 'слова', 'слов'])}</button>
                    : <div style={{ color: 'var(--text-muted)' }}>На сегодня всё повторено</div>}
            </div>
        );
    } else {
        body = (
            <div className="card" style={CARD_STYLE}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {pos + 1} / {queue.length} · {entry.practice ? 'повтор забытого' : wordStatus(word.box)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '16px 0 4px' }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-strong)' }}>{word.word}</span>
                    <SpeakButton text={word.word} speech={speech} size={18} />
                </div>
                {word.transcription && <div style={{ color: 'var(--text-muted)' }}>[{word.transcription}]</div>}

                {revealed ? (
                    <>
                        {/* Перевод без 🔊: голос выбран под изучаемый язык и прочитал бы русский текст с акцентом */}
                        <div style={{ fontSize: 20, margin: '20px 0 8px' }}>{word.translation}</div>
                        {word.example && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{word.example}</span>
                                <SpeakButton text={word.example} speech={speech} />
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
                            <button className="btn btn-danger" disabled={sending} onClick={() => answer(false)}>Не помню (1)</button>
                            <button className="btn btn-primary" disabled={sending} onClick={() => answer(true)}>Помню (2)</button>
                        </div>
                    </>
                ) : (
                    <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={() => setRevealed(true)}>
                        Показать перевод (пробел)
                    </button>
                )}
            </div>
        );
    }

    return <>{tagFilter}{body}</>;
}