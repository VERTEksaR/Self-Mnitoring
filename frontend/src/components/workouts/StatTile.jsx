export function StatTile({ label, value, unit, hint, icon, accent }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 10, padding: 18,
            background: accent ? '#ff3b4e' : 'var(--surface-card)',
            border: `1px solid ${accent ? '#ff3b4e' : 'var(--border)'}`,
            borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.5)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: accent ? 'rgba(255,255,255,.7)' : 'var(--text-muted)' }}>
                    {label}
                </span>
                <span style={{ display: 'inline-flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: accent ? 'rgba(255,255,255,.18)' : 'rgba(255,59,78,.14)', color: accent ? '#fff' : '#ff3b4e' }}>
                    {icon}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 26, color: accent ? '#fff' : 'var(--text-strong)' }}>
                    {value}
                </span>
                {unit && <span style={{ fontSize: 13, fontWeight: 600, color: accent ? 'rgba(255,255,255,.7)' : 'var(--text-muted)' }}>{unit}</span>}
            </div>
            {hint && <span style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,.6)' : 'var(--text-faint)' }}>{hint}</span>}
        </div>
    );
}