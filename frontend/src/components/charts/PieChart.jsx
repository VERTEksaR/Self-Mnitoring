import React from 'react';
import { PieChart, Pie } from 'recharts';


export function CategoryPieChart({ data, onClickCategory }) {
    if (!data || data.length === 0) {
        return (
            <p>Нет данных для диаграмм</p>
        )
    };
    console.log(data)

    return (
        <PieChart width={300} height={300}>
            <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
                onClick={(e) => {
                    if (onClickCategory) {
                        onClickCategory(e.category)
                    }
                }}
            />
        </PieChart>
    )
}