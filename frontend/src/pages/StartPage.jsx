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
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1 style={{ margin: 0 }}>Self Monitoring</h1>
                <button onClick={handleLogout} style={logoutStyle}>Выйти</button>
            </div>

            <div style={gridStyle}>
                {sections.map((section) => (
                    <div
                        key={section.path}
                        style={cardStyle}
                        onClick={() => navigate(section.path)}
                    >
                        <h2 style={{ margin: '0 0 8px' }}>{section.title}</h2>
                        <p style={{ margin: 0, color: '#666' }}>{section.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const pageStyle = {
    padding: '32px',
    maxWidth: '960px',
    margin: '0 auto',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
};

const cardStyle = {
    padding: '24px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
};

const logoutStyle = {
    padding: '8px 16px',
    cursor: 'pointer',
    borderRadius: '6px',
    border: '1px solid #ccc',
};
