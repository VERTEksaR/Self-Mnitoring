import axios from "axios";

// baseURL — относительный путь, запросы проксируются через Vite на localhost:8000
const api = axios.create({
    baseURL: '/',
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