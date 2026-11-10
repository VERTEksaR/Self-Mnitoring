import {useCallback, useEffect, useState, useMemo} from "react";
import {answerReview, getChoices, getReview} from "../../api/languages/review";
import {EmptyHint} from "../EmptyHint.jsx";
import {buildOptions, pluralLabel, wordStatus} from "../../utils/languages";
import {getTags} from "../../api/languages/tags";
import {FlashCard} from "./FlashCard.jsx";
import {TypingCard} from "./TypingCard.jsx";
import {ChoiceCard} from "./ChoiceCard.jsx";

const BATCH_SIZE = 20;

// width: 100% — иначе во flex-колонке .finance-main карточка с margin: auto сжимается до ширины слова
const CARD_STYLE = { width: '100%', maxWidth: 560, margin: '0 auto', padding: 32, textAlign: 'center' };

const MODES = [                                                                                                                                                                                                                                                                                                   
    { id: 'cards', label: 'Карточки' },                                                                                                                                                                                                                                                                           
    { id: 'reverse', label: 'Обратный перевод' },                                                                                                                                                                                                                                                                 
    { id: 'typing', label: 'Ввод' },                                                                                                                                                                                                                                                                              
    { id: 'choice', label: '4 варианта' },                                                                                                                                                                                                                                                                        
];

const AUTO_MODES = ["typing", "choice"];

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

    const [mode, setMode] = useState('cards');
    const [checked, setChecked] = useState(null);
    const [choicePool, setChoicePool] = useState([]);

    const auto = AUTO_MODES.includes(mode);

    useEffect(() => {
        getChoices(languageId)
            .then(setChoicePool)
            .catch(err => console.error('[Choices] load failed:', err?.response?.status));
    }, [languageId]);

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
        setChecked(null);
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

    const options = useMemo(
        () => (mode === 'choice' && entry ? buildOptions(entry.word, choicePool) : []),
    [mode, entry, choicePool]);

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
        setChecked(null);
    }, [languageId, entry, revealed, sending]);

    const check = useCallback((correct, given) => {
        if (revealed) return;

        setChecked({ correct, given });
        setRevealed(true);
    }, [revealed]);

    const changeMode = (id) => {
        setMode(id);
        setRevealed(false);
        setChecked(null);
    }

    useEffect(() => {
        const onKey = (e) => {
            if (e.target.closest?.('input, textarea')) return;

            if (e.key === 's' || e.key === 'ы') {
                if (word && (mode !== 'reverse' || revealed)) speech?.speak(word.word);
                return;
            }

            if (auto) {
                if (e.key === 'Enter' && checked) {
                    e.preventDefault();
                    answer(checked.correct);
                }

                const i = ['1', '2', '3', '4'].indexOf(e.key);
                if (mode === 'choice' && i !== -1 && options[i]) {
                    check(options[i].id === word.id, options[i].id);
                }
                return;
            }

            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRevealed(true); }
            if (e.key === '1' || e.key === 'ArrowLeft') answer(false);
            if (e.key === '2' || e.key === 'ArrowRight') answer(true);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [answer, check, word, speech, mode, auto, revealed, checked, options]);

    const tagFilter = tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            <button className={'btn btn-sm ' + (tagId === null ? 'btn-primary' : 'btn-ghost')} onClick={() => setTagId(null)}>Все</button>
            {tags.map(t => (
                <button key={t.id} className={'btn btn-sm ' + (tagId === t.id ? 'btn-primary' : 'btn-ghost')}
                        onClick={() => setTagId(t.id)}>#{t.name}</button>
            ))}
        </div>
    );

    const modeSwitch = (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
            {MODES.map(m => {
                const off = m.id === 'choice' && choicePool.length < 4;
                return (
                    <button key={m.id} className={'btn btn-sm ' + (mode === m.id ? 'btn-primary' : 'btn-ghost')}
                            disabled={off} title={off ? 'Нужно минимум 4 слова в словаре' : undefined}
                            onClick={() => changeMode(m.id)}>
                        {m.label}
                    </button>
                );
            })}
        </div>
    )

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
        const card = mode === 'typing'
            ? <TypingCard key={pos} word={word} speech={speech} checked={checked} onCheck={check} />
            : mode === 'choice'
                ? <ChoiceCard key={pos} word={word} speech={speech} options={options} checked={checked} onCheck={check} />
                : <FlashCard key={pos} word={word} speech={speech} reverse={mode === 'reverse'} revealed={revealed}
                            sending={sending} onReveal={() => setRevealed(true)} onAnswer={answer} />;

        body = (
            <div className="card" style={CARD_STYLE}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {pos + 1} / {queue.length} · {entry.practice ? 'повтор забытого' : wordStatus(word.box)}
                </div>
                {card}
                {auto && checked && (
                    <div style={{ marginTop: 20 }}>
                        <div style={{ fontWeight: 600, color: checked.correct ? 'var(--income)' : 'var(--expense)' }}>
                            {checked.correct ? '✓ Верно' : '✗ Неверно'}
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={sending}
                                onClick={() => answer(checked.correct)}>Далее (Enter)</button>
                    </div>
                )}
            </div>
        );
    }

    return <>{modeSwitch}{tagFilter}{body}</>;
}