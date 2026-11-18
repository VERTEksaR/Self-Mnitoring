import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import {LanguageBrand, LanguageBadge} from '../components/languages/LanguageBrand.jsx';
import './languages.css';
import {useEffect, useState} from "react";
import {createLanguage, getLanguages} from "../api/languages/languages.ts";
import {emptyToNull, LANGUAGE_FORM_DEFAULT} from "../utils/languages.ts";
import {LanguageFormModal} from "../components/languages/LanguageFormModal.jsx";
import {useBodyClass} from "../hooks/useBodyClass.js";

export default function LanguagesPage() {
    useBodyClass('ln-body');   // голубая тема модуля вместо зелёной по умолчанию
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
        <div className="ln-page ln-overview">
            <header className="ln-overview-header">
                <button className="ln-brand-link" onClick={() => navigate('/')} aria-label="На главную"><LanguageBrand /></button>
                <button className="btn btn-ghost" onClick={() => navigate('/')}><ArrowLeft size={18} /> На главную</button>
            </header>
            <main className="ln-library">
                <div className="ln-library-heading">
                    <span className="ln-eyebrow">Self-Monitoring</span>
                    <h1>Языки</h1>
                    <p>Обзор библиотеки языков</p>
                </div>
                <div className="ln-language-grid">
                    {languages.map(lang => (
                        <button key={lang.id} className="ln-language-card" onClick={() => navigate(`/learn/${lang.id}`)}>
                            <LanguageBadge language={lang} />
                            <h2>{lang.name}</h2>
                            <p>{lang.current_level} → {lang.target_level}</p>
                            <span className="ln-open-language">Открыть <ArrowRight size={22} /></span>
                        </button>
                    ))}
                    <button className="ln-language-card ln-add-language" onClick={() => setLangForm({...LANGUAGE_FORM_DEFAULT})}>
                        <span className="ln-add-icon"><Plus size={40} /></span>
                        <span>Добавить<br />язык</span>
                    </button>
                </div>
            </main>

            {langForm && <LanguageFormModal form={langForm} setForm={setLangForm} onSave={saveLanguage}/>}
        </div>
    );
}
