import {isValidElement} from "react";
import {ResponsiveContainer} from "recharts";
import {ChartEmpty} from "./EmptyHint.jsx";

export function ChartCard({ title, sub, children, height }) {
    // Recharts 3 кладёт содержимое ResponsiveContainer в div шириной 0: заглушка «Нет данных» сжалась бы в столбик
    const isEmpty = isValidElement(children) && children.type === ChartEmpty;

    return (
        <div className="card" style={{ padding: '18px 20px', minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: sub ? 2 : 14 }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{sub}</div>}
            {isEmpty ? children : <ResponsiveContainer width="100%" height={height ?? 210}>{children}</ResponsiveContainer>}
        </div>
    );
}