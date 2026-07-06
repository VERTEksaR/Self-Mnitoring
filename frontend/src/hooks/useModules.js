import { useEffect, useState } from 'react';
import { getMyModules } from '../api/api';

// Возвращает набор имён модулей (Modules.name), доступных текущему пользователю.
export function useModules() {
    const [modules, setModules] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyModules()
            .then(res => setModules(new Set(res.data.map(m => m.module.name))))
            .catch(err => {
                console.error('[Modules] load failed:', err?.response?.status);
                setModules(new Set());
            })
            .finally(() => setLoading(false));
    }, []);

    return { modules, loading };
}
