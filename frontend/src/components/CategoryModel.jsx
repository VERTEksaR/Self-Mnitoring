import { useEffect, useState } from 'react';
import { createCategory } from '../api/api';
import { CategoryForm } from './CategoryForm';


export function AddCategoryModel({ onClose, onSaved }) {
    const [form, setForm] = useState({ name: '' });

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


export function CategoryModel({ category, onClose, onDelete }) {
    useEffect(() => {
        const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Категория</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <p><strong>Название:</strong> {category.name}</p>
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
