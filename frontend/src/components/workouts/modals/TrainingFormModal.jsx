import {X} from "lucide-react";
import {WkModal} from "./WorkoutModal.jsx";
import {WK_RED, WK_RED_BD, WK_RED_SUBTLE} from "../../../utils/workouts.ts";

export function TrainingFormModal({ setTrainForm, trainForm, saveTraining,
                                  exercises}) {
    const toggleEx = (exId) => setTrainForm(f => {
        const has = f.exercises.some(e => e.exercise_id === exId);
        return {
            ...f,
            exercises: has
                ? f.exercises.filter(e => e.exercise_id !== exId)
                : [...f.exercises, { exercise_id: exId, quantity: '', weight: '' }],
        };
    });
    const updateEntry = (exId, field, val) => setTrainForm(f => ({
        ...f,
        exercises: f.exercises.map(e => e.exercise_id === exId ? { ...e, [field]: val } : e),
    }));
    return (
        <WkModal open title={trainForm.id ? 'Изменить тренировку' : 'Новая тренировка'} onClose={() => setTrainForm(null)} width={500}
            footer={<>
                <button className="btn btn-secondary btn-sm" onClick={() => setTrainForm(null)}>Отмена</button>
                <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff' }}
                    disabled={!trainForm.name?.trim()}
                    onClick={() => saveTraining(trainForm)}>
                    Сохранить
                </button>
            </>}>
            <div className="form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Название</label>
                        <input className="input" placeholder="День груди" value={trainForm.name}
                            onChange={e => setTrainForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Дата</label>
                        <input className="input" type="date" value={trainForm.date}
                            onChange={e => setTrainForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                </div>
                {exercises.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">
                            Упражнения · выбрано {trainForm.exercises.length}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto', paddingTop: 4 }}>
                            {exercises.map(ex => {
                                const entry = trainForm.exercises.find(e => e.exercise_id === ex.id);
                                const on = !!entry;
                                return (
                                    <div key={ex.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 10px', borderRadius: 8,
                                        border: `1px solid ${on ? WK_RED_BD : 'var(--border)'}`,
                                        background: on ? WK_RED_SUBTLE : 'var(--surface-sunken)',
                                    }}>
                                        <button type="button" onClick={() => toggleEx(ex.id)} style={{
                                            flex: 1, textAlign: 'left', background: 'none', border: 'none',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            fontSize: 13, fontWeight: 600,
                                            color: on ? WK_RED : 'var(--text-body)',
                                        }}>
                                            {on ? <X size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} /> : null}
                                            {ex.name}
                                        </button>
                                        {on && (
                                            <>
                                                <input type="number" min="1" placeholder="повт" value={entry.quantity}
                                                    onChange={e => updateEntry(ex.id, 'quantity', e.target.value)}
                                                    style={{ width: 70, fontSize: 13 }} className="input" />
                                                <input type="number" min="0" step="0.5" placeholder="кг" value={entry.weight}
                                                    onChange={e => updateEntry(ex.id, 'weight', e.target.value)}
                                                    style={{ width: 70, fontSize: 13 }} className="input" />
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </WkModal>
    )
}