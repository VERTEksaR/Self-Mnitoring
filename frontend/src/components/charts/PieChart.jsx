import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3ee07a', '#2bc566', '#7ef0a6', '#1f9e55', '#ffd166', '#5cea90', '#b6ffd2', '#0d7a3a', '#a8f0c0', '#5e6b61'];

const PIE_HEIGHT = 210;
const LEGEND_ITEM_HEIGHT = 20;

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
                {Number(payload[0].value).toLocaleString('ru-RU')} ₽
            </span>
        </div>
    );
};

export function CategoryPieChart({ data, onClickCategory }) {
    if (!data || data.length === 0) {
        return <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Нет данных для диаграммы</p>;
    }

    const legendHeight = data.length * LEGEND_ITEM_HEIGHT;
    const chartHeight = PIE_HEIGHT + legendHeight;

    return (
        <PieChart width={268} height={chartHeight}>
            <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy={PIE_HEIGHT / 2}
                outerRadius={85}
                label={false}
                onClick={(e) => onClickCategory?.(e.category)}
                strokeWidth={0}
            >
                {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip content={<TooltipContent />} />
            <Legend
                layout="vertical"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#8a978c' }}
            />
        </PieChart>
    );
}
