import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, LayoutDashboard, ScrollText, Dumbbell, TrendingUp,
    Plus, Pencil, Trash2,
    ChevronRight, ChevronLeft, Flame, Timer, Trophy, X,
    Home, Wallet,
} from 'lucide-react';
import {
    getExercises, createExercise, updateExercise, deleteExercise,
    getTrainings, createTraining, updateTraining, deleteTraining,
} from '../api/workouts';

const TODAY = new Date().toISOString().slice(0, 10);
const fmtNum = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));
const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
const fmtShort = (iso) => { const [, m, d] = iso.split('-'); return `${Number(d)}.${m}`; };

// ── VolumeChart ──────────────────────────────────────────────
function VolumeChart({ series }) {
    const [hover, setHover] = useState(null);
    const ref = useRef(null);
    const W = 760, H = 260, pad = { t: 20, r: 18, b: 34, l: 54 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

    if (!series?.length) return (
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Нет данных за выбранный период
        </div>
    );

    const vals = series.map(d => d.value);
    const maxV = Math.max(...vals), minV = Math.min(...vals);
    const lo = Math.max(0, minV - (maxV - minV) * 0.35);
    const hi = maxV + (maxV - minV) * 0.18 || maxV * 1.1 || 1;
    const span = hi - lo || 1;
    const x = i => pad.l + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw);
    const y = v => pad.t + ih - ((v - lo) / span) * ih;
    const linePath = series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${x(series.length - 1).toFixed(1)},${(pad.t + ih).toFixed(1)} L ${x(0).toFixed(1)},${(pad.t + ih).toFixed(1)} Z`;
    const grid = Array.from({ length: 5 }, (_, i) => lo + (span * i) / 4);
    const everyN = Math.ceil(series.length / 7);
    const fmtTick = v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v));
    const hd = hover != null ? series[hover] : null;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}
            onMouseMove={e => {
                if (!ref.current) return;
                const r = ref.current.getBoundingClientRect();
                const px = ((e.clientX - r.left) / r.width) * W;
                let best = 0, bd = Infinity;
                series.forEach((_, i) => { const dd = Math.abs(x(i) - px); if (dd < bd) { bd = dd; best = i; } });
                setHover(best);
            }}
            onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', display: 'block', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="wkArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff3b4e" stopOpacity="0.42" />
                        <stop offset="60%" stopColor="#ff3b4e" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#ff3b4e" stopOpacity="0" />
                    </linearGradient>
                    <filter id="wkGlow" x="-20%" y="-40%" width="140%" height="180%">
                        <feGaussianBlur stdDeviation="3.4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                {grid.map((g, i) => (
                    <g key={i}>
                        <line x1={pad.l} y1={y(g)} x2={W - pad.r} y2={y(g)} stroke="rgba(255,90,105,0.10)" strokeWidth="1" />
                        <text x={pad.l - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="var(--text-faint)" fontFamily="JetBrains Mono, monospace">
                            {fmtTick(g)}
                        </text>
                    </g>
                ))}
                {series.map((d, i) => (i % everyN === 0 || i === series.length - 1) && (
                    <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="10.5" fill="var(--text-faint)" fontFamily="JetBrains Mono, monospace">
                        {fmtShort(d.date)}
                    </text>
                ))}
                <path d={areaPath} fill="url(#wkArea)" />
                <path d={linePath} fill="none" stroke="#ff3b4e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" filter="url(#wkGlow)" />
                {series.map((d, i) => (
                    <circle key={i} cx={x(i)} cy={y(d.value)} r={hover === i ? 5 : 2.6}
                        fill={hover === i ? '#fff' : '#ff3b4e'} stroke="#ff3b4e" strokeWidth={hover === i ? 2.5 : 0}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,59,78,0.8))' }} />
                ))}
                {hd && <line x1={x(hover)} y1={pad.t} x2={x(hover)} y2={pad.t + ih}
                    stroke="rgba(255,59,78,0.45)" strokeWidth="1" strokeDasharray="3 4" />}
            </svg>
            {hd && (
                <div style={{
                    position: 'absolute', top: 0, left: `${(x(hover) / W) * 100}%`,
                    transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10,
                    background: 'var(--surface-raised)', border: '1px solid rgba(255,59,78,0.36)',
                    borderRadius: 8, padding: '8px 12px', minWidth: 120,
                    boxShadow: '0 6px 18px rgba(0,0,0,.6)', whiteSpace: 'nowrap',
                }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{fmtDate(hd.date)}</div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>
                        {fmtNum(hd.value)}<span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}> кг</span>
                    </div>
                    {hd.name && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{hd.name}</div>}
                </div>
            )}
        </div>
    );
}

// ── Modal ────────────────────────────────────────────────────
function WkModal({ open, title, onClose, children, footer, width = 420 }) {
    useEffect(() => {
        const fn = e => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [onClose]);
    if (!open) return null;
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" style={{ width, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-actions">{footer}</div>}
            </div>
        </div>
    );
}

// ── StatTile ─────────────────────────────────────────────────
function StatTile({ label, value, unit, hint, icon, accent }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 10, padding: 18,
            background: accent ? '#ff3b4e' : 'var(--surface-card)',
            border: `1px solid ${accent ? '#ff3b4e' : 'var(--border)'}`,
            borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.5)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: accent ? 'rgba(255,255,255,.7)' : 'var(--text-muted)' }}>
                    {label}
                </span>
                <span style={{ display: 'inline-flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: accent ? 'rgba(255,255,255,.18)' : 'rgba(255,59,78,.14)', color: accent ? '#fff' : '#ff3b4e' }}>
                    {icon}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 26, color: accent ? '#fff' : 'var(--text-strong)' }}>
                    {value}
                </span>
                {unit && <span style={{ fontSize: 13, fontWeight: 600, color: accent ? 'rgba(255,255,255,.7)' : 'var(--text-muted)' }}>{unit}</span>}
            </div>
            {hint && <span style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,.6)' : 'var(--text-faint)' }}>{hint}</span>}
        </div>
    );
}

// ── ExerciseRow ──────────────────────────────────────────────
function ExerciseRow({ exercise, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-sunken)',
            transition: 'border-color .15s',
            borderColor: hov ? 'rgba(255,59,78,.36)' : 'var(--border)',
        }}>
            <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-strong)', fontSize: 14 }}>{exercise.name}</span>
            <div style={{ display: 'flex', gap: 6, opacity: hov ? 1 : 0, transition: 'opacity .15s' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Pencil size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--expense)' }} onClick={onDelete}><Trash2 size={14} /></button>
            </div>
        </div>
    );
}

// ── TrainingRow ──────────────────────────────────────────────
function TrainingRow({ training, onClick }) {
    const [hov, setHov] = useState(false);
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
                    {fmtDate(training.date)} · {training.quantity} повт · {training.exercises?.length || 0} упр
                </div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: 'var(--text-strong)', fontSize: 15, flexShrink: 0 }}>
                {training.weight} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>кг</span>
            </div>
            <ChevronRight size={16} color="var(--text-faint)" />
        </div>
    );
}

// ── WorkoutsPage ─────────────────────────────────────────────
export default function WorkoutsPage() {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNav, setActiveNav] = useState('overview');
    const [range, setRange] = useState({ from: '2026-01-01', to: TODAY });

    const [detailTraining, setDetailTraining] = useState(null);
    const [trainForm, setTrainForm] = useState(null);
    const [exForm, setExForm] = useState(null);

    useEffect(() => {
        document.body.classList.add('wk-body');
        return () => document.body.classList.remove('wk-body');
    }, []);

    useEffect(() => {
        Promise.all([
            getExercises({ size: 500 }),
            getTrainings({ size: 500 }),
        ]).then(([exRes, trRes]) => {
            setExercises(exRes.data.items ?? []);
            setTrainings(trRes.data.items ?? []);
        }).finally(() => setLoading(false));
    }, []);

    const inPeriod = t => t.date >= range.from && t.date <= range.to;
    const periodTrainings = trainings.filter(inPeriod).sort((a, b) => b.date.localeCompare(a.date));

    const totalVolume = periodTrainings.reduce((s, t) => s + Number(t.weight) * t.quantity, 0);
    const bestWeight = periodTrainings.reduce((s, t) => Math.max(s, Number(t.weight)), 0);
    const totalReps = periodTrainings.reduce((s, t) => s + t.quantity, 0);
    const chartSeries = [...periodTrainings]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(t => ({ date: t.date, value: Number(t.weight) * t.quantity, name: t.name }));

    // ── Exercise CRUD ──
    async function saveExercise(form) {
        if (form.id) {
            const res = await updateExercise(form.id, { name: form.name });
            setExercises(p => p.map(e => e.id === form.id ? res.data : e));
        } else {
            const res = await createExercise({ name: form.name });
            setExercises(p => [res.data, ...p]);
        }
        setExForm(null);
    }
    async function removeExercise(id) {
        await deleteExercise(id);
        setExercises(p => p.filter(e => e.id !== id));
    }

    // ── Training CRUD ──
    async function saveTraining(form) {
        const data = {
            name: form.name,
            quantity: Number(form.quantity),
            weight: Number(form.weight),
            date: form.date,
            exercise_ids: form.exercise_ids,
        };
        if (form.id) {
            const res = await updateTraining(form.id, data);
            setTrainings(p => p.map(t => t.id === form.id ? res.data : t));
        } else {
            const res = await createTraining(data);
            setTrainings(p => [res.data, ...p]);
        }
        setTrainForm(null);
    }
    async function removeTraining(id) {
        await deleteTraining(id);
        setTrainings(p => p.filter(t => t.id !== id));
        setDetailTraining(null);
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    const navItems = [
        { id: 'overview', label: 'Обзор', icon: <LayoutDashboard size={18} /> },
        { id: 'log', label: 'Журнал', icon: <ScrollText size={18} /> },
        { id: 'exercises', label: 'Упражнения', icon: <Dumbbell size={18} /> },
        { id: 'analytics', label: 'Аналитика', icon: <TrendingUp size={18} /> },
    ];

    const WK_RED = '#ff3b4e';
    const WK_RED_SUBTLE = 'rgba(255,59,78,.14)';
    const WK_RED_BD = 'rgba(255,59,78,.36)';

    return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} aria-label="Назад">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="finance-nav-brand" style={{ color: WK_RED }}>Тренировки</span>
                </div>
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Выйти</button>
                </div>
            </nav>

            <div style={{ display: 'flex' }}>
                {/* Module quick-nav (left) */}
                <nav className="finance-module-nav" style={{ position: 'sticky', top: 56, height: 'calc(100vh - 56px)', alignSelf: 'flex-start' }}>
                    <span className="finance-module-nav__label">Модули</span>
                    <button className="finance-module-nav__btn finance-module-nav__btn--home" onClick={() => navigate('/')} title="Главная">
                        <Home size={18} />
                        <span>Главная</span>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--finance" onClick={() => navigate('/finance')} title="Финансы">
                        <Wallet size={18} />
                        <span>Финансы</span>
                    </button>
                </nav>

                {/* Sidebar */}
                <aside style={{
                    width: 232, flex: 'none', position: 'sticky', top: 56,
                    height: 'calc(100vh - 56px)', padding: 16,
                    background: 'var(--surface-card)', borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    backdropFilter: 'blur(12px)',
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', padding: '0 12px 6px' }}>
                        Тренировки
                    </div>
                    {navItems.map(item => (
                        <div key={item.id} onClick={() => setActiveNav(item.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 8,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            color: item.id === activeNav ? WK_RED : 'var(--text-body)',
                            background: item.id === activeNav ? WK_RED_SUBTLE : 'transparent',
                        }}>
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                    <div style={{ flex: 1 }} />
                </aside>

                {/* Main */}
                <main style={{ flex: 1, minWidth: 0, padding: 28 }}>
                    {/* Header */}
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
                                onClick={() => setTrainForm({ name: '', quantity: 10, weight: '', date: TODAY, exercise_ids: [] })}>
                                <Plus size={16} /> Тренировка
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
                        <StatTile label="Тренировок" value={String(periodTrainings.length)} hint="за период" icon={<Flame size={16} />} />
                        <StatTile label="Объём" value={fmtNum(totalVolume)} unit="кг" accent hint="вес × повторения" icon={<Activity size={16} />} />
                        <StatTile label="Повторений" value={fmtNum(totalReps)} hint="суммарно" icon={<Timer size={16} />} />
                        <StatTile label="Рекорд" value={String(bestWeight)} unit="кг" hint="лучший вес" icon={<Trophy size={16} />} />
                    </div>

                    {/* 2-col grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,340px)', gap: 20, alignItems: 'start' }}>
                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Chart */}
                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Динамика нагрузки</h3>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                        {periodTrainings.length} тренировок · объём = вес × повторения
                                    </div>
                                </div>
                                <VolumeChart series={chartSeries} />
                            </div>

                            {/* Training log */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Журнал тренировок</h3>
                                    <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: 'var(--text-faint)' }}>{periodTrainings.length}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
                                    {periodTrainings.length === 0 && (
                                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Нет тренировок в этом периоде</div>
                                    )}
                                    {periodTrainings.map(t => (
                                        <TrainingRow key={t.id} training={t} onClick={() => setDetailTraining(t)} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right — Exercises */}
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>Упражнения</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setExForm({ name: '' })}>
                                    <Plus size={15} /> Добавить
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, maxHeight: 640, overflowY: 'auto' }}>
                                {exercises.length === 0 && (
                                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Нет упражнений</div>
                                )}
                                {exercises.map(e => (
                                    <ExerciseRow key={e.id} exercise={e}
                                        onEdit={() => setExForm({ id: e.id, name: e.name })}
                                        onDelete={() => removeExercise(e.id)} />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Training detail modal ── */}
            {detailTraining && (
                <WkModal open title={detailTraining.name} onClose={() => setDetailTraining(null)} width={460}
                    footer={<>
                        <button className="btn btn-danger btn-sm" onClick={() => removeTraining(detailTraining.id)}>
                            <Trash2 size={14} /> Удалить
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                            setTrainForm({
                                id: detailTraining.id,
                                name: detailTraining.name,
                                quantity: detailTraining.quantity,
                                weight: detailTraining.weight,
                                date: detailTraining.date,
                                exercise_ids: (detailTraining.exercises || []).map(e => e.id),
                            });
                            setDetailTraining(null);
                        }}>
                            <Pencil size={14} /> Изменить
                        </button>
                        <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff' }} onClick={() => setDetailTraining(null)}>
                            Закрыть
                        </button>
                    </>}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        {[['Дата', fmtDate(detailTraining.date)], ['Повторения', detailTraining.quantity], ['Вес', `${detailTraining.weight} кг`]].map(([k, v]) => (
                            <div key={k} style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-sunken)' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{k}</div>
                                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: 'var(--text-strong)', fontSize: 15 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                    {(detailTraining.exercises || []).length > 0 && (
                        <>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Упражнения</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {detailTraining.exercises.map(ex => (
                                    <div key={ex.id} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 600, color: 'var(--text-strong)', fontSize: 14 }}>
                                        {ex.name}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </WkModal>
            )}

            {/* ── Training form modal ── */}
            {trainForm && (
                <WkModal open title={trainForm.id ? 'Изменить тренировку' : 'Новая тренировка'} onClose={() => setTrainForm(null)}
                    footer={<>
                        <button className="btn btn-secondary btn-sm" onClick={() => setTrainForm(null)}>Отмена</button>
                        <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff' }}
                            disabled={!trainForm.name?.trim()}
                            onClick={() => saveTraining(trainForm)}>
                            Сохранить
                        </button>
                    </>}>
                    <div className="form">
                        <div className="form-group">
                            <label className="form-label">Название</label>
                            <input className="input" placeholder="Например, Жим лёжа" value={trainForm.name}
                                onChange={e => setTrainForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Дата</label>
                                <input className="input" type="date" value={trainForm.date}
                                    onChange={e => setTrainForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Повторения</label>
                                <input className="input" type="number" min="1" value={trainForm.quantity}
                                    onChange={e => setTrainForm(f => ({ ...f, quantity: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Вес (кг)</label>
                                <input className="input" type="number" min="0" step="0.5" value={trainForm.weight}
                                    onChange={e => setTrainForm(f => ({ ...f, weight: e.target.value }))} />
                            </div>
                        </div>
                        {exercises.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Упражнения · выбрано {trainForm.exercise_ids.length}</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, maxHeight: 200, overflowY: 'auto', paddingTop: 4 }}>
                                    {exercises.map(e => {
                                        const on = trainForm.exercise_ids.includes(e.id);
                                        return (
                                            <button key={e.id} type="button"
                                                onClick={() => setTrainForm(f => ({ ...f, exercise_ids: on ? f.exercise_ids.filter(x => x !== e.id) : [...f.exercise_ids, e.id] }))}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    cursor: 'pointer', fontFamily: 'inherit',
                                                    fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 999,
                                                    border: `1px solid ${on ? WK_RED : 'var(--border)'}`,
                                                    background: on ? WK_RED_SUBTLE : 'var(--surface-sunken)',
                                                    color: on ? WK_RED : 'var(--text-body)',
                                                }}>
                                                {e.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </WkModal>
            )}

            {/* ── Exercise form modal ── */}
            {exForm && (
                <WkModal open title={exForm.id ? 'Изменить упражнение' : 'Новое упражнение'} onClose={() => setExForm(null)}
                    footer={<>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExForm(null)}>Отмена</button>
                        <button className="btn btn-sm" style={{ background: WK_RED, borderColor: WK_RED, color: '#fff' }}
                            disabled={!exForm.name?.trim()}
                            onClick={() => saveExercise(exForm)}>
                            Сохранить
                        </button>
                    </>}>
                    <div className="form">
                        <div className="form-group">
                            <label className="form-label">Название</label>
                            <input className="input" placeholder="Например, Жим лёжа" value={exForm.name}
                                onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                    </div>
                </WkModal>
            )}
        </div>
    );
}
