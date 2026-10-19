import {useEffect, useState} from "react";
import {BookOpen, Clock, Flame, GraduationCap, Repeat, Target} from "lucide-react";
import {Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from "recharts";
import {getStats} from "../../api/languages/stats.ts";
import {formatMinutes, formatWeek, pluralLabel} from "../../utils/languages.ts";
import {StatTile} from "../StatTile.jsx";
import {ChartCard} from "../ChartCard.jsx";
import {ChartEmpty} from "../EmptyHint.jsx";

const PERIODS = [4, 12, 26];

const AXIS_TICK = { fontSize: 11, fill: 'var(--text-faint)' };
const TOOLTIP = {
    contentStyle: { background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 },
    labelStyle: { color: 'var(--text-strong)', fontWeight: 700, marginBottom: 2 },
    cursor: { fill: 'rgba(255,255,255,.04)' },
};
const weekLabel = (label) => `Неделя с ${label}`;

export function StatsSection({ languageId }) {
    const [weeks, setWeeks] = useState(12);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        getStats(languageId, weeks)
            .then(data => { if (!ignore) setStats(data); })
            .catch(err => console.error('[Stats] load failed:', err?.response?.status))
            .finally(() => { if (!ignore) setLoading(false); });

        return () => { ignore = true; };
    }, [languageId, weeks]);

    const pickWeeks = (n) => { setLoading(true); setWeeks(n); };

    if (!stats) return <div style={{ color: 'var(--text-muted)' }}>Загрузка…</div>;

    const chartWeeks = stats.weeks.map(w => ({
        ...w,
        label: formatWeek(w.week),
        accuracy: w.reviews ? Math.round(w.remembered * 100 / w.reviews) : null,   // null — столбика нет
    }));
    const hasWords = stats.weeks.some(w => w.words_added || w.words_learned);
    const empty = <ChartEmpty text="Нет данных за период" height={210} />;

    return (
        <>
            {/* 1. Период */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {PERIODS.map(n => (
                    <button key={n} className={'btn btn-sm ' + (weeks === n ? 'btn-primary' : 'btn-ghost')}
                            onClick={() => pickWeeks(n)}>
                        {n} {pluralLabel(n, ['неделя', 'недели', 'недель'])}
                    </button>
                ))}
            </div>

            <div style={{ opacity: loading ? 0.5 : 1 }}>
                {/* 2. Плитки */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <StatTile label="Слов" value={stats.total_words} icon={<BookOpen size={15} />} />
                    <StatTile label="Выучено" value={stats.learned_words} icon={<GraduationCap size={15} />}
                              hint={stats.total_words ? `${Math.round(stats.learned_words * 100 / stats.total_words)}% словаря` : null} />
                    <StatTile label="Сегодня" value={stats.due_today} unit="на повтор" icon={<Repeat size={15} />} />
                    <StatTile label="Точность" value={stats.period_accuracy ?? '—'} unit={stats.period_accuracy != null ? '%' : null}
                              hint={`${stats.period_reviews} ${pluralLabel(stats.period_reviews, ['ответ', 'ответа', 'ответов'])}`}
                              icon={<Target size={15} />} />
                    <StatTile label="Время" value={formatMinutes(stats.period_minutes)} icon={<Clock size={15} />}
                              hint={`за ${weeks} ${pluralLabel(weeks, ['неделю', 'недели', 'недель'])}`} />
                    <StatTile label="Серия" value={stats.streak_days} unit={pluralLabel(stats.streak_days, ['день', 'дня', 'дней'])}
                              icon={<Flame size={15} />} />
                </div>

                {/* 3. Графики */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 16 }}>
                    <ChartCard title="Слова по неделям">
                        {hasWords ? (
                            <BarChart data={chartWeeks} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
                                <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                                <Tooltip {...TOOLTIP} labelFormatter={weekLabel} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="words_added" name="Добавлено" fill="var(--brand-subtle-bd)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                <Bar dataKey="words_learned" name="Выучено" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                            </BarChart>
                        ) : empty}
                    </ChartCard>

                    <ChartCard title="Точность ответов" sub="доля «помню» за неделю">
                        {stats.period_reviews > 0 ? (
                            <BarChart data={chartWeeks} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
                                <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} unit="%" tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                                <Tooltip {...TOOLTIP} labelFormatter={weekLabel} formatter={v => (v == null ? '—' : `${v}%`)} />
                                <Bar dataKey="accuracy" name="Точность" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                            </BarChart>
                        ) : empty}
                    </ChartCard>

                    <ChartCard title="Минуты по неделям">
                        {stats.period_minutes > 0 ? (
                            <BarChart data={chartWeeks} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
                                <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} />
                                <Tooltip {...TOOLTIP} labelFormatter={weekLabel} formatter={v => formatMinutes(v)} />
                                <Bar dataKey="minutes" name="Время" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                            </BarChart>
                        ) : empty}
                    </ChartCard>

                    <ChartCard title="Минуты по типам">
                        {stats.minutes_by_type.length > 0 ? (
                            <BarChart data={stats.minutes_by_type} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                                <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="study_type" width={96} tick={{ fontSize: 12, fill: 'var(--text-body)' }}
                                       axisLine={false} tickLine={false} />
                                <Tooltip {...TOOLTIP} formatter={v => formatMinutes(v)} />
                                <Bar dataKey="minutes" name="Время" fill="var(--brand)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                            </BarChart>
                        ) : empty}
                    </ChartCard>
                </div>
            </div>
        </>
    );
}