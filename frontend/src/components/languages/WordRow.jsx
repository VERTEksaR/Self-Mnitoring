import {useState} from "react";
import {Pencil, Trash2} from "lucide-react";
import {SpeakButton} from "./SpeakButton.jsx";
import {wordStatus, wordStatusStyle} from "../../utils/languages.ts";

export function WordRow({ word, onEdit, onDelete, speech }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-sunken)',
            transition: 'border-color .15s',
            borderColor: hov ? 'rgba(34,211,238,.36)' : 'var(--border)',
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{word.word}</span>
                    <SpeakButton text={word.word} speech={speech}/>
                    {word.transcription && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>[{word.transcription}]</span>}
                    {word.part_of_speech && <span className="badge badge-neutral">{word.part_of_speech}</span>}
                    <span title={word.next_review_date ? `Следующее повторение: ${word.next_review_date}` : 'Ещё не повторялось'}
                          style={{ fontSize: 11, padding: '1px 8px', borderRadius: 'var(--radius-pill)', ...wordStatusStyle(word.box) }}>
                        {wordStatus(word.box)}
                    </span>
                    {word.tags.map(t => (
                        <span key={t.id} style={{
                            fontSize: 11, padding: '1px 8px', borderRadius: 'var(--radius-pill)',
                            color: '#22d3ee', background: 'rgba(34,211,238,.12)', border: '1px solid rgba(34,211,238,.3)',
                        }}>#{t.name}</span>
                    ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-body)' }}>{word.translation}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, opacity: hov ? 1 : 0, transition: 'opacity .15s' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Pencil size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--expense)' }} onClick={onDelete}><Trash2 size={14} /></button>
            </div>
        </div>
    );
}