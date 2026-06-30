import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './steam.css';

// ── icons ──
const Ico = ({ s = 18, children }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const ArrowLeft    = () => <Ico s={15}><path d="m15 18-6-6 6-6" /></Ico>;
const HomeIcon     = () => <Ico><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Ico>;
const WalletIcon   = () => <Ico><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></Ico>;
const DumbbellIcon = () => <Ico><path d="M14.4 14.4 9.6 9.6" /><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" /><path d="m21.5 21.5-1.4-1.4" /><path d="M3.9 3.9 2.5 2.5" /><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829 2 2 0 1 1 2.828 2.829l1.767-1.768a2 2 0 1 1 2.829 2.829z" /></Ico>;
const SteamIcon    = () => <Ico><line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></Ico>;
const UserIcon     = () => <Ico><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Ico>;
const NewsIcon     = () => <Ico><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" /></Ico>;
const TrophyIcon   = () => <Ico><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></Ico>;
const WrenchIcon   = () => <Ico><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Ico>;

// ── "В разработке" заглушка ──
function WIP({ label }) {
    return (
        <div className="card empty" style={{ minHeight: 320 }}>
            <div className="empty__icon" style={{ width: 52, height: 52, color: 'var(--brand)' }}>
                <WrenchIcon />
            </div>
            <div className="empty__title" style={{ color: 'var(--text-strong)', fontSize: 16 }}>В разработке</div>
            <div className="empty__hint" style={{ maxWidth: 280 }}>
                Раздел «{label}» будет доступен после подключения Steam API на бэкенде.
            </div>
        </div>
    );
}

// ── SECTIONS config ──
const SECTIONS = [
    { id: 'profile',      label: 'Профиль',    icon: <UserIcon /> },
    { id: 'news',         label: 'Новости',     icon: <NewsIcon /> },
    { id: 'achievements', label: 'Достижения',  icon: <TrophyIcon /> },
];

// ── PAGE ──
export default function SteamPage() {
    const navigate = useNavigate();
    const [active, setActive] = useState('profile');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    const activeLabel = SECTIONS.find(s => s.id === active)?.label ?? '';

    return (
        <div className="steam-theme finance-page">
            {/* top nav */}
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} aria-label="Назад"><ArrowLeft /></button>
                    <span className="finance-nav-brand" style={{ color: 'var(--brand)' }}>
                        <SteamIcon /><span>Steam</span>
                    </span>
                </div>
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Выйти</button>
                </div>
            </nav>

            <div className="finance-body">
                {/* module quick-nav */}
                <nav className="finance-module-nav">
                    <span className="finance-module-nav__label">Модули</span>
                    <button className="finance-module-nav__btn finance-module-nav__btn--home" onClick={() => navigate('/')} title="Главная">
                        <HomeIcon /><span>Главная</span>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--finance" onClick={() => navigate('/finance')} title="Финансы">
                        <WalletIcon /><span>Фин.</span>
                    </button>
                    <button className="finance-module-nav__btn finance-module-nav__btn--workouts" onClick={() => navigate('/workouts')} title="Тренировки">
                        <DumbbellIcon /><span>Трен.</span>
                    </button>
                </nav>

                {/* section sidebar */}
                <aside className="steam-section-sidebar">
                    <div className="steam-section-sidebar__label">Steam</div>
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            className={'steam-section-btn' + (s.id === active ? ' steam-section-btn--active' : '')}
                            onClick={() => setActive(s.id)}
                        >
                            {s.icon}<span>{s.label}</span>
                        </button>
                    ))}
                </aside>

                {/* main content */}
                <main className="finance-main">
                    <WIP label={activeLabel} />
                </main>
            </div>
        </div>
    );
}

/*
// ── mock data (раскомментировать после подключения Steam API) ──
const STEAM_PROFILE = {
    name: 'verdant_owl',
    steamId: '76561198044257390',
    createdYear: 2013,
    online: true,
};
const STEAM_STATS = {
    gamesOwned: 214,
    playtimeHours: 3187,
    gamesWithAchievements: 96,
    completionRate: 71,
};
const GAMES = [
    { id: 'g1', name: 'Stellar Drift', tint: '#3b2f6e', last: '2026-06-29', hrs: 412, hrs2w: 11.4, ach: 38, achTotal: 51, icon: '#5b4bb8',
      news: [
        { t: 'Patch 2.4 — Orbital Refit', d: '2026-06-27', x: 'Reworked the salvage economy and added two late-game stations.' },
        { t: 'Weekend double-XP event',   d: '2026-06-20', x: 'All faction reputation gains are doubled through Sunday.' },
      ] },
    { id: 'g2', name: 'Hollow Reach',  tint: '#5e2740', last: '2026-06-28', hrs: 156, hrs2w: 8.2, ach: 22, achTotal: 22, icon: '#a83e63',
      news: [{ t: 'The Deepwater update is live', d: '2026-06-25', x: 'A new sunken district, three boss encounters.' }] },
    { id: 'g3', name: 'Pixel Foundry', tint: '#1f4d44', last: '2026-06-26', hrs: 89,  hrs2w: 0,   ach: 14, achTotal: 60, icon: '#2f8a78',
      news: [{ t: 'Roadmap: automation overhaul', d: '2026-06-18', x: 'Logistics drones, programmable belts coming this autumn.' }] },
    { id: 'g4', name: 'Verdant',       tint: '#2e5320', last: '2026-06-30', hrs: 540, hrs2w: 19.7, ach: 71, achTotal: 71, icon: '#4f8a31',
      news: [{ t: 'Season of Roots', d: '2026-06-29', x: 'A new seasonal biome with rare seeds and weather events.' }] },
    { id: 'g5', name: 'Null Sector',   tint: '#4a2d2d', last: '2026-06-24', hrs: 233, hrs2w: 3.1, ach: 9,  achTotal: 44, icon: '#b5544e',
      news: [{ t: 'Anti-cheat rollout phase 2', d: '2026-06-22', x: 'Server-side validation now active in ranked queues.' }] },
    { id: 'g6', name: 'Lantern',       tint: '#52461d', last: '2026-06-15', hrs: 41,  hrs2w: 0,   ach: 0,  achTotal: 33, icon: '#c2a13c', news: [] },
    { id: 'g7', name: 'Tidebreaker',   tint: '#1f3a52', last: '2026-06-21', hrs: 318, hrs2w: 6.6, ach: 47, achTotal: 88, icon: '#3f7fb5',
      news: [{ t: 'Crossplay beta opens', d: '2026-06-19', x: 'Opt into the crossplay beta from the main menu.' }] },
    { id: 'g8', name: 'Ember & Ash',   tint: '#5a3320', last: '2026-06-12', hrs: 122, hrs2w: 0,   ach: 30, achTotal: 30, icon: '#c46a34', news: [] },
];
*/