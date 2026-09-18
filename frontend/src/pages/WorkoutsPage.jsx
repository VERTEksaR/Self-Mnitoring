import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Dumbbell, TrendingUp,
    ChevronLeft,
    Home, Wallet, Gamepad2,
} from 'lucide-react';
import {
    getExercises, createExercise, updateExercise, deleteExercise,
} from '../api/trainings/exercises';
import {
    getTrainings, getTraining, createTraining, updateTraining, deleteTraining,
    createTrainingExercise, updateTrainingExercise, deleteTrainingExercise,
} from '../api/trainings/trainings';
import {fmtDate, TODAY, WK_RED_SUBTLE} from "../utils/workouts.ts";
import {WkModal} from "../components/workouts/WorkoutModal.jsx";
import {AnalyticsSection} from "../components/workouts/AnalyticSection.jsx";
import {OverviewSection} from "../components/workouts/OverviewSection.jsx";
import {ExerciseProfileSection} from "../components/workouts/ExerciseSection.jsx";
import {WorkoutModals} from "../components/workouts/WorkoutModals.jsx";

const WK_RED        = '#ff3b4e';

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
    const [selectedExId, setSelectedExId] = useState(null);
    const [exProfileId, setExProfileId] = useState(null);
    const [exSearch, setExSearch] = useState('');

    useEffect(() => {
        document.body.classList.add('wk-body');
        return () => document.body.classList.remove('wk-body');
    }, []);

    useEffect(() => {
        Promise.all([
            getExercises({ size: 500 }),
            getTrainings({ size: 500 }),
        ]).then(([exRes, trRes]) => {
            setExercises(exRes.items ?? []);
            setTrainings(trRes.items ?? []);
        }).finally(() => setLoading(false));
    }, []);

    const inPeriod = t => t.date >= range.from && t.date <= range.to;
    const periodTrainings = trainings.filter(inPeriod).sort((a, b) => b.date.localeCompare(a.date));

    const allTEs = periodTrainings.flatMap(t => t.training_exercises ?? []);
    const totalReps = allTEs.reduce((s, te) => s + (te.quantity || 0), 0);

    const activeExId = selectedExId ?? (exercises[0]?.id ?? null);
    const progressSeries = [...trainings]
        .filter(t => t.date >= range.from && t.date <= range.to)
        .flatMap(t =>
            (t.training_exercises ?? [])
                .filter(te => te.exercise_id === activeExId && te.weight != null)
                .map(te => ({ date: t.date, value: Number(te.weight), quantity: te.quantity }))
        )
        .sort((a, b) => a.date.localeCompare(b.date));

    // ── Exercise CRUD ──
    async function saveExercise(form) {
        const payload = { name: form.name, muscle_group: form.muscle_group, exercise_type: form.exercise_type };
        if (form.id) {
            const res = await updateExercise(form.id, payload);
            setExercises(p => p.map(e => e.id === form.id ? res : e));
        } else {
            const res = await createExercise(payload);
            setExercises(p => [res, ...p]);
        }
        setExForm(null);
    }
    async function removeExercise(id) {
        await deleteExercise(id);
        setExercises(p => p.filter(e => e.id !== id));
    }

    // ── Training CRUD ──
    async function saveTraining(form) {
        // Step 1: create or update training itself
        let trainingId;
        if (form.id) {
            await updateTraining(form.id, { name: form.name, date: form.date });
            trainingId = form.id;
        } else {
            const res = await createTraining({ name: form.name, date: form.date });
            trainingId = res.id;
        }

        // Step 2: reconcile training_exercises
        const oldTEs = form.id
            ? (trainings.find(t => t.id === form.id)?.training_exercises ?? [])
            : [];
        const newEntries = form.exercises; // [{exercise_id, quantity, weight}]

        const oldMap = new Map(oldTEs.map(te => [te.exercise_id, te]));
        const newMap = new Map(newEntries.map(e => [e.exercise_id, e]));

        await Promise.all([
            // delete removed
            ...[...oldMap.keys()].filter(id => !newMap.has(id))
                .map(id => deleteTrainingExercise(id, trainingId)),
            // add new
            ...newEntries.filter(e => !oldMap.has(e.exercise_id))
                .map(e => createTrainingExercise({
                    training_id: trainingId,
                    exercise_id: e.exercise_id,
                    quantity: Number(e.quantity) || null,
                    weight: Number(e.weight) || null,
                })),
            // update changed
            ...newEntries.filter(e => {
                const old = oldMap.get(e.exercise_id);
                return old && (old.quantity !== Number(e.quantity) || Number(old.weight) !== Number(e.weight));
            }).map(e => updateTrainingExercise(e.exercise_id, trainingId, {
                quantity: Number(e.quantity) || null,
                weight: Number(e.weight) || null,
            })),
        ]);

        // Step 3: refresh from server
        const refreshed = await getTraining(trainingId);
        if (form.id) {
            setTrainings(p => p.map(t => t.id === trainingId ? refreshed : t));
        } else {
            setTrainings(p => [refreshed, ...p]);
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
        { id: 'overview',   label: 'Обзор',       icon: <LayoutDashboard size={18} /> },
        { id: 'exercises',  label: 'Упражнения',  icon: <Dumbbell size={18} /> },
        { id: 'analytics',  label: 'Аналитика',   icon: <TrendingUp size={18} /> },
    ];


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
                    <button className="finance-module-nav__btn finance-module-nav__btn--steam" onClick={() => navigate('/steam')} title="Steam">
                        <Gamepad2 size={18} />
                        <span>Steam</span>
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

                {/* ── Обзор ── */}
                {activeNav === 'overview' && (
                    <OverviewSection setTrainForm={setTrainForm} periodTrainings={periodTrainings}
                    totalReps={totalReps} progressSeries={progressSeries} setRange={setRange}
                    activeExId={activeExId} setSelectedExId={setSelectedExId} exercises={exercises}
                    setDetailTraining={setDetailTraining} setExForm={setExForm} removeExercise={removeExercise}
                    range={range}/>
                )}

                {/* ── Упражнения ── */}
                {activeNav === 'exercises' && (
                    <ExerciseProfileSection
                        exercises={exercises}
                        trainings={trainings}
                        exProfileId={exProfileId}
                        setExProfileId={setExProfileId}
                        exSearch={exSearch}
                        setExSearch={setExSearch}
                        setExForm={setExForm}
                        removeExercise={removeExercise}
                    />
                )}

                {/* ── Аналитика ── */}
                {activeNav === 'analytics' && (
                    <AnalyticsSection trainings={trainings} exercises={exercises} />
                )}

                </main>
            </div>

            <WorkoutModals
                detailTraining={detailTraining} setDetailTraining={setDetailTraining}
                trainForm={trainForm} setTrainForm={setTrainForm}
                exForm={exForm} setExForm={setExForm}
                removeTraining={removeTraining} saveTraining={saveTraining}
                exercises={exercises} saveExercise={saveExercise}
            />
        </div>
    );
}
