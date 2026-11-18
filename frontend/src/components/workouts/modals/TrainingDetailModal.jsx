import { Trash2, Pencil } from 'lucide-react';
import { WkModal} from "./WorkoutModal.jsx";
import { fmtDate, WK_RED} from "../../../utils/workouts.ts";

export function TrainingDetailModal({ training, onClose, onDelete, onEdit }) {
    return (
        <WkModal open title={training.name} onClose={onClose} width={480}
            footer={<>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(training.id)}>
                    <Trash2 size={14} /> Удалить
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => onEdit(training)}>
                    <Pencil size={14} /> Изменить
                </button>
                <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff' }} onClick={onClose}>
                    Закрыть
                </button>
            </>}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {[['Дата', fmtDate(training.date)], ['Упражнений', (training.training_exercises || []).length]].map(([k, v]) => (
                    <div key={k} style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-sunken)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{k}</div>
                        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: 'var(--text-strong)', fontSize: 15 }}>{v}</div>
                    </div>
                ))}
            </div>
            {(training.training_exercises || []).length > 0 && (
                <>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Упражнения</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {training.training_exercises.map(te => (
                            <div key={te.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-sunken)' }}>
                                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-strong)', fontSize: 14 }}>{te.exercise.name}</span>
                                {te.quantity != null && (
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{te.quantity} повт</span>
                                )}
                                {te.weight != null && (
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', fontFamily: 'JetBrains Mono,monospace' }}>{te.weight} кг</span>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </WkModal>
    );
}