import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSteamAccounts, linkSteam, unlinkSteam, getPlayerInfo, getTrackedGames, addTrackedGame, removeTrackedGame, getAchievementsSummary, getGameNews } from '../api/api';
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

const nf = (n) => Number(n).toLocaleString('ru-RU');

// ── Profile section ──
function Profile({ steamId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!steamId) { setLoading(false); return; }
        setLoading(true);
        getPlayerInfo(steamId)
            .then(res => { setData(res.data); setLoading(false); })
            .catch(() => { setError('Не удалось загрузить данные профиля'); setLoading(false); });
    }, [steamId]);

    if (!steamId) return (
        <div className="card empty" style={{ minHeight: 200 }}>
            <div className="empty__title">Выберите аккаунт</div>
            <div className="empty__hint">Привяжите Steam аккаунт выше, чтобы увидеть профиль.</div>
        </div>
    );

    if (loading) return (
        <div className="card empty" style={{ minHeight: 200 }}>
            <div className="empty__hint">Загрузка...</div>
        </div>
    );

    if (error) return (
        <div className="card empty" style={{ minHeight: 200 }}>
            <div className="empty__title" style={{ color: 'var(--expense)' }}>{error}</div>
        </div>
    );

    const online = data.personastate > 0;
    const year = data.timecreated ? new Date(data.timecreated * 1000).getFullYear() : '—';

    return (
        <>
            {/* header card */}
            <div className="card" style={{ padding: 22, display: 'flex', gap: 20, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
                {data.avatarfull
                    ? <img src={data.avatarfull} alt="avatar" style={{ width: 84, height: 84, borderRadius: '50%', border: '2px solid var(--brand-subtle-bd)', flexShrink: 0 }} />
                    : <div className="steam-avatar">{data.personaname.slice(0, 2).toUpperCase()}</div>
                }
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-strong)' }}>{data.personaname}</span>
                        <span className="badge" style={{
                            background: online ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                            color: online ? 'var(--brand)' : 'var(--text-muted)',
                            border: `1px solid ${online ? 'var(--brand-subtle-bd)' : 'var(--border)'}`,
                        }}>
                            <span className="badge-dot" style={{ background: online ? 'var(--brand)' : 'var(--text-faint)' }} />
                            {online ? 'В сети' : 'Не в сети'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-muted)' }}>
                        <span>Steam ID&nbsp;<span className="steam-mono" style={{ color: 'var(--text-body)' }}>{data.steamid}</span></span>
                        <span>Аккаунт с&nbsp;<span className="steam-mono" style={{ color: 'var(--text-body)' }}>{year}</span> г.</span>
                    </div>
                </div>
            </div>

            {/* stat tiles */}
            <div className="steam-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {[
                    { label: 'Игр в библиотеке', value: nf(data.game_count), sub: 'всего на аккаунте' },
                    { label: 'Часов в играх',    value: nf(data.playtime),   sub: 'суммарное время' },
                ].map(t => (
                    <div key={t.label} className="card stat-card">
                        <div className="stat-card__label">{t.label}</div>
                        <div className="stat-card__value">{t.value}</div>
                        <div className="stat-card__sub">{t.sub}</div>
                    </div>
                ))}
            </div>

            {/* recently played */}
            {data.games?.length > 0 && (
                <>
                    <div className="section-header" style={{ marginBottom: 12 }}>
                        <span className="section-title">Недавно запускали</span>
                        <span className="section-count">{data.games.length}</span>
                    </div>
                    <div className="rp-grid">
                        {data.games.map((g, i) => (
                            <div key={i} className="card rp-card">
                                <img
                                    src={g.image}
                                    alt={g.name}
                                    style={{ width: 92, height: 44, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            <span className="steam-mono" style={{ color: 'var(--text-body)', fontWeight: 600 }}>{nf(Math.round(g.playtime_total))}</span> ч всего
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            <span className="steam-mono" style={{ color: 'var(--brand)', fontWeight: 600 }}>{g.playtime_2weeks.toFixed(1)}</span> ч за 2 нед.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

// ── Карточка привязанных Steam-аккаунтов ──
function SteamAccountsCard({ accounts, selectedSteamId, onSelect, onUnlink, onLogin }) {
    return (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: accounts.length ? 16 : 0 }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>Steam аккаунты</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {accounts.length === 0 ? 'Нет привязанных аккаунтов' : `Привязано: ${accounts.length}`}
                    </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ gap: 6 }} onClick={onLogin}>
                    <SteamIcon /><span>Войти через Steam</span>
                </button>
            </div>

            {accounts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {accounts.map(acc => (
                        <div key={acc.id} onClick={() => onSelect(acc.steam_id)} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                            background: acc.steam_id === selectedSteamId ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                            border: `1px solid ${acc.steam_id === selectedSteamId ? 'var(--brand-subtle-bd)' : 'var(--border)'}`,
                        }}>
                            <div className="steam-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                                {acc.steam_id.slice(-2)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 1 }}>Steam ID</div>
                                <div className="steam-mono" style={{ fontSize: 13, color: 'var(--text-strong)' }}>{acc.steam_id}</div>
                            </div>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => onUnlink(acc.steam_id)}
                            >
                                Отвязать
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Achievements section ──
function Achievements({ steamId }) {
    const navigate = useNavigate();
    const [trackedGames, setTrackedGames] = useState([]);
    const [achievements, setAchievements] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [appIdInput, setAppIdInput] = useState('');
    const [adding, setAdding] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!steamId) { setLoading(false); return; }
        loadPage();
    }, [steamId, page]);

    const loadPage = async () => {
        setLoading(true);
        try {
            const res = await getTrackedGames(steamId, page, 10);
            const games = res.data.items ?? [];
            setTrackedGames(games);
            setTotalPages(res.data.pages ?? 1);
            if (games.length > 0) {
                const appids = games.map(g => g.appid);
                const achRes = await getAchievementsSummary(steamId, appids);
                setAchievements(achRes.data);
            } else {
                setAchievements({});
            }
        } catch (err) {
            console.error('[Achievements] loadPage failed:', err?.response?.status);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const appid = parseInt(appIdInput.trim());
        if (!appid) return;
        setAdding(true);
        try {
            await addTrackedGame(steamId, appid);
            setAppIdInput('');
            if (page !== 1) setPage(1);
            else loadPage();
        } catch (err) {
            console.error('[Achievements] add failed:', err?.response?.data);
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (e, appid) => {
        e.stopPropagation();
        try {
            await removeTrackedGame(steamId, appid);
            setTrackedGames(prev => prev.filter(g => g.appid !== appid));
        } catch (err) {
            console.error('[Achievements] remove failed:', err?.response?.data);
        }
    };

    const filtered = search
        ? trackedGames.filter(g => g.game_name.toLowerCase().includes(search.toLowerCase()))
        : trackedGames;

    if (!steamId) return (
        <div className="card empty" style={{ minHeight: 200 }}>
            <div className="empty__title">Выберите аккаунт</div>
            <div className="empty__hint">Привяжите Steam аккаунт выше, чтобы отслеживать достижения.</div>
        </div>
    );

    return (
        <>
            {/* top bar */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    className="input"
                    placeholder="Поиск по названию..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 160 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        className="input"
                        placeholder="App ID"
                        value={appIdInput}
                        onChange={e => setAppIdInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        style={{ width: 110 }}
                    />
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                        disabled={adding || !appIdInput.trim()}
                    >
                        {adding ? '...' : '+ Добавить'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="card empty" style={{ minHeight: 200 }}>
                    <div className="empty__hint">Загрузка...</div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card empty" style={{ minHeight: 200 }}>
                    <div className="empty__title">{search ? 'Ничего не найдено' : 'Нет отслеживаемых игр'}</div>
                    {!search && (
                        <div className="empty__hint">
                            Введите App ID из URL магазина Steam и нажмите «+ Добавить».<br />
                            <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>
                                Пример: store.steampowered.com/app/<strong>440</strong>/
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(game => {
                        const ach = achievements[String(game.appid)];
                        const percent = ach?.total > 0 ? Math.round(ach.achieved / ach.total * 100) : 0;
                        return (
                            <div
                                key={game.appid}
                                className="card ach-row"
                                onClick={() => navigate(`/steam/achievements/${game.appid}?steam_id=${steamId}`)}
                            >
                                <div className="ach-row__left">
                                    <img
                                        className="ach-row__img"
                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                                        alt={game.game_name}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                    <div>
                                        <div className="ach-row__name">{game.game_name}</div>
                                        <div className="ach-row__appid steam-mono">App ID: {game.appid}</div>
                                    </div>
                                </div>

                                <div className="ach-row__right">
                                    {ach === undefined ? (
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Загрузка...</span>
                                    ) : !ach || ach.total === 0 ? (
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Нет достижений</span>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>
                                                    {ach.achieved}
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {ach.total}</span>
                                                </span>
                                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>{percent}%</span>
                                            </div>
                                            <div className="steam-bar">
                                                <div className="steam-bar__fill" style={{ width: `${percent}%`, background: 'var(--gold)' }} />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    className="ach-row__remove"
                                    onClick={e => handleRemove(e, game.appid)}
                                    title="Убрать из отслеживаемых"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && !loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                </div>
            )}
        </>
    );
}

// ── News section ──
// Список отслеживаемых игр общий с разделом «Достижения» (одна и та же таблица
// на бэке) — игру, добавленную здесь, сразу видно там, и наоборот.
function News({ steamId }) {
    const [trackedGames, setTrackedGames] = useState([]);
    const [newsMap, setNewsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [appIdInput, setAppIdInput] = useState('');
    const [adding, setAdding] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!steamId) { setLoading(false); return; }
        loadPage();
    }, [steamId, page]);

    const loadPage = async () => {
        setLoading(true);
        try {
            const res = await getTrackedGames(steamId, page, 10);
            const games = res.data.items ?? [];
            setTrackedGames(games);
            setTotalPages(res.data.pages ?? 1);
            if (games.length > 0) {
                const appids = games.map(g => g.appid);
                const newsRes = await getGameNews(steamId, appids, 3);
                setNewsMap(newsRes.data);
            } else {
                setNewsMap({});
            }
        } catch (err) {
            console.error('[News] loadPage failed:', err?.response?.status);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const appid = parseInt(appIdInput.trim());
        if (!appid) return;
        setAdding(true);
        try {
            await addTrackedGame(steamId, appid);
            setAppIdInput('');
            if (page !== 1) setPage(1);
            else loadPage();
        } catch (err) {
            console.error('[News] add failed:', err?.response?.data);
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (appid) => {
        try {
            await removeTrackedGame(steamId, appid);
            setTrackedGames(prev => prev.filter(g => g.appid !== appid));
        } catch (err) {
            console.error('[News] remove failed:', err?.response?.data);
        }
    };

    const filtered = search
        ? trackedGames.filter(g => g.game_name.toLowerCase().includes(search.toLowerCase()))
        : trackedGames;

    if (!steamId) return (
        <div className="card empty" style={{ minHeight: 200 }}>
            <div className="empty__title">Выберите аккаунт</div>
            <div className="empty__hint">Привяжите Steam аккаунт выше, чтобы видеть новости по играм.</div>
        </div>
    );

    return (
        <>
            {/* top bar */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    className="input"
                    placeholder="Поиск по названию..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 160 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        className="input"
                        placeholder="App ID"
                        value={appIdInput}
                        onChange={e => setAppIdInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        style={{ width: 110 }}
                    />
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                        disabled={adding || !appIdInput.trim()}
                    >
                        {adding ? '...' : '+ Добавить'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="card empty" style={{ minHeight: 200 }}>
                    <div className="empty__hint">Загрузка...</div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card empty" style={{ minHeight: 200 }}>
                    <div className="empty__title">{search ? 'Ничего не найдено' : 'Нет отслеживаемых игр'}</div>
                    {!search && (
                        <div className="empty__hint">
                            Введите App ID из URL магазина Steam и нажмите «+ Добавить».<br />
                            <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>
                                Пример: store.steampowered.com/app/<strong>440</strong>/
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map(game => {
                        const items = newsMap[String(game.appid)];
                        return (
                            <div key={game.appid} className="card" style={{ overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                                    <img
                                        className="ach-row__img"
                                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                                        alt={game.game_name}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="ach-row__name">{game.game_name}</div>
                                        <div className="ach-row__appid steam-mono">App ID: {game.appid}</div>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleRemove(game.appid)}
                                        title="Убрать из отслеживаемых"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {items === undefined ? (
                                    <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>Загрузка новостей...</div>
                                ) : items.length === 0 ? (
                                    <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>Новостей нет</div>
                                ) : (
                                    items.map((n, i) => (
                                        <div key={i} className="steam-news-item">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                                                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-strong)' }}>{n.title}</span>
                                                    <span style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                        {n.date ? new Date(n.date * 1000).toLocaleDateString('ru-RU') : ''}
                                                    </span>
                                                </div>
                                                {n.contents && <div className="steam-news-excerpt">{n.contents}</div>}
                                                <a className="steam-link" href={n.url} target="_blank" rel="noreferrer">Читать в Steam →</a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && !loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                </div>
            )}
        </>
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
    const [accounts, setAccounts] = useState([]);
    const [selectedSteamId, setSelectedSteamId] = useState(localStorage.getItem('steam_id') || null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const steamId = params.get('steam_id');
if (steamId) {
            localStorage.setItem('steam_id', steamId);
            navigate('/steam', { replace: true });
            setSelectedSteamId(steamId);
            linkSteam(steamId)
                .then(res => setAccounts(prev =>
                    prev.some(a => a.steam_id === steamId) ? prev : [...prev, res.data]
                ))
                .catch(err => console.error('[Steam] linkSteam failed:', err?.response?.status, err?.response?.data));
        } else {
            getSteamAccounts()
                .then(res => {
                    setAccounts(res.data);
                    if (!selectedSteamId && res.data.length > 0) {
                        setSelectedSteamId(res.data[0].steam_id);
                    }
                })
                .catch(err => console.error('[Steam] getSteamAccounts failed:', err?.response?.status, err?.response?.data));
        }
    }, []);

    const handleLogin = () => {
        window.location.href = '/steam/login';
    };

    const handleUnlink = async (steamId) => {
        await unlinkSteam(steamId);
        setAccounts(prev => {
            const next = prev.filter(a => a.steam_id !== steamId);
            if (selectedSteamId === steamId) {
                const fallback = next[0]?.steam_id || null;
                setSelectedSteamId(fallback);
                if (fallback) localStorage.setItem('steam_id', fallback);
                else localStorage.removeItem('steam_id');
            }
            return next;
        });
    };

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
                    <SteamAccountsCard
                        accounts={accounts}
                        selectedSteamId={selectedSteamId}
                        onSelect={setSelectedSteamId}
                        onLogin={handleLogin}
                        onUnlink={handleUnlink}
                    />
                    {active === 'profile'      && <Profile steamId={selectedSteamId} />}
                    {active === 'news'         && <News steamId={selectedSteamId} />}
                    {active === 'achievements' && <Achievements steamId={selectedSteamId} />}
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