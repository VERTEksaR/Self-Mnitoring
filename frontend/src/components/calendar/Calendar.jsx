import { useState } from 'react';

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const fmtShort = (d) =>
    d ? d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }).replace('.', '') : null;

const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

export function DateRangeCalendar({ draftRange, onChange }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const from = draftRange?.from ?? null;
    const to   = draftRange?.to   ?? null;

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    const handleClick = (day) => {
        if (!from || (from && to)) {
            onChange({ from: day, to: undefined });
        } else if (day < from) {
            onChange({ from: day, to: from });
        } else {
            onChange({ from, to: day });
        }
    };

    const firstDow  = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysCount = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysCount; d++) cells.push(new Date(year, month, d));

    return (
        <div>
            {/* Range inputs */}
            <div style={{ display: 'flex', gap: 8 }}>
                <div className="input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    color: from ? 'var(--text-strong)' : 'var(--text-faint)', cursor: 'default' }}>
                    {fmtShort(from) ?? 'Начало'}
                </div>
                <div className="input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    color: to ? 'var(--text-strong)' : 'var(--text-faint)', cursor: 'default' }}>
                    {fmtShort(to) ?? 'Конец'}
                </div>
            </div>

            {/* Month navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0 6px' }}>
                <button className="btn btn-ghost btn-icon" style={{ padding: '2px 6px', fontSize: 16, lineHeight: 1 }} onClick={prevMonth}>‹</button>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                    {MONTHS[month]} {year}
                </span>
                <button className="btn btn-ghost btn-icon" style={{ padding: '2px 6px', fontSize: 16, lineHeight: 1 }} onClick={nextMonth}>›</button>
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3,
                fontSize: 11, textAlign: 'center' }}>
                {WEEKDAYS.map(d => (
                    <span key={d} style={{ color: 'var(--text-faint)', paddingBottom: 4 }}>{d}</span>
                ))}
                {cells.map((day, i) => {
                    if (!day) return <span key={`e${i}`} />;
                    const isSel = sameDay(day, from) || sameDay(day, to);
                    const inRange = from && to && day > from && day < to;
                    return (
                        <span
                            key={day.getDate()}
                            onClick={() => handleClick(day)}
                            className={isSel ? 'cal-sel' : inRange ? 'cal-r' : 'cal-day'}
                        >
                            {day.getDate()}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}