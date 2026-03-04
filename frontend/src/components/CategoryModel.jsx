import { useEffect, useState } from 'react';

import { createCategory } from '../api/api';
import { CategoryForm } from './CategoryForm';


export function AddCategoryModel({ onClose, onSaved }) {
    const [form, setForm] = useState({
        name: '',
    });

    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown',  onEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form
        };

        try {
            const res = await createCategory(payload);
            onSaved(res.data);
            onClose();
        } catch (err) {
            console.log(err.response?.data || err);
        }
    };

    return (
        <CategoryForm
            form={form}
            setForm={setForm}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}


export function CategoryModel({ category, onClose, onDelete }) {
    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose]);

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h3>Детали категории</h3>

                <p><strong>Наименование:</strong> {category.name} </p>

                <button onClick={() => onDelete(category.id)}>
                    Удалить
                </button>

                <button onClick={onClose}>
                    Закрыть
                </button>
            </div>
        </div>
    );
}


const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "8px",
  minWidth: "300px",
};