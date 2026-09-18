import {useMemo, useState} from "react";
import {bucketLblOf, bucketOf, fmtDate, MUSCLE_COLORS, TODAY, WK_RED, YEAR_START} from "../../utils/workouts.ts";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Cell,
} from 'recharts';
import {Trophy} from "lucide-react";
import {ChartEmpty} from "../EmptyHint.jsx";

const fmtK = v => v >= 1000 ? `${(v/1000).toFixed(1)}т` : String(v);

function WkTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const val  = payload[0].value;
    const key  = payload[0].dataKey;
    const unit = key === 'volume' ? ' кг·повт' : key === 'count' ? ' трен.' : ' сетов';
    return (
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: WK_RED }}>{fmtK(val)}{unit}</div>
        </div>
    );
}

function ChartCard({ title, sub, children, height }) {
    return (
        <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: sub ? 2 : 14 }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{sub}</div>}
            <ResponsiveContainer width="100%" height={height ?? 210}>{children}</ResponsiveContainer>
        </div>
    );
}

export function AnalyticsSection({ trainings, exercises }) {
    const [dateFrom, setDateFrom] = useState(YEAR_START);
    const [dateTo,   setDateTo  ] = useState(TODAY);
    const [gran,     setGran    ] = useState('month');

    const exMap = useMemo(() => Object.fromEntries(exercises.map(e => [e.id, e])), [exercises]);

    const filtered = useMemo(() =>
        trainings.filter(t => t.date >= dateFrom && t.date <= dateTo),
        [trainings, dateFrom, dateTo]
    );

    const allTEs = useMemo(() =>
        filtered.flatMap(t =>
            (t.training_exercises ?? []).map(te => ({ ...te, date: t.date }))
        ),
        [filtered]
    );

    const freqData = useMemo(() => {
        const map = new Map();
        for (const t of filtered) { const k = bucketOf(t.date, gran); map.set(k, (map.get(k) ?? 0) + 1); }
        return [...map.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => ({ label: bucketLblOf(k, gran), count: v }));
    }, [filtered, gran]);

    const volumeData = useMemo(() => {
        const map = new Map();
        for (const t of filtered) {
            const k   = bucketOf(t.date, gran);
            const vol = (t.training_exercises ?? []).reduce((s, te) => s + (Number(te.weight)||0) * (te.quantity||0), 0);
            map.set(k, (map.get(k) ?? 0) + vol);
        }
        return [...map.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => ({ label: bucketLblOf(k, gran), volume: Math.round(v) }));
    }, [filtered, gran]);

    const muscleData = useMemo(() => {
        const map = new Map();
        for (const te of allTEs) {
            const g = exMap[te.exercise_id]?.muscle_group ?? '—';
            map.set(g, (map.get(g) ?? 0) + 1);
        }
        return [...map.entries()].sort(([,a],[,b]) => b-a).map(([name,sets]) => ({ name, sets }));
    }, [allTEs, exMap]);

    const topExData = useMemo(() => {
        const map = new Map();
        for (const te of allTEs) {
            const name = exMap[te.exercise_id]?.name ?? `#${te.exercise_id}`;
            map.set(name, (map.get(name) ?? 0) + 1);
        }
        return [...map.entries()].sort(([,a],[,b]) => b-a).slice(0,8).map(([name,sets]) => ({ name, sets }));
    }, [allTEs, exMap]);

    const records = useMemo(() => {
        const map = new Map();
        for (const t of trainings) {
            for (const te of t.training_exercises ?? []) {
                if (!te.weight) continue;
                const w  = Number(te.weight);
                const ex = exMap[te.exercise_id];
                if (!ex) continue;
                const cur = map.get(te.exercise_id);
                if (!cur || w > cur.weight) map.set(te.exercise_id, { name: ex.name, muscle_group: ex.muscle_group, weight: w, date: t.date });
            }
        }
        return [...map.values()].sort((a,b) => b.weight - a.weight);
    }, [trainings, exMap]);

    const empty = (h = 210) => (
        <ChartEmpty text="Нет данных за выбранный период" height={h} />
    );

    return (
        <div>
            {/* Управление */}
            <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="date" className="input" style={{ fontSize: 12, width: 140 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>—</span>
                    <input type="date" className="input" style={{ fontSize: 12, width: 140 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                    {[['month','Месяцы'],['week','Недели']].map(([id,lbl]) => (
                        <button key={id} onClick={() => setGran(id)} style={{
                            padding: '4px 12px', borderRadius: 6, border: '1px solid', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: gran === id ? WK_RED        : 'var(--surface-sunken)',
                            color:      gran === id ? '#fff'        : 'var(--text-muted)',
                            borderColor:gran === id ? WK_RED        : 'var(--border)',
                        }}>{lbl}</button>
                    ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    {filtered.length} тренировок · {allTEs.length} сетов
                </div>
            </div>

            {/* Частота + Объём */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <ChartCard title="Частота тренировок">
                    {freqData.length === 0 ? empty() : (
                        <BarChart data={freqData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} width={20} />
                            <Tooltip content={<WkTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                            <Bar dataKey="count" fill={WK_RED} radius={[4,4,0,0]} maxBarSize={36} />
                        </BarChart>
                    )}
                </ChartCard>
                <ChartCard title="Объём нагрузки" sub="вес × повторения">
                    {volumeData.length === 0 ? empty() : (
                        <BarChart data={volumeData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} width={34} />
                            <Tooltip content={<WkTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                            <Bar dataKey="volume" fill="rgba(255,59,78,.65)" radius={[4,4,0,0]} maxBarSize={36} />
                        </BarChart>
                    )}
                </ChartCard>
            </div>

            {/* Мышцы + Топ упражнений */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <ChartCard title="Нагрузка по группам мышц" height={Math.max(200, muscleData.length * 40 + 20)}>
                    {muscleData.length === 0 ? empty() : (
                        <BarChart data={muscleData} layout="vertical" margin={{ top: 0, right: 52, bottom: 0, left: 60 }}>
                            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,.06)" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12, fill: 'var(--text-body)' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<WkTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                            <Bar dataKey="sets" radius={[0,4,4,0]} maxBarSize={28}
                                label={{ position: 'right', formatter: v => `${v} сет`, fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                                {muscleData.map((_,i) => <Cell key={i} fill={MUSCLE_COLORS[i % MUSCLE_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    )}
                </ChartCard>
                <ChartCard title="Топ упражнений" sub="по количеству сетов за период" height={Math.max(200, topExData.length * 40 + 20)}>
                    {topExData.length === 0 ? empty() : (
                        <BarChart data={topExData} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 120 }}>
                            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,.06)" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: 'var(--text-body)' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<WkTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                            <Bar dataKey="sets" fill={WK_RED} radius={[0,4,4,0]} maxBarSize={28}
                                label={{ position: 'right', formatter: v => `${v}`, fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }} />
                        </BarChart>
                    )}
                </ChartCard>
            </div>

            {/* Личные рекорды */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Личные рекорды</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Максимальный вес за всё время</div>
                    </div>
                    <Trophy size={18} color={WK_RED} />
                </div>
                {records.length === 0 ? (
                    <ChartEmpty text="Нет данных о весах" padding={28} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {records.map((r, i) => (
                            <div key={r.name} style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px',
                                borderBottom: '1px solid var(--border)',
                                background: i === 0 ? 'rgba(255,59,78,.06)' : 'transparent',
                            }}>
                                <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
                                    {i === 0
                                        ? <Trophy size={14} color={WK_RED} />
                                        : <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'var(--text-faint)' }}>{i+1}</span>}
                                </span>
                                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{r.name}</span>
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,59,78,.1)', color: WK_RED, fontWeight: 700 }}>
                                    {r.muscle_group}
                                </span>
                                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 800, fontSize: 16, color: i === 0 ? WK_RED : 'var(--text-strong)', minWidth: 60, textAlign: 'right' }}>
                                    {r.weight} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>кг</span>
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--text-faint)', minWidth: 56, fontFamily: 'JetBrains Mono,monospace' }}>
                                    {fmtDate(r.date)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}