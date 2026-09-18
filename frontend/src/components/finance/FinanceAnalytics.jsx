import { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────
const TODAY      = new Date().toISOString().slice(0, 10);
const YEAR_START = `${new Date().getFullYear()}-01-01`;
const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAY_NAMES   = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const DOW_ORDER   = [1,2,3,4,5,6,0]; // Пн…Вс

const GRAN_OPTIONS = [
    { id: 'day',   label: 'Дни'    },
    { id: 'month', label: 'Месяцы' },
    { id: 'year',  label: 'Годы'   },
];
const CAT_COLORS = ['#3ee07a','#22c55e','#4ade80','#16a34a','#86efac','#15803d','#bbf7d0','#06b6d4','#0ea5e9','#6366f1'];
const EXP_COLORS = ['#ef4444','#f97316','#eab308','#f43f5e','#dc2626','#b45309','#ca8a04','#9f1239','#7c3aed','#0369a1'];

const fmt  = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtK = (n) => Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

// ── Data helpers ──────────────────────────────────────────────
function dateBucket(iso, gran) {
    if (!iso) return null;
    const [y, m] = iso.split('-');
    if (gran === 'year')  return y;
    if (gran === 'month') return `${y}-${m}`;
    return iso;
}
function bucketLabel(key, gran) {
    if (!key) return '?';
    if (gran === 'year') return key;
    if (gran === 'month') {
        const [y, m] = key.split('-');
        return `${MONTH_NAMES[Number(m) - 1]} ${y.slice(2)}`;
    }
    const [, m, d] = key.split('-');
    return `${d}.${m}`;
}

function filterByPeriod(transactions, dateFrom, dateTo) {
    return transactions.filter(t =>
        t.transaction_date && t.transaction_date >= dateFrom && t.transaction_date <= dateTo
    );
}

function calcTotals(transactions, dateFrom, dateTo) {
    const txs = filterByPeriod(transactions, dateFrom, dateTo);
    const income  = txs.filter(t =>  t.replenishment).reduce((s, t) => s + Number(t.amount), 0);
    const expense = txs.filter(t => !t.replenishment).reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense, count: txs.length };
}

function getPreviousPeriod(dateFrom, dateTo) {
    const from  = new Date(dateFrom + 'T00:00:00');
    const to    = new Date(dateTo   + 'T00:00:00');
    const diffMs = to - from;
    const prevTo   = new Date(from.getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - diffMs);
    return {
        from: prevFrom.toISOString().slice(0, 10),
        to:   prevTo.toISOString().slice(0, 10),
    };
}

function pctDelta(current, previous) {
    if (!previous) return null;
    return Math.round((current - previous) / previous * 100);
}

function buildTimeSeries(transactions, gran, dateFrom, dateTo) {
    const map = new Map();
    for (const tx of filterByPeriod(transactions, dateFrom, dateTo)) {
        const key = dateBucket(tx.transaction_date, gran);
        if (!key) continue;
        if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
        const b = map.get(key);
        if (tx.replenishment) b.income += Number(tx.amount);
        else b.expense += Number(tx.amount);
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => ({
            key, label: bucketLabel(key, gran),
            income:  Math.round(v.income),
            expense: Math.round(v.expense),
        }));
}

function buildRunningTotal(timeSeries) {
    let cum = 0;
    return timeSeries.map(p => {
        cum += p.income - p.expense;
        return { label: p.label, total: Math.round(cum) };
    });
}

function buildDayOfWeek(transactions, txType, dateFrom, dateTo) {
    const filtered = filterByPeriod(transactions, dateFrom, dateTo)
        .filter(t => txType === 'expense' ? !t.replenishment : t.replenishment);

    const daySum   = new Array(7).fill(0);
    const dayCount = new Array(7).fill(0);

    for (const tx of filtered) {
        const dow = new Date(tx.transaction_date + 'T00:00:00').getDay();
        daySum[dow]   += Number(tx.amount);
    }
    // count how many of each weekday fall in the period
    const from = new Date(dateFrom + 'T00:00:00');
    const to   = new Date(dateTo   + 'T00:00:00');
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        dayCount[d.getDay()]++;
    }

    return DOW_ORDER.map(dow => ({
        name:   DAY_NAMES[dow],
        amount: dayCount[dow] > 0 ? Math.round(daySum[dow] / dayCount[dow]) : 0,
    }));
}

