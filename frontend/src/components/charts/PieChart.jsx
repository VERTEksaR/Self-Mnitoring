import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = [
    '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

export function CategoryPieChart({ data, onClickCategory }) {
    if (!data || data.length === 0) {
        return <p>Нет данных для диаграмм</p>;
    }

    return (
        <PieChart width={300} height={320}>
            <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="45%"
                outerRadius={100}
                // label показывает название категории, не числовое значение
                label={({ name }) => name}
                labelLine={true}
                onClick={(e) => onClickCategory?.(e.category)}
            >
                {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString('ru-RU')} />
        </PieChart>
    );
}