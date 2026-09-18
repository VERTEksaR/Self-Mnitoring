import {Plus, Flame, Timer} from "lucide-react";
import {EX_FORM_DEFAULT, fmtNum, HISTORY_LIMIT, TODAY, WK_RED} from "../../utils/workouts.ts";
import {StatTile} from "./StatTile.jsx";
import {TrainingRow} from "./TrainingRow.jsx";
import {ExerciseRow} from "./ExerciseRow.jsx";
import {VolumeChart} from "./VolumeChart.jsx";
import {ChartEmpty, EmptyHint} from "../EmptyHint.jsx";
import {useState} from "react";

export function OverviewSection({ setTrainForm, periodTrainings, totalReps, progressSeries, setRange,
                                activeExId, setSelectedExId, exercises, setDetailTraining,
                                setExForm, removeExercise, range }) {
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const visibleEx = historyExpanded ? exercises : exercises.slice(0, HISTORY_LIMIT)

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Тренировки</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>Контроль тренировок</h1>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="date" className="input" style={{ width: 140, fontSize: 13 }}
                        value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                    <input type="date" className="input" style={{ width: 140, fontSize: 13 }}
                        value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} />
                </div>
                <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setTrainForm({ name: '', date: TODAY, exercises: [] })}>
                    <Plus size={16} /> Тренировка
                </button>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 22 }}>
            <StatTile label="Тренировок" value={String(periodTrainings.length)} hint="за период" icon={<Flame size={16} />} />
            <StatTile label="Повторений" value={fmtNum(totalReps)} hint="суммарно" icon={<Timer size={16} />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,340px)', gap: 20, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Chart */}
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Прогресс по упражнению</h3>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                {progressSeries.length > 0
                                    ? `${progressSeries.length} записей · рабочий вес`
                                    : 'Нет данных за выбранный период'}
                            </div>
                        </div>
                        <select
                            value={activeExId ?? ''}
                            onChange={e => setSelectedExId(Number(e.target.value))}
                            className="input"
                            style={{ fontSize: 13, width: 'auto', minWidth: 160, flexShrink: 0 }}>
                            {exercises.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                        </select>
                    </div>
                    <VolumeChart series={progressSeries} />
                </div>

                {/* Training log */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Журнал тренировок</h3>
                        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: 'var(--text-faint)' }}>{periodTrainings.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
                        {periodTrainings.length === 0 && (
                            <ChartEmpty text="Нет тренировок в этом периоде" padding={24} />
                        )}
                        {periodTrainings.map(t => (
                            <TrainingRow key={t.id} training={t} onClick={() => setDetailTraining(t)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Exercises quick list */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Упражнения</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setExForm({ ...EX_FORM_DEFAULT })}>
                        <Plus size={15} /> Добавить
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12}}>
                    {exercises.length === 0 && (
                        <EmptyHint
                        title="Нет упражнений"
                        hint="Добавьте первое упражнение, чтобы начать вести журнал тренировок."
                        action="+ Добавить"
                        onAction={() => setExForm({ ...EX_FORM_DEFAULT })}/>
                    )}
                    {visibleEx.map(e => (
                        <ExerciseRow key={e.id} exercise={e}
                            onEdit={() => setExForm({ id: e.id, name: e.name, muscle_group: e.muscle_group, exercise_type: e.exercise_type })}
                            onDelete={() => removeExercise(e.id)} />
                    ))}
                    {exercises.length > HISTORY_LIMIT && (
                        <button onClick={() => setHistoryExpanded(x => !x)} style={{
                            margin: '8px 18px', padding: '4px 12px', borderRadius: 6,
                                    border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    color: 'var(--text-muted)', fontFamily: 'inherit', alignSelf: 'flex-start',
                        }}>
                            {historyExpanded ? 'Свернуть' : `Ещё ${exercises.length - HISTORY_LIMIT}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    </>
    )
}