import { SpeakButton } from "./SpeakButton.jsx";

const RIGHT = { borderColor: 'var(--income)', color: 'var(--income)', background: 'var(--income-subtle)' };
const WRONG = { borderColor: 'var(--expense)', color: 'var(--expense)', background: 'var(--expense-subtle)' };

export function ChoiceCard({ word, speech, options, checked, onCheck }) {
    const optionStyle = (o) => {
        if(!checked) return undefined;

        if (o.id === word.id) return RIGHT;

        if (o.id === checked.given) return WRONG;
        return { opacity: 0.5 };
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '16px 0 4px' }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-strong)' }}>{word.word}</span>
                <SpeakButton text={word.word} speech={speech} size={18} />
            </div>
            {word.transcription && <div style={{ color: 'var(--text-muted)' }}>[{word.transcription}]</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 24 }}>
                {options.map((o, i) => (
                    <button key={o.id} className="btn btn-secondary" style={optionStyle(o)}
                            onClick={() => onCheck(o.id === word.id, o.id)}>
                        {i + 1}. {o.translation}
                    </button>
                ))}
            </div>
        </>
    );
}