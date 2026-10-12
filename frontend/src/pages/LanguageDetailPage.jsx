import {useNavigate, useParams} from 'react-router-dom';
import { EmptyHint } from '../components/EmptyHint';
import {useEffect, useState} from "react";
import {getLanguage} from "../api/languages/languages.ts";
import {ArrowLeft, BookOpen, Languages, NotebookPen, Repeat} from "lucide-react";
import {DictionarySection} from "../components/languages/DictionarySection.jsx";
import {NotesSection} from "../components/languages/NotesSection.jsx";
import {ReviewSection} from "../components/languages/ReviewSection.jsx";
import {useSpeech} from "../hooks/useSpeech.js";
import {useBodyClass} from "../hooks/useBodyClass.js";

const TABS = [
    { id: 'dictionary', label: 'Словарь',   icon: <BookOpen size={16} /> },
    { id: 'notes',      label: 'Конспекты', icon: <NotebookPen size={16} /> },
    { id: 'review',     label: 'Повторение', icon: <Repeat size={16} /> },
];

export default function LanguageDetailPage() {
    const { languageId } = useParams();
    const id = Number(languageId);
    const [language, setLanguage] = useState(null);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('dictionary');
    const speech = useSpeech(language?.code);
    useBodyClass('ln-body');   // голубая тема модуля вместо зелёной по умолчанию
    const navigate = useNavigate();

    useEffect(() => {
        getLanguage(id)
            .then(setLanguage)
            .catch(err => setError(err.response?.status === 404 ? 'Язык не найден' : 'Не удалось загрузить язык'));
    }, [id]);

    if (error) return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/learn')} aria-label="Назад">
                        <ArrowLeft size={15} />
                    </button>
                    <span className="finance-nav-brand">
                        <Languages size={18} />
                        <span>Языки</span>
                    </span>
                </div>
            </nav>
            <EmptyHint title={error} hint="Вернись к списку языков" action="К списку" onAction={() => navigate('/learn')} />
        </div>
    );
    if (!language) return <div className="loading">Загрузка...</div>;

    return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/learn')} aria-label="Назад">
                        <ArrowLeft size={15} />
                    </button>
                    <span className="finance-nav-brand">
                        <Languages size={18} />
                        <span>{language.name}</span>
                    </span>
                </div>
            </nav>
            <div className="finance-body">
                <aside style={{ width: 200, flex: 'none', position: 'sticky', top: 56,
                    height: 'calc(100vh - 56px)', padding: '16px 10px',
                    background: 'var(--surface-card)', borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    backdropFilter: 'blur(12px)' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8, border: 'none',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                            width: '100%', fontFamily: 'inherit',
                            color: t.id === tab ? 'var(--brand)' : 'var(--text-body)',
                            background: t.id === tab ? 'var(--brand-subtle)' : 'transparent',
                        }}>
                            {t.icon}<span>{t.label}</span>
                        </button>
                    ))}
                </aside>
                <main className="finance-main">
                    {tab === 'dictionary' && <DictionarySection languageId={id} speech={speech} />}
                    {tab === 'notes' && <NotesSection languageId={id} />}
                    {tab === 'review' && <ReviewSection languageId={id} speech={speech} />}
                </main>
            </div>
        </div>
    );
}