function calcMonthlyAvg(transactions, dateFrom, dateTo) {
    const txs    = filterByPeriod(transactions, dateFrom, dateTo);
    const months = new Set(txs.map(t => t.transaction_date?.slice(0, 7)).filter(Boolean));
    const n      = Math.max(months.size, 1);
    const income  = txs.filter(t =>  t.replenishment).reduce((s, t) => s + Number(t.amount), 0);
    const expense = txs.filter(t => !t.replenishment).reduce((s, t) => s + Number(t.amount), 0);
    return { avgIncome: Math.round(income / n), avgExpense: Math.round(expense / n), months: n };
}

function findLargestTx(transactions, txType, dateFrom, dateTo, categoriesMap, accountsMap) {
    const filtered = filterByPeriod(transactions, dateFrom, dateTo)
        .filter(t => txType === 'expense' ? !t.replenishment : t.replenishment);
    if (!filtered.length) return null;
    const tx = filtered.reduce((m, t) => Number(t.amount) > Number(m.amount) ? t : m, filtered[0]);
    return {
        amount:   Number(tx.amount),
        date:     tx.transaction_date,
        category: categoriesMap[tx.category_id] ?? '—',
        account:  accountsMap[tx.account_id]    ?? '—',
        dest:     tx.destination ?? '',
    };
}

function buildGroupData(transactions, idMap, idField, txType, dateFrom, dateTo, excludeIds) {
    const filtered = filterByPeriod(transactions, dateFrom, dateTo)
        .filter(t => txType === 'expense' ? !t.replenishment : t.replenishment)
        .filter(t => !excludeIds?.has(t[idField]));
    const map = new Map();
    for (const tx of filtered) {
        const name = idMap[tx[idField]] ?? `#${tx[idField]}`;
        map.set(name, (map.get(name) ?? 0) + Number(tx.amount));
    }
    return [...map.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([name, amount]) => ({ name, amount: Math.round(amount) }));
}

// ── Small components ──────────────────────────────────────────
function Delta({ value, invertColor }) {
    if (value === null || value === undefined) return null;
    const isUp = value > 0;
    // for expenses: up is bad (red), down is good (green) — invertColor=true
    const color = invertColor
        ? (isUp ? '#ef4444' : '#3ee07a')
        : (isUp ? '#3ee07a' : '#ef4444');
    return (
        <span style={{ fontSize: 11, fontWeight: 700, color, marginLeft: 6 }}>
            {isUp ? '▲' : '▼'} {Math.abs(value)}%
        </span>
    );
}

function StatCard({ label, value, sub, color, delta, invertDelta, wide }) {
    return (
        <div style={{
            padding: '14px 16px', borderRadius: 10, gridColumn: wide ? 'span 2' : undefined,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 4,
        }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)' }}>
                {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: color ?? 'var(--text-strong)' }}>
                    {value}
                </span>
                {delta !== undefined && <Delta value={delta} invertColor={invertDelta} />}
            </div>
            {sub && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{sub}</div>}
        </div>
    );
}

// ── Tooltip components ────────────────────────────────────────
function LineTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 6px 18px rgba(0,0,0,.5)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6, fontSize: 13 }}>{label}</div>
            {payload.map(p => (
                <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>
                        {{ income: 'Доходы', expense: 'Расходы', total: 'Накоплено' }[p.dataKey]}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: p.color }}>
                        {fmt(p.value)} ₽
                    </span>
                </div>
            ))}
        </div>
    );
}

function BarTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const { name, amount } = payload[0].payload;
    return (
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 6px 18px rgba(0,0,0,.5)', fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>{name}</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: 'var(--brand)' }}>{fmt(amount)} ₽</div>
        </div>
    );
}

