import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModules } from '../hooks/useModules';

const sections = [
    { title: 'Финансы',    description: 'Транзакции, счета и категории',     path: '/finance',  accent: '#3ee07a', module: 'finances' },
    { title: 'Тренировки', description: 'Журнал тренировок и упражнения',    path: '/workouts', accent: '#ff3b4e', module: 'trainings' },
    { title: 'Steam',      description: 'Активность и статистика из Steam',  path: '/steam',    accent: '#8b5cf6', module: 'achievements' },
];

export default function StartPage() {
    const navigate = useNavigate();
    const [hov, setHov] = useState(null);
    const { modules, loading } = useModules();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    const visibleSections = loading ? [] : sections.filter(s => modules.has(s.module));

    return (
        <div className="start-page">
            <div className="start-nav">
                <span className="start-brand">Сам-Мониторинг</span>
                <button className="btn btn-secondary" onClick={handleLogout}>Выйти</button>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Загрузка...</div>
            ) : visibleSections.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Вам пока не назначено ни одного раздела — обратитесь к администратору.
                </div>
            ) : (
                <div className="module-grid">
                    {visibleSections.map((section, i) => (
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
            )}
        </div>
    );
}
