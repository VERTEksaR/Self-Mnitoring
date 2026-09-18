import {Plus, Pencil, Trash2, Trophy, Timer, Flame} from "lucide-react";
import {EX_FORM_DEFAULT, fmtDate, HISTORY_LIMIT, WK_RED, WK_RED_SUBTLE} from "../../utils/workouts.ts";
import {StatTile} from "./StatTile.jsx";
import {VolumeChart} from "./VolumeChart.jsx";
import {ChartEmpty, EmptyHint} from "../EmptyHint.jsx";
import {useState} from "react";

export function ExerciseProfileSection({exercises, trainings, exProfileId,
                                setExProfileId, exSearch, setExSearch, setExForm,
                                removeExercise}) {
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const [exListExpanded, setExListExpanded] = useState(false);

    const profileEx = exercises.find(e => e.id === exProfileId) ?? exercises[0] ?? null;
    const profileId = profileEx?.id ?? null;

    const allExTEs = trainings
        .flatMap(t =>
            (t.training_exercises ?? [])
                .filter(te => te.exercise_id === profileId)
                .map(te => ({ date: t.date, weight: Number(te.weight ?? 0), quantity: te.quantity }))
        )
        .sort((a, b) => b.date.localeCompare(a.date));

    const visibleExTEs = historyExpanded ? allExTEs : allExTEs.slice(0, HISTORY_LIMIT);

    const maxWeight = allExTEs.length ? Math.max(...allExTEs.map(te => te.weight)) : 0;
    const lastDate  = allExTEs[0]?.date ?? null;
    const totalSets = allExTEs.length;
    const chartSeries = [...allExTEs].reverse().filter(te => te.weight > 0)
        .map(te => ({ date: te.date, value: te.weight, quantity: te.quantity }));

    const filteredEx = exercises.filter(e =>
        e.name.toLowerCase().includes(exSearch.toLowerCase())
    );
    const visibleFilteredEx = exListExpanded ? filteredEx : filteredEx.slice(0, HISTORY_LIMIT);

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

            {/* Left: список */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="Поиск..." value={exSearch}
                        onChange={e => setExSearch(e.target.value)}
                        style={{ flex: 1, fontSize: 13 }} />
                    <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff', flexShrink: 0, padding: '0 10px' }}
                        onClick={() => setExForm({ ...EX_FORM_DEFAULT })}>
                        <Plus size={15} />
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column'}}>
                    {filteredEx.length === 0 && (
                        <EmptyHint
                        title={exSearch ? 'Ничего не найдено' : 'Нет упражнений'}
                        hint={exSearch ? 'Попробуйте изменить запрос поиска.' : 'Добавьте первое упражнение через кнопку выше.'}
                        action={exSearch ? null : '+ Добавить'}
                        onAction={() => setExForm({ ...EX_FORM_DEFAULT })}/>
                    )}
                    {visibleFilteredEx.map(ex => {
                        const isActive = ex.id === (exProfileId ?? exercises[0]?.id);
                        return (
                            <div key={ex.id} onClick={() => setExProfileId(ex.id)} style={{
                                padding: '12px 16px', cursor: 'pointer',
                                borderBottom: '1px solid var(--border)',
                                borderLeft: `3px solid ${isActive ? WK_RED : 'transparent'}`,
                                background: isActive ? WK_RED_SUBTLE : 'transparent',
                                transition: 'background .12s',
                            }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? WK_RED : 'var(--text-strong)', marginBottom: 5 }}>
                                    {ex.name}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,59,78,.12)', color: WK_RED, fontWeight: 700 }}>
                                        {ex.muscle_group}
                                    </span>
                                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--surface-sunken)', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border)' }}>
                                        {ex.exercise_type}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {filteredEx.length > HISTORY_LIMIT && (
                        <button onClick={() => setExListExpanded(x => !x)} style={{
                            margin: '8px 16px', padding: '4px 12px', borderRadius: 6,
                            border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            color: 'var(--text-muted)', fontFamily: 'inherit', alignSelf: 'flex-start',
                        }}>
                            {exListExpanded ? 'Свернуть' : `Ещё ${filteredEx.length - HISTORY_LIMIT}`}
                        </button>
                    )}
                </div>
            </div>

            {/* Right: профиль */}
            {profileEx ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Заголовок */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-strong)', margin: '0 0 8px' }}>
                                {profileEx.name}
                            </h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,59,78,.12)', color: WK_RED, fontWeight: 700 }}>
                                    {profileEx.muscle_group}
                                </span>
                                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'var(--surface-card)', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border)' }}>
                                    {profileEx.exercise_type}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button className="btn btn-secondary btn-sm"
                                onClick={() => setExForm({ id: profileEx.id, name: profileEx.name, muscle_group: profileEx.muscle_group, exercise_type: profileEx.exercise_type })}>
                                <Pencil size={14} /> Изменить
                            </button>
                            <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,.12)', color: '#ef4444', borderColor: 'rgba(239,68,68,.28)' }}
                                onClick={() => { removeExercise(profileEx.id); setExProfileId(null); }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Мини-статы */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <StatTile label="Рекорд" value={maxWeight > 0 ? String(maxWeight) : '—'} unit={maxWeight > 0 ? 'кг' : ''} hint="макс. вес" icon={<Trophy size={16} />} />
                        <StatTile label="Последний раз" value={lastDate ? fmtDate(lastDate) : '—'} hint="дата тренировки" icon={<Timer size={16} />} />
                        <StatTile label="Всего сетов" value={String(totalSets)} hint="за всё время" icon={<Flame size={16} />} />
                    </div>

                    {/* Прогресс-чарт */}
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 16px' }}>
                            Прогресс рабочего веса
                        </h3>
                        <VolumeChart series={chartSeries} />
                    </div>

                    {/* История */}
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>История</span>
                            <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }}>{allExTEs.length} записей</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {allExTEs.length === 0 && (
                                <ChartEmpty text="Нет записей для этого упражнения" padding={28} />
                            )}
                            {visibleExTEs.map((te, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '10px 18px', borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace', minWidth: 72 }}>
                                        {fmtDate(te.date)}
                                    </span>
                                    {te.weight > 0 && (
                                        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: 'var(--text-strong)', fontSize: 14 }}>
                                            {te.weight} кг
                                        </span>
                                    )}
                                    {te.quantity != null && (
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {te.quantity} повт.
                                        </span>
                                    )}
                                </div>
                            ))}
                            {allExTEs.length > HISTORY_LIMIT && (
                                <button onClick={() => setHistoryExpanded(x => !x)} style={{
                                    margin: '8px 18px', padding: '4px 12px', borderRadius: 6,
                                    border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    color: 'var(--text-muted)', fontFamily: 'inherit', alignSelf: 'flex-start',
                                }}>
                                    {historyExpanded ? 'Свернуть' : `Ещё ${allExTEs.length - HISTORY_LIMIT}`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    Выберите упражнение из списка
                </div>
            )}
        </div>
        </>
    )
}