// ── BreakdownChart ────────────────────────────────────────────
function BreakdownChart({ title, data, type }) {
    const colors  = type === 'income' ? CAT_COLORS : EXP_COLORS;
    const barH    = Math.max(30, Math.min(46, 340 / Math.max(data.length, 1)));
    const chartH  = Math.max(160, data.length * barH + 40);
    const labelW  = Math.min(160, Math.max(60, ...data.map(d => d.name.length * 7 + 16)));

    if (!data.length) return (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 12 }}>{title}</div>
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Нет данных</div>
        </div>
    );

    return (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                {data.length} позиций · {fmt(data.reduce((s, d) => s + d.amount, 0))} ₽
            </div>
            <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: labelW }}>
                    <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={labelW} tick={{ fontSize: 12, fill: 'var(--text-body)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={34}
                        label={{ position: 'right', formatter: v => `${fmtK(v)} ₽`, fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                        {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────
export function FinanceAnalytics({ transactions, categories = [], categoriesMap, accountsMap }) {
    const [gran,     setGran    ] = useState('month');
    const [dateFrom, setDateFrom] = useState(YEAR_START);
    const [dateTo,   setDateTo  ] = useState(TODAY);
    const [txType,   setTxType  ] = useState('expense');

    // ── Computed ──
    const current  = useMemo(() => calcTotals(transactions, dateFrom, dateTo), [transactions, dateFrom, dateTo]);
    const prevPeriod = useMemo(() => getPreviousPeriod(dateFrom, dateTo), [dateFrom, dateTo]);
    const previous = useMemo(() => calcTotals(transactions, prevPeriod.from, prevPeriod.to), [transactions, prevPeriod]);

    const savRate  = current.income > 0 ? Math.round((current.income - current.expense) / current.income * 100) : null;
    const monthly  = useMemo(() => calcMonthlyAvg(transactions, dateFrom, dateTo), [transactions, dateFrom, dateTo]);
    const largest  = useMemo(() => findLargestTx(transactions, txType, dateFrom, dateTo, categoriesMap, accountsMap), [transactions, txType, dateFrom, dateTo, categoriesMap, accountsMap]);

    const timeSeries = useMemo(() => buildTimeSeries(transactions, gran, dateFrom, dateTo), [transactions, gran, dateFrom, dateTo]);
    const running    = useMemo(() => buildRunningTotal(timeSeries), [timeSeries]);
    const dowData    = useMemo(() => buildDayOfWeek(transactions, txType, dateFrom, dateTo), [transactions, txType, dateFrom, dateTo]);
    // IDs категорий с show_analytics=false — исключаем только из графика по категориям
    const hiddenCatIds = useMemo(
        () => new Set(categories.filter(c => !c.show_analytics).map(c => c.id)),
        [categories]
    );
    const catData = useMemo(
        () => buildGroupData(transactions, categoriesMap, 'category_id', txType, dateFrom, dateTo, hiddenCatIds),
        [transactions, categoriesMap, txType, dateFrom, dateTo, hiddenCatIds]
    );
    const accData = useMemo(
        () => buildGroupData(transactions, accountsMap, 'account_id', txType, dateFrom, dateTo),
        [transactions, accountsMap, txType, dateFrom, dateTo]
    );

    const typeLabel = txType === 'expense' ? 'расходам' : 'доходам';

    const fmtDate = (iso) => { const [y,m,d] = iso.split('-'); return `${d}.${m}.${y}`; };

    return (
        <div>
            {/* ── Управление периодом ── */}
            <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Период анализа</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <input type="date" className="input" style={{ fontSize: 12, width: 140 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>—</span>
                    <input type="date" className="input" style={{ fontSize: 12, width: 140 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                    сравнение с {fmtDate(prevPeriod.from)} — {fmtDate(prevPeriod.to)}
                </div>
            </div>

            {/* ── Стат-карточки ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                <StatCard
                    label="Доходы"
                    value={`+${fmt(current.income)} ₽`}
                    color="#3ee07a"
                    delta={pctDelta(current.income, previous.income)}
                    sub={`пред. период: ${fmt(previous.income)} ₽`}
                />
                <StatCard
                    label="Расходы"
                    value={`−${fmt(current.expense)} ₽`}
                    color="#ef4444"
                    delta={pctDelta(current.expense, previous.expense)}
                    invertDelta
                    sub={`пред. период: ${fmt(previous.expense)} ₽`}
                />
                <StatCard
                    label="Баланс"
                    value={`${current.balance >= 0 ? '+' : '−'}${fmt(Math.abs(current.balance))} ₽`}
                    color={current.balance >= 0 ? '#3ee07a' : '#ef4444'}
                    delta={pctDelta(current.balance, previous.balance)}
                    sub={`${current.count} операций`}
                />
                <StatCard
                    label="Норма сбережений"
                    value={savRate !== null ? `${savRate}%` : '—'}
                    color={savRate === null ? 'var(--text-muted)' : savRate >= 20 ? '#3ee07a' : savRate >= 0 ? '#eab308' : '#ef4444'}
                    sub={savRate !== null ? (savRate >= 20 ? 'отлично' : savRate >= 0 ? 'умеренно' : 'расходы > доходов') : 'нет данных'}
                />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard
                    label="Ср. доход / мес"
                    value={`${fmt(monthly.avgIncome)} ₽`}
                    color="#3ee07a"
                    sub={`за ${monthly.months} мес.`}
                />
                <StatCard
                    label="Ср. расход / мес"
                    value={`${fmt(monthly.avgExpense)} ₽`}
                    color="#ef4444"
                    sub={`за ${monthly.months} мес.`}
                />
                {largest ? (
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Макс. {txType === 'expense' ? 'трата' : 'поступление'}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: txType === 'expense' ? '#ef4444' : '#3ee07a' }}>
                            {fmt(largest.amount)} ₽
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>
                            {largest.category}{largest.dest ? ` · ${largest.dest}` : ''} · {fmtDate(largest.date)}
                        </div>
                    </div>
                ) : (
                    <StatCard label={`Макс. ${txType === 'expense' ? 'трата' : 'поступление'}`} value="—" sub="нет данных" />
                )}
            </div>

            {/* ── Линейный график: Доходы + Расходы ── */}
            <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>Динамика доходов и расходов</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeSeries.length} точек данных</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                        {GRAN_OPTIONS.map(g => (
                            <button key={g.id} onClick={() => setGran(g.id)} style={{
                                padding: '4px 11px', borderRadius: 6, border: '1px solid var(--border)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                background:  gran === g.id ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                                color:       gran === g.id ? 'var(--brand)'        : 'var(--text-muted)',
                                borderColor: gran === g.id ? 'var(--brand-subtle-bd)' : 'var(--border)',
                            }}>{g.label}</button>
                        ))}
                    </div>
                </div>
                {timeSeries.length === 0 ? (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Нет транзакций за период</div>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={timeSeries} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} width={46} />
                            <Tooltip content={<LineTooltip />} />
                            <Line type="monotone" dataKey="income"  stroke="#3ee07a" strokeWidth={2.2} dot={false} activeDot={{ r: 4, fill: '#3ee07a', stroke: '#fff', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.2} dot={false} activeDot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
                <div style={{ display: 'flex', gap: 18, marginTop: 10, justifyContent: 'center' }}>
                    {[['Доходы','#3ee07a'],['Расходы','#ef4444']].map(([l,c]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span style={{ width: 20, height: 2.5, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Накопительный баланс ── */}
            <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>Накопительный баланс</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    Нарастающий итог (доходы − расходы) за период
                </div>
                {running.length === 0 ? (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Нет данных</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={running} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} width={52} />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 3" />
                            <Tooltip content={<LineTooltip />} />
                            <Line type="monotone" dataKey="total" stroke="var(--brand)" strokeWidth={2.4} dot={false}
                                activeDot={{ r: 4, fill: 'var(--brand)', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Паттерн по дням недели ── */}
            <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>Паттерн по дням недели</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Средняя сумма {txType === 'expense' ? 'расходов' : 'доходов'} по дням</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                        {[['expense','Расходы'],['income','Доходы']].map(([id, label]) => (
                            <button key={id} onClick={() => setTxType(id)} style={{
                                padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                background:  txType === id ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                                color:       txType === id ? 'var(--brand)'        : 'var(--text-muted)',
                                borderColor: txType === id ? 'var(--brand-subtle-bd)' : 'var(--border)',
                            }}>{label}</button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={dowData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-body)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'JetBrains Mono,monospace' }} axisLine={false} tickLine={false} width={44} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                            {dowData.map((d, i) => {
                                const max = Math.max(...dowData.map(x => x.amount));
                                const isMax = d.amount === max && max > 0;
                                const base  = txType === 'expense' ? '#ef4444' : '#3ee07a';
                                const faded = txType === 'expense' ? 'rgba(239,68,68,0.35)' : 'rgba(62,224,122,0.35)';
                                return <Cell key={i} fill={isMax ? base : faded} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
                    Ярким цветом выделен день с максимальными {txType === 'expense' ? 'расходами' : 'доходами'}
                </div>
            </div>

            {/* ── Разбивка по категориям и счетам ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>
                    Разбивка по {typeLabel}
                </div>
            </div>
            <BreakdownChart title={`${txType === 'expense' ? 'Расходы' : 'Доходы'} по категориям`} data={catData} type={txType} />
            <BreakdownChart title={`${txType === 'expense' ? 'Расходы' : 'Доходы'} по счетам`}     data={accData} type={txType} />
        </div>
    );
}