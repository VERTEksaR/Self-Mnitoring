import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getUsers } from '../api/auth';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await loginUser({ email, password });
            localStorage.setItem('access_token', res.data.access_token);

            // Получаем user_id — он нужен при создании транзакций, категорий и счетов.
            // nickname передаём пустой строкой, т.к. UserFilter на бэке требует это поле.
            try {
                const usersRes = await getUsers({ email, nickname: '' });
                const user = usersRes.data.items?.[0];
                if (user) {
                    localStorage.setItem('user_id', user.id);
                }
            } catch {
                // user_id не получили, но это не блокирует вход
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка входа');
        }
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2>Вход</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Войти</button>
            </form>
        </div>
    );
}

const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '32px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    minWidth: '300px',
};

const inputStyle = {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
};

const buttonStyle = {
    padding: '10px',
    cursor: 'pointer',
};
