import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = [
    '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

const PIE_HEIGHT = 210;
const LEGEND_ITEM_HEIGHT = 20;

export function CategoryPieChart({ data, onClickCategory }) {
    if (!data || data.length === 0) {
        return <p>Нет данных для диаграмм</p>;
    }

    // Высота растёт под все категории — скролл не нужен
    const legendHeight = data.length * LEGEND_ITEM_HEIGHT;
    const chartHeight = PIE_HEIGHT + legendHeight;

    return (
        <PieChart width={300} height={chartHeight}>
            <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy={PIE_HEIGHT / 2}
                outerRadius={85}
                label={false}
                onClick={(e) => onClickCategory?.(e.category)}
            >
                {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString('ru-RU')} />
            <Legend
                layout="vertical"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: '12px' }}
            />
        </PieChart>
    );
}