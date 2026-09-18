import {useRef, useState} from "react";
import {fmtDate, fmtNum} from "../../utils/workouts.ts";
import {ChartEmpty} from "../EmptyHint.jsx";

export function VolumeChart({ series }) {
    const fmtShort = (iso) => { const [, m, d] = iso.split('-'); return `${Number(d)}.${m}`; };

    const [hover, setHover] = useState(null);
    const ref = useRef(null);
    const W = 760, H = 260, pad = { t: 20, r: 18, b: 34, l: 54 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

    if (!series?.length) return (
        <ChartEmpty text="Нет данных за выбранный период" height={180} />
    );

    const vals = series.map(d => d.value);
    const maxV = Math.max(...vals), minV = Math.min(...vals);
    const lo = Math.max(0, minV - (maxV - minV) * 0.35);
    const hi = maxV + (maxV - minV) * 0.18 || maxV * 1.1 || 1;
    const span = hi - lo || 1;
    const x = i => pad.l + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw);
    const y = v => pad.t + ih - ((v - lo) / span) * ih;
    const linePath = series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${x(series.length - 1).toFixed(1)},${(pad.t + ih).toFixed(1)} L ${x(0).toFixed(1)},${(pad.t + ih).toFixed(1)} Z`;
    const grid = Array.from({ length: 5 }, (_, i) => lo + (span * i) / 4);
    const everyN = Math.ceil(series.length / 7);
    const fmtTick = v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v));
    const hd = hover != null ? series[hover] : null;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}
            onMouseMove={e => {
                if (!ref.current) return;
                const r = ref.current.getBoundingClientRect();
                const px = ((e.clientX - r.left) / r.width) * W;
                let best = 0, bd = Infinity;
                series.forEach((_, i) => { const dd = Math.abs(x(i) - px); if (dd < bd) { bd = dd; best = i; } });
                setHover(best);
            }}
            onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', display: 'block', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="wkArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff3b4e" stopOpacity="0.42" />
                        <stop offset="60%" stopColor="#ff3b4e" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#ff3b4e" stopOpacity="0" />
                    </linearGradient>
                    <filter id="wkGlow" x="-20%" y="-40%" width="140%" height="180%">
                        <feGaussianBlur stdDeviation="3.4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                {grid.map((g, i) => (
                    <g key={i}>
                        <line x1={pad.l} y1={y(g)} x2={W - pad.r} y2={y(g)} stroke="rgba(255,90,105,0.10)" strokeWidth="1" />
                        <text x={pad.l - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="var(--text-faint)" fontFamily="JetBrains Mono, monospace">
                            {fmtTick(g)}
                        </text>
                    </g>
                ))}
                {series.map((d, i) => (i % everyN === 0 || i === series.length - 1) && (
                    <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="10.5" fill="var(--text-faint)" fontFamily="JetBrains Mono, monospace">
                        {fmtShort(d.date)}
                    </text>
                ))}
                <path d={areaPath} fill="url(#wkArea)" />
                <path d={linePath} fill="none" stroke="#ff3b4e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" filter="url(#wkGlow)" />
                {series.map((d, i) => (
                    <circle key={i} cx={x(i)} cy={y(d.value)} r={hover === i ? 5 : 2.6}
                        fill={hover === i ? '#fff' : '#ff3b4e'} stroke="#ff3b4e" strokeWidth={hover === i ? 2.5 : 0}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,59,78,0.8))' }} />
                ))}
                {hd && <line x1={x(hover)} y1={pad.t} x2={x(hover)} y2={pad.t + ih}
                    stroke="rgba(255,59,78,0.45)" strokeWidth="1" strokeDasharray="3 4" />}
            </svg>
            {hd && (
                <div style={{
                    position: 'absolute', top: 0, left: `${(x(hover) / W) * 100}%`,
                    transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10,
                    background: 'var(--surface-raised)', border: '1px solid rgba(255,59,78,0.36)',
                    borderRadius: 8, padding: '8px 12px', minWidth: 120,
                    boxShadow: '0 6px 18px rgba(0,0,0,.6)', whiteSpace: 'nowrap',
                }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{fmtDate(hd.date)}</div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>
                        {fmtNum(hd.value)}<span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}> кг</span>
                    </div>
                    {hd.quantity != null && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{hd.quantity} повт</div>}
                    {hd.name && !hd.quantity && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{hd.name}</div>}
                </div>
            )}
        </div>
    );
}