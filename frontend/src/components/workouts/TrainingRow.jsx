import {fmtDate, fmtNum} from "../../utils/workouts.ts";
import {useState} from "react";
import {Dumbbell, ChevronRight} from "lucide-react";

export function TrainingRow({ training, onClick }) {
    const [hov, setHov] = useState(false);
    const tes = training.training_exercises ?? [];
    const volume = tes.reduce((s, te) => s + (Number(te.weight) || 0) * (te.quantity || 0), 0);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            border: '1px solid var(--border)', borderRadius: 8,
            background: hov ? 'var(--surface-hover)' : 'var(--surface-sunken)',
            borderColor: hov ? 'rgba(255,59,78,.36)' : 'var(--border)',
            cursor: 'pointer', transition: 'border-color .15s, background .15s',
        }}>
            <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 8, background: 'rgba(255,59,78,.14)', color: '#ff3b4e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 14 }}>{training.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {fmtDate(training.date)} · {tes.length} упр
                </div>
            </div>
            {volume > 0 && (
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: 'var(--text-strong)', fontSize: 15, flexShrink: 0 }}>
                    {fmtNum(volume)} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>кг</span>
                </div>
            )}
            <ChevronRight size={16} color="var(--text-faint)" />
        </div>
    );
}