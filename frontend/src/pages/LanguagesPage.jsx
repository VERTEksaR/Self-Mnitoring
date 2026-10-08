import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, Plus } from 'lucide-react';
import { EmptyHint } from '../components/EmptyHint';
import {useEffect, useState} from "react";
import {createLanguage, getLanguages} from "../api/languages/languages.ts";
import {emptyToNull, LANGUAGE_FORM_DEFAULT} from "../utils/languages.ts";
import {LanguageFormModal} from "../components/languages/LanguageFormModal.jsx";

export default function LanguagesPage() {
    const navigate = useNavigate();
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [langForm, setLangForm] = useState(null);

    useEffect(() => {
        getLanguages()
            .then(setLanguages)
            .catch(err => console.error('[Languages] load failed:', err?.response?.status))
            .finally(() => setLoading(false))
    }, []);

    const saveLanguage = async (form) => {
        const created = await createLanguage({ ...form, code: emptyToNull(form.code) });
        setLanguages(prev => [...prev, created]);
        setLangForm(null);
    };

    if (loading) return <div className="loading">Загрузка...</div>

    return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} aria-label="Назад">
                        <ArrowLeft size={15} />
                    </button>
                    <span className="finance-nav-brand">
                        <Languages size={18} />
                        <span>Языки</span>
                    </span>
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
                <div className="section-header">
                    <span className="section-title">Мои языки</span>
                    <button className="btn btn-primary btn-sm" onClick={() => setLangForm({...LANGUAGE_FORM_DEFAULT })}>
                        <Plus size={14} /> Добавить
                    </button>
                </div>

                {languages.length === 0 ? (
                    <EmptyHint title="Пока нет языков" hint="Добавь язык, который изучаешь"
                             action="Добавить язык" onAction={() => setLangForm({...LANGUAGE_FORM_DEFAULT })} />
                ) : (
                    <div className="module-grid">
                        {languages.map(lang => (
                            <div key={lang.id} className="card module-card" onClick={() => navigate(`/learn/${lang.id}`)}>
                                <div className="module-card__title">{lang.name}</div>
                                <div className="module-card__desc">{lang.current_level} → {lang.target_level}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {langForm && <LanguageFormModal form={langForm} setForm={setLangForm} onSave={saveLanguage}/>}
        </div>
    );
}
