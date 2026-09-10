export function EmptyHint(title, hint, action, onAction) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '28px 20px', textAlign: 'center',
        }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>{hint}</div>
            {action && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }} onClick={onAction}>
                    {action}
                </button>
            )}
        </div>
    );
}