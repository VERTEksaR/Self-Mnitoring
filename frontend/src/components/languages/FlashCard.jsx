import { SpeakButton } from "./SpeakButton";

export function FlashCard({ word, speech, reverse, revealed, sending, onReveal, onAnswer }) {
    const foreign = (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin:"16px 0 4px" }}>
                <span style={{ fontSize:32, fontWeight:700, color:"var(--text-strong)" }}>
                    {word.word}
                </span>
                <SpeakButton text={word.word} speech={speech} size={18} />
            </div>

            {word.transcription && <div style={{ color:"var(--text-muted)" }}>
                    [{word.transcription}]
                </div>}
        </>
    );

    const native = reverse ? <div style={{ fontSize:32, fontWeight:700, color:"var(--text-strong)", margin:"16px 0 4px"  }}>
        {word.translation}
    </div> : <div style={{ fontSize:20, margin:"20px 0 8px" }}>
        {word.translation}
    </div>;

    return (
        <>
            {reverse ? native : foreign}

            {revealed ? (
                <>
                    {reverse ? foreign : native}

                    {word.example && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                {word.example}
                            </span>
                            <SpeakButton text={word.example} speech={speech} />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }} >
                        <button className="btn btn-danger" disabled={sending} onClick={() => onAnswer(false)}>Не помню (1)</button>
                        <button className="btn btn-primary" disabled={sending} onClick={() => onAnswer(true)}>Помню (2)</button>
                    </div>
                </>
            ) : (
                <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={onReveal}>
                    {reverse ? 'Показать слово' : 'Показать перевод'} (пробел)
                </button>
            )}
        </>
    );
}