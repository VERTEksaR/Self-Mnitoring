import {WkModal} from "../WorkoutModal.jsx";
import {EXERCISE_TYPES, MUSCLE_GROUPS, WK_RED} from "../../../utils/workouts.ts";

export function ExerciseFromModal({exForm, saveExercise, setExForm}) {
    return (
        <>
            <WkModal open title={exForm.id ? 'Изменить упражнение' : 'Новое упражнение'} onClose={() => setExForm(null)}
                    footer={<>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExForm(null)}>Отмена</button>
                        <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff' }}
                            disabled={!exForm.name?.trim() || !exForm.muscle_group || !exForm.exercise_type}
                            onClick={() => saveExercise(exForm)}>
                            Сохранить
                        </button>
                    </>}>
                    <div className="form">
                        <div className="form-group">
                            <label className="form-label">Название</label>
                            <input className="input" placeholder="Например, Жим лёжа" value={exForm.name}
                                onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Группа мышц</label>
                                <select className="select" value={exForm.muscle_group}
                                    onChange={e => setExForm(f => ({ ...f, muscle_group: e.target.value }))}>
                                    {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Тип</label>
                                <select className="select" value={exForm.exercise_type}
                                    onChange={e => setExForm(f => ({ ...f, exercise_type: e.target.value }))}>
                                    {EXERCISE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </WkModal>
        </>
    )
}