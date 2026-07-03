import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAchievementsDetail } from '../api/api';
import './steam.css';

const Ico = ({ s = 18, children }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const ArrowLeft  = () => <Ico s={15}><path d="m15 18-6-6 6-6" /></Ico>;
const TrophyIcon = () => <Ico><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></Ico>;

export default function SteamAchievementsDetailPage() {
    const { appid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const steamId = new URLSearchParams(location.search).get('steam_id');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!steamId || !appid) { setLoading(false); return; }
        getAchievementsDetail(steamId, appid)
            .then(res => { setData(res.data); setLoading(false); })
            .catch(() => { setError('Не удалось загрузить достижения'); setLoading(false); });
    }, [steamId, appid]);

    const filtered = data?.achievements?.filter(a => {
        if (filter === 'achieved') return a.achieved;
        if (filter === 'locked')   return !a.achieved;
        return true;
    }) ?? [];

    const percent = data?.total > 0
        ? Math.round(data.achieved_count / data.total * 100)
        : 0;

    return (
        <div className="steam-theme finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/steam')} aria-label="Назад">
                        <ArrowLeft />
                    </button>
                    <span className="finance-nav-brand" style={{ color: 'var(--brand)' }}>
                        <TrophyIcon />
                        <span>{data ? data.game_name : 'Достижения'}</span>
                    </span>
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
                {loading && (
                    <div className="card empty" style={{ minHeight: 200 }}>
                        <div className="empty__hint">Загрузка...</div>
                    </div>
                )}

                {error && (
                    <div className="card empty" style={{ minHeight: 200 }}>
                        <div className="empty__title" style={{ color: 'var(--expense)' }}>{error}</div>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* header card */}
                        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
                            <img
                                src={`https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`}
                                alt={data.game_name}
                                style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                            <div style={{ padding: '16px 20px' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-strong)', marginBottom: 14 }}>
                                    {data.game_name}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        <span style={{ color: 'var(--text-strong)', fontWeight: 700, fontSize: 15 }}>{data.achieved_count}</span>
                                        {' '}из {data.total} достижений
                                    </span>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>{percent}%</span>
                                </div>
                                <div className="steam-bar" style={{ height: 8 }}>
                                    <div className="steam-bar__fill" style={{ width: `${percent}%`, background: 'var(--gold)' }} />
                                </div>
                            </div>
                        </div>

                        {/* filter tabs */}
                        <div className="steam-seg" style={{ marginBottom: 14 }}>
                            {[
                                { id: 'all',      label: `Все (${data.total})` },
                                { id: 'achieved', label: `Получено (${data.achieved_count})` },
                                { id: 'locked',   label: `Не получено (${data.total - data.achieved_count})` },
                            ].map(f => (
                                <button
                                    key={f.id}
                                    className={`steam-seg__btn${filter === f.id ? ' steam-seg__btn--on' : ''}`}
                                    onClick={() => setFilter(f.id)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* achievement list */}
                        <div className="card" style={{ overflow: 'hidden' }}>
                            {filtered.length === 0 ? (
                                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                                    Нет достижений в этой категории
                                </div>
                            ) : filtered.map((a, i) => (
                                <div
                                    key={i}
                                    className="ach-detail-row"
                                    style={{ opacity: a.achieved ? 1 : 0.5 }}
                                >
                                    <div
                                        className="ach-detail-row__dot"
                                        style={{ background: a.achieved ? 'var(--gold)' : 'var(--ach-zero)' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', marginBottom: a.description ? 2 : 0 }}>
                                            {a.name || a.apiname}
                                        </div>
                                        {a.description && (
                                            <div style={{ fontSize: 12, color: 'var(--text-body)' }}>{a.description}</div>
                                        )}
                                    </div>
                                    {a.achieved && a.unlock_time ? (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            {new Date(a.unlock_time * 1000).toLocaleDateString('ru-RU')}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}