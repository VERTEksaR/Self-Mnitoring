import { PieChart, Pie, Cell, Tooltip, Label } from 'recharts';

const COLORS = ['#3ee07a', '#2bc566', '#7ef0a6', '#ffd166', '#5e6b61',
                 '#5cea90', '#b6ffd2', '#1f9e55', '#a8f0c0', '#0d7a3a'];

const fmt = (n) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const TooltipContent = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#15181a',
            border: '1px solid rgba(120,200,150,.2)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            color: '#bcc9bf',
        }}>
            <span style={{ color: '#eafff1', fontWeight: 600 }}>{payload[0].name}</span>
            <br />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#3ee07a' }}>
                {fmt(payload[0].value)} ₽
            </span>
        </div>
    );
};

const DonutCenter = ({ viewBox, total }) => {
    const { cx, cy } = viewBox;
    return (
        <>
            <text x={cx} y={cy - 7} textAnchor="middle"
                fill="var(--text-faint)" fontSize={9} fontWeight={700}
                letterSpacing="0.07em" fontFamily="Manrope, system-ui, sans-serif">
                ВСЕГО
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle"
                fill="var(--text-strong)" fontSize={15} fontWeight={700}
                fontFamily="JetBrains Mono, monospace">
                {fmt(total)} ₽
            </text>
        </>
    );
};

export function CategoryPieChart({ data, onClickCategory }) {
    if (!data || data.length === 0) {
        return (
            <div className="empty">
                <span className="empty__title">Нет данных</span>
                <span className="empty__hint">Добавьте транзакции, чтобы увидеть диаграмму</span>
            </div>
        );
    }

    const total = data.reduce((s, d) => s + d.total, 0);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart width={200} height={200}>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={56}
                        strokeWidth={0}
                        onClick={(e) => onClickCategory?.(e.category)}
                        style={{ cursor: 'pointer' }}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                        <Label content={<DonutCenter total={total} />} position="center" />
                    </Pie>
                    <Tooltip content={<TooltipContent />} />
                </PieChart>
            </div>

            <div className="chart-legend">
                {data.map((item, i) => (
                    <div
                        key={item.category}
                        className="chart-legend__item"
                        onClick={() => onClickCategory?.(item.category)}
                    >
                        <span className="chart-legend__swatch" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="chart-legend__name">{item.category}</span>
                        <span className="chart-legend__val">{fmt(item.total)} ₽</span>
                    </div>
                ))}
            </div>
        </div>
    );
}