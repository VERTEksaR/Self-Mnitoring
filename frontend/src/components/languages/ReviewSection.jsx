import {useCallback, useEffect, useState} from "react";
import {answerReview, getReview} from "../../api/languages/review.ts";
import {EmptyHint} from "../EmptyHint.jsx";
import {wordStatus} from "../../utils/languages.ts";
import {SpeakButton} from "./SpeakButton.jsx";

const BATCH_SIZE = 20;

// width: 100% — иначе во flex-колонке .finance-main карточка с margin: auto сжимается до ширины слова
const CARD_STYLE = { width: '100%', maxWidth: 560, margin: '0 auto', padding: 32, textAlign: 'center' };

// 1 слово, 2 слова, 5 слов, 21 слово, 11 слов
const wordsLabel = (n) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'слово';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'слова';
    return 'слов';
};

export function ReviewSection({ languageId, speech }) {
    const [batch, setBatch] = useState(null);
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [sending, setSending] = useState(false);
    const [score, setScore] = useState({ remembered: 0, forgot: 0 });

    const loadBatch = useCallback(async () => {
        setBatch(null);
        setIndex(0);
        setRevealed(false);
        setScore({ remembered: 0, forgot: 0 });

        try {
            setBatch(await getReview(languageId, BATCH_SIZE));
        } catch (err) {
            console.error('[Review] load failed:', err?.response?.status);
            setBatch({ items: [], total: 0 });
        }
    }, [languageId]);

    useEffect(() => {
        loadBatch();
    }, [loadBatch]);

    const word = batch?.items[index];

    const answer = useCallback(async (remembered) => {
        if (!word || !revealed || sending) return;

        setSending(true);

        try {
            await answerReview(languageId, word.id, remembered);
            setScore(s => remembered ? { ...s, remembered: s.remembered + 1 } : { ...s, forgot: s.forgot + 1 });
            setIndex(i => i + 1);
            setRevealed(false);
        } catch (err) {
            console.error('[Review] answer failed:', err?.response?.status);
        } finally {
            setSending(false);
        }
    }, [languageId, word, revealed, sending]);

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

    if (!batch) return <div style={{ color: 'var(--text-muted)' }}>Загрузка…</div>;

    if (batch.total === 0) return (
        <div className="card"><EmptyHint title="На сегодня всё" hint="Новые повторения появятся завтра" /></div>
    );

    if (!word) {                                       // порция закончилась
        const left = batch.total - batch.items.length;
        const next = Math.min(left, BATCH_SIZE);
        return (
            <div className="card" style={CARD_STYLE}>
                <div className="section-title">Порция готова</div>
                <div style={{ margin: '12px 0' }}>✓ помню: {score.remembered} · ✗ не помню: {score.forgot}</div>
                {left > 0
                    ? <button className="btn btn-primary" onClick={loadBatch}>Ещё {next} {wordsLabel(next)}</button>
                    : <div style={{ color: 'var(--text-muted)' }}>На сегодня всё повторено</div>}
            </div>
        );
    }

    return (                                           // карточка
        <div className="card" style={CARD_STYLE}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {index + 1} / {batch.items.length} · {wordStatus(word.box)}
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