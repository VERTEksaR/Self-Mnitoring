import { useRef, useState } from "react";
import { SpeakButton } from "./SpeakButton.jsx";
import { normalizeAnswer } from "../../utils/languages";

export function TypingCard({ word, speech, checked, onCheck }) {
    const [text, setText] = useState("");
    const inputRef = useRef(null);

    const submit = (e) => {
        e.preventDefault();

        if (checked || !text.trim()) return;

        inputRef.current?.blur();
        onCheck(normalizeAnswer(text) === normalizeAnswer(word.word), text);
    };

    const giveUp = () => {
        inputRef.current?.blur();
        onCheck(false, "");
    };

    const border = checked && { borderColor: checked.correct ? "var(--income)" : "var(--expense)" };

    return (
        <>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-strong)', margin: '16px 0' }}>
                {word.translation}
            </div>

            <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
                <input
                    ref={inputRef}
                    className="input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ ...border, flex: 1 }}
                    disabled={!!checked}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />
                {!checked && <button type="button" className="btn btn-ghost" onClick={giveUp}>
                    Не знаю    
                </button>}
            </form>

            {checked && !checked.correct && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                    <span>Правильно: <b>{word.word}</b></span>
                    <SpeakButton text={word.word} speech={speech} />
                </div>
            )}
        </>
    )
}