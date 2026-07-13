import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getUsers } from '../api/auth';

function extractErrorMessage(err, fallback) {
    const detail = err.response?.data?.detail;
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail
            .map(d => {
                const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null;
                return field ? `${field}: ${d.msg}` : d.msg;
            })
            .filter(Boolean)
            .join('; ') || fallback;
    }
    return fallback;
}

export default function LoginPage() {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const saveUser = async (email) => {
        try {
            const res = await getUsers({ email, nickname: '' });
            const user = res.data.items?.[0];
            if (user) localStorage.setItem('user_id', user.id);
        } catch { /* не критично */ }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await loginUser({ email, password });
            localStorage.setItem('access_token', res.data.access_token);
            await saveUser(email);
            navigate('/');
        } catch (err) {
            setError(extractErrorMessage(err, 'Ошибка входа'));
        } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await registerUser({ email, password, nickname, is_admin: false });
            const res = await loginUser({ email, password });
            localStorage.setItem('access_token', res.data.access_token);
            await saveUser(email);
            navigate('/');
        } catch (err) {
            setError(extractErrorMessage(err, 'Ошибка регистрации'));
        } finally { setLoading(false); }
    };

    const switchMode = (m) => { setMode(m); setError(''); setEmail(''); setPassword(''); setNickname(''); };
    const isLogin = mode === 'login';

    return (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
            <div style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-overlay)',
                backdropFilter: 'blur(20px)',
                padding: '36px 32px',
                width: 360, maxWidth: '95vw',
                display: 'flex', flexDirection: 'column', gap: 20,
            }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)', marginBottom: 4 }}>
                        Сам-Мониторинг
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
                    </div>
                </div>

                {error && (
                    <div style={{
                        fontSize: 13, color: 'var(--expense)',
                        background: 'var(--expense-subtle)',
                        border: '1px solid rgba(255,107,107,.25)',
                        borderRadius: 'var(--radius-sm)', padding: '8px 12px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display:'flex', flexDirection:'column', gap: 10 }}>
                    {!isLogin && (
                        <input
                            className="input"
                            type="text"
                            placeholder="Имя пользователя"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            required
                        />
                    )}
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        style={{ marginTop: 4 }}
                    >
                        {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div style={{ display:'flex', alignItems:'center', gap: 6, justifyContent:'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    </span>
                    <button
                        onClick={() => switchMode(isLogin ? 'register' : 'login')}
                        style={{ fontSize:13, color:'var(--text-link)', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit' }}
                    >
                        {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
}
