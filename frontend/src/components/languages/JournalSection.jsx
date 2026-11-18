import {useCallback, useEffect, useState} from "react";
import {Plus} from "lucide-react";
import {createStudySession, deleteStudySession, getStudySessions, updateStudySession} from "../../api/languages/studySession.ts";
import {
    STUDY_TYPES, daysAgoISO, formToStudy, formatMinutes, formatStudyDate, studyFormDefault, studyToForm, pluralLabel,
} from "../../utils/languages.ts";
import {EmptyHint} from "../EmptyHint.jsx";
import {StudyRow} from "./StudyRow.jsx";
import {StudyFormModal} from "./StudyFormModal.jsx";

const PAGE_SIZE = 20;
const PERIODS = [
    { id: '7', label: '7 дней', days: 7 },
    { id: '30', label: '30 дней', days: 30 },
    { id: 'all', label: 'Всё время', days: null },
];

export function JournalSection({ languageId }) {
    const [data, setData] = useState({ items: [], total: 0, total_minutes: 0, pages: 1 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [studyType, setStudyType] = useState(null);
    const [studyForm, setStudyForm] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const { days } = PERIODS.find(p => p.id === period);
            setData(await getStudySessions(languageId, {
                page, size: PAGE_SIZE,
                date_from: days ? daysAgoISO(days - 1) : undefined,
                study_type: studyType ?? undefined,
            }));
        } catch (err) {
            console.error('[Journal] load failed:', err?.response?.status);
        } finally {
            setLoading(false);
        }
    }, [languageId, page, period, studyType]);

    useEffect(() => {
        load();
    }, [load]);

    const pickPeriod = (id) => { setPeriod(id); setPage(1); };
    const pickType = (t) => { setStudyType(t); setPage(1); };

    const saveStudy = async (form) => {
        const payload = formToStudy(form);

        if (form.id) {
            await updateStudySession(languageId, form.id, payload);
            load();
        } else {
            await createStudySession(languageId, payload);

            if (page !== 1) setPage(1); else load();
        }
        setStudyForm(null);
    };

    const removeStudy = async (study) => {
        if (!window.confirm(`Удалить занятие «${study.study_type}» от ${formatStudyDate(study.study_date)}?`)) return;

        try {
            await deleteStudySession(languageId, study.id);
        } catch (err) {
            console.error('[Journal] delete failed:', err?.response?.status);
        }

        if (data.items.length === 1 && page > 1) setPage(p => p - 1);
        else load();
    };

    const openCreate = () => setStudyForm(studyFormDefault());
    const isFiltered = period !== 'all' || studyType !== null;

    return (
        <>
            <div className="card" style={{ padding: 16 }}>
                <div className="section-header">
                    <span className="section-title">Журнал <span className="section-count">{data.total}</span></span>
                    <button className="btn btn-primary btn-sm" onClick={openCreate}>
                        <Plus size={14} /> Занятие
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {PERIODS.map(p => (
                        <button key={p.id} className={'btn btn-sm ' + (period === p.id ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => pickPeriod(p.id)}>{p.label}</button>
                    ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <button className={'btn btn-sm ' + (studyType === null ? 'btn-primary' : 'btn-ghost')}
                            onClick={() => pickType(null)}>Все</button>
                    {STUDY_TYPES.map(t => (
                        <button key={t} className={'btn btn-sm ' + (studyType === t ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => pickType(t)}>{t}</button>
                    ))}
                </div>

                {data.total > 0 && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                        {period === 'all' ? 'За всё время' : 'За период'}:{' '}
                        <b style={{ color: 'var(--text-strong)' }}>{formatMinutes(data.total_minutes)}</b>
                        {' · '}{data.total} {pluralLabel(data.total, ['занятие', 'занятия', 'занятий'])}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: loading ? 0.5 : 1 }}>
                    {data.items.length === 0 && !loading ? (
                        <EmptyHint title={isFiltered ? 'Занятий не найдено' : 'Журнал пуст'}
                                   hint={isFiltered ? 'Выбери другой период или тип' : 'Записывай, сколько и чем занимался'}
                                   action="Записать занятие" onAction={openCreate} />
                    ) : data.items.map(s => (
                        <StudyRow key={s.id} study={s}
                                  onEdit={() => setStudyForm(studyToForm(s))} onDelete={() => removeStudy(s)} />
                    ))}
                </div>

                {data.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{page} / {data.pages}</span>
                        <button className="btn btn-ghost btn-sm" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>→</button>
                    </div>
                )}

            </div>
            {studyForm && <StudyFormModal form={studyForm} setForm={setStudyForm} onSave={saveStudy} />}
        </>
    );
}