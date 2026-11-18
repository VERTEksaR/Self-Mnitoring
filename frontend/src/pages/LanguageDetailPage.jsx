import {useNavigate, useParams} from 'react-router-dom';
import { EmptyHint } from '../components/EmptyHint';
import {useEffect, useState} from "react";
import {getLanguage, updateLanguage, deleteLanguage, getLanguages} from "../api/languages/languages.ts";
import {ArrowLeft, BookOpen, Languages, NotebookPen, Pencil, Repeat, CalendarDays, ChartColumn, ChevronDown, ChevronsLeft, ChevronsRight} from "lucide-react";
import {LanguageFormModal} from "../components/languages/LanguageFormModal.jsx";
import {emptyToNull} from "../utils/languages.ts";
import {DictionarySection} from "../components/languages/DictionarySection.jsx";
import {NotesSection} from "../components/languages/NotesSection.jsx";
import {ReviewSection} from "../components/languages/ReviewSection.jsx";
import {useSpeech} from "../hooks/useSpeech.js";
import {useBodyClass} from "../hooks/useBodyClass.js";
import {JournalSection} from "../components/languages/JournalSection.jsx";
import {StatsSection} from "../components/languages/StatsSection.jsx";

import {LanguageBrand, LanguageBadge} from '../components/languages/LanguageBrand.jsx';
import './languages.css';

const TABS = [
    { id: 'dictionary', label: 'Словарь',   icon: <BookOpen size={16} /> },
    { id: 'notes',      label: 'Конспекты', icon: <NotebookPen size={16} /> },
    { id: 'review',     label: 'Повторение', icon: <Repeat size={16} /> },
    { id: 'journal',    label: 'Журнал',    icon: <CalendarDays size={16} /> },
    { id: 'stats',      label: 'Статистика', icon: <ChartColumn size={16} /> },
];

export default function LanguageDetailPage() {
    const { languageId } = useParams();
    const id = Number(languageId);
    const [language, setLanguage] = useState(null);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('dictionary');
    const [collapsed, setCollapsed] = useState(false);
    const [languageMenu, setLanguageMenu] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [langForm, setLangForm] = useState(null);
    const speech = useSpeech(language?.code);
    useBodyClass('ln-body');   // голубая тема модуля вместо зелёной по умолчанию
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;
        getLanguage(id)
            .then(value => { if (!ignore) { setLanguage(value); setError(null); } })
            .catch(err => { if (!ignore) setError({ id, message: err.response?.status === 404 ? 'Язык не найден' : 'Не удалось загрузить язык' }); });
        return () => { ignore = true; };
    }, [id]);

    const toggleLanguageMenu = async () => {
        if (!languageMenu) {
            try { setLanguages(await getLanguages()); }
            catch { setLanguages([language]); }
        }
        setLanguageMenu(value => !value);
    };

    const openEdit = () => setLangForm({
        id: language.id, name: language.name, code: language.code ?? '',
        current_level: language.current_level, target_level: language.target_level,
    });

    const saveLanguage = async (form) => {
        const { id, ...fields } = form;
        const updated = await updateLanguage(id, { ...fields, code: emptyToNull(fields.code) });
        setLanguage(updated);
        setLangForm(null);
    };

    const removeLanguage = async () => {
        if (!window.confirm(`Удалить «${language.name}»? Удалятся все слова, конспекты, теги и история повторений.`)) return;

        await deleteLanguage(language.id);
        navigate('/learn');
    };

    if (error?.id === id) return (
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
            <EmptyHint title={error.message} hint="Вернись к списку языков" action="К списку" onAction={() => navigate('/learn')} />
        </div>
    );
    if (!language || language.id !== id) return <div className="loading">Загрузка...</div>;

    return (
        <div className={'ln-page ln-workspace' + (collapsed ? ' ln-workspace--collapsed' : '')}>
            <aside className="ln-sidebar">
                <button className="ln-brand-link" onClick={() => navigate('/')} aria-label="На главную"><LanguageBrand /></button>
                <button className="ln-back" onClick={() => navigate('/learn')} title="Все языки"><ArrowLeft size={18} /><span>Все языки</span></button>
                <div className="ln-language-switcher">
                    <button className="ln-current-language" onClick={toggleLanguageMenu} aria-expanded={languageMenu} title={language.name}>
                        <LanguageBadge language={language} />
                        <span><strong>{language.name}</strong><small>{language.current_level} → {language.target_level}</small></span>
                        <ChevronDown size={18} />
                    </button>
                    {languageMenu && <div className="ln-language-menu">
                        {languages.map(item => <button key={item.id} onClick={() => { setLanguageMenu(false); navigate(`/learn/${item.id}`); }}>
                            {item.name}{item.id === id ? ' · Текущий' : ''}
                        </button>)}
                        <button onClick={() => { setLanguageMenu(false); openEdit(); }}><Pencil size={15} /> Изменить язык</button>
                    </div>}
                </div>
                <span className="ln-nav-caption">Обучение</span>
                <nav className="ln-navigation" aria-label="Разделы языка">
                    {TABS.map(t => <button key={t.id} className={'ln-nav-item' + (t.id === tab ? ' is-active' : '')}
                        onClick={() => setTab(t.id)} aria-current={t.id === tab ? 'page' : undefined} title={t.label}>
                        {t.icon}<span>{t.label}</span>
                    </button>)}
                </nav>
                <button className="ln-collapse" onClick={() => setCollapsed(value => !value)} aria-expanded={!collapsed} title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}>
                    {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}<span>Свернуть</span>
                </button>
            </aside>
            <div className="ln-workspace-content">
                <header className="ln-header">
                    <nav className="ln-breadcrumbs" aria-label="Навигационная цепочка">
                        <button onClick={() => navigate('/learn')}>Языки</button><span>/</span>
                        <button onClick={openEdit} title="Изменить язык">{language.name}</button><span>/</span>
                        <strong>{TABS.find(t => t.id === tab)?.label}</strong>
                    </nav>
                    <button className="btn btn-ghost btn-icon" onClick={openEdit} aria-label="Изменить язык"><Pencil size={17} /></button>
                </header>
                <main className="ln-main" key={id}>
                    {tab === 'dictionary' && <DictionarySection languageId={id} speech={speech} />}
                    {tab === 'notes' && <NotesSection languageId={id} />}
                    {tab === 'review' && <ReviewSection languageId={id} speech={speech} />}
                    {tab === 'journal' && <JournalSection languageId={id} />}
                    {tab === 'stats' && <StatsSection languageId={id} />}
                </main>
            </div>
            {langForm && (
                <LanguageFormModal form={langForm} setForm={setLangForm}
                                 onSave={saveLanguage} onDelete={removeLanguage} />
            )}
        </div>
    );
}
