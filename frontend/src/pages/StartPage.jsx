import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sections = [
    { title: 'Финансы', description: 'Транзакции, счета и категории', path: '/finance', accent: '#3ee07a' },
    { title: 'Тренировки', description: 'Журнал тренировок и упражнения', path: '/workouts', accent: '#ff3b4e' },
];

export default function StartPage() {
    const navigate = useNavigate();
    const [hov, setHov] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    return (
        <div className="start-page">
            <div className="start-nav">
                <span className="start-brand">Сам-Мониторинг</span>
                <button className="btn btn-secondary" onClick={handleLogout}>Выйти</button>
            </div>

            <div className="module-grid">
                {sections.map((section, i) => (
                    <div
                        key={section.path}
                        className="card module-card"
                        onMouseEnter={() => setHov(i)}
                        onMouseLeave={() => setHov(null)}
                        style={hov === i ? {
                            borderColor: section.accent + '55',
                            boxShadow: `0 6px 20px ${section.accent}22`,
                        } : {}}
                        onClick={() => navigate(section.path)}
                    >
                        <div className="module-card__title">{section.title}</div>
                        <div className="module-card__desc">{section.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
