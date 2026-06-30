import { useEffect, useState } from 'react';
import { createCategory, updateCategory } from '../api/api';
import { CategoryForm } from './CategoryForm';


export function AddCategoryModel({ onClose, onSaved }) {
    const [form, setForm] = useState({ name: '', show_analytics: true });

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createCategory(form);
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.log(err.response?.data || err);
        }
    };

    return <CategoryForm form={form} setForm={setForm} onClose={onClose} onSubmit={handleSubmit} />;
}


export function CategoryModel({ category, onClose, onDelete, onUpdate }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    const handleToggleAnalytics = async () => {
        setLoading(true);
        try {
            const res = await updateCategory(category.id, { show_analytics: !category.show_analytics });
            onUpdate?.(res.data);
        } catch (err) {
            console.log(err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    const isOn = category.show_analytics;

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Категория</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ margin: 0 }}><strong>Название:</strong> {category.name}</p>

                    {/* show_analytics toggle */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: 8,
                        border: `1px solid ${isOn ? 'var(--brand-subtle-bd)' : 'var(--border)'}`,
                        background: isOn ? 'var(--brand-subtle)' : 'var(--surface-sunken)',
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                                Показывать в аналитике
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {isOn
                                    ? 'Категория включена во все графики аналитики'
                                    : 'Скрыта из графика «Расходы по категориям»'}
                            </div>
                        </div>
                        <button
                            onClick={handleToggleAnalytics}
                            disabled={loading}
                            style={{
                                flexShrink: 0, marginLeft: 12,
                                padding: '6px 14px', borderRadius: 6, border: 'none',
                                fontSize: 12, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                                fontFamily: 'inherit',
                                background: isOn ? 'var(--brand)' : 'var(--surface-card)',
                                color: isOn ? '#fff' : 'var(--text-muted)',
                                boxShadow: isOn ? '0 2px 8px rgba(62,224,122,.3)' : 'none',
                                transition: 'all .15s',
                            }}
                        >
                            {loading ? '...' : isOn ? 'Включено' : 'Выключено'}
                        </button>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-danger" onClick={() => onDelete(category.id)}>
                        Удалить
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}