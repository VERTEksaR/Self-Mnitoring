import axios from "axios";

// baseURL — относительный путь, запросы проксируются через Vite на localhost:8000
// paramsSerializer: массивы сериализуются как ?id=1&id=2, как ожидает FastAPI (не ?id[]=1)
const api = axios.create({
    baseURL: '/',
    paramsSerializer: (params) => {
        const sp = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null) continue;
            if (Array.isArray(value)) {
                value.forEach(v => sp.append(key, v));
            } else {
                sp.append(key, value);
            }
        }
        return sp.toString();
    },
});

// Автоматически добавляем токен из localStorage в каждый запрос
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

// DELETE используют path-параметр /{id}, как ожидает бэк
export const deleteTransaction = (id) => api.delete(`transactions/${id}`);
export const deleteCategory = (id) => api.delete(`categories/${id}`);
export const deleteAccount = (id) => api.delete(`accounts/${id}`);

export const getTransactions = (params) => api.get('transactions/', { params });
export const getCategories = () => api.get('categories/');
export const getAccounts = () => api.get('accounts/');

export const createTransaction = (data) => api.post('transactions/', data);
export const updateTransaction = (id, data) => api.patch(`transactions/${id}`, data);

export const createCategory = (data) => api.post('categories/', data);
export const createAccount = (data) => api.post('accounts/', data);