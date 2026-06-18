import { useNavigate } from 'react-router-dom';

const sections = [
    { title: 'Финансы', description: 'Транзакции, счета и категории', path: '/finance' },
];

export default function StartPage() {
    const navigate = useNavigate();

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
                {sections.map((section) => (
                    <div
                        key={section.path}
                        className="card module-card"
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
