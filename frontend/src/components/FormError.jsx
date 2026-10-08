// Ошибка с бэка внутри формы — тот же вид, что на странице входа
export function FormError({ children }) {
    if (!children) return null;
    return (
        <div style={{
            fontSize: 13, color: 'var(--expense)',
            background: 'var(--expense-subtle)',
            border: '1px solid rgba(255,107,107,.25)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px',
        }}>
            {children}
        </div>
    );
}
