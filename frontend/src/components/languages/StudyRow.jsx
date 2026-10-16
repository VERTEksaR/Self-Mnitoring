import {useState} from "react";
import {Pencil, Trash2} from "lucide-react";
import {formatMinutes, formatStudyDate} from "../../utils/languages.ts";

const TYPE_CHIP = {
    fontSize: 11, padding: '1px 8px', borderRadius: 'var(--radius-pill)',
    color: '#22d3ee', background: 'rgba(34,211,238,.12)', border: '1px solid rgba(34,211,238,.3)',
};

export function StudyRow({ study, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ /* как сейчас */ }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{formatStudyDate(study.study_date)}</span>
                    <span style={TYPE_CHIP}>{study.study_type}</span>
                </div>
                {study.comment && (
                    <div title={study.comment} style={{
                        fontSize: 13, color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{study.comment}</div>
                )}
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text-strong)', whiteSpace: 'nowrap' }}>
                {formatMinutes(study.minutes)}
            </span>
            <div style={{ display: 'flex', gap: 6, opacity: hov ? 1 : 0, transition: 'opacity .15s' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Pencil size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--expense)' }} onClick={onDelete}><Trash2 size={14} /></button>
            </div>
        </div>
    );
}
