import api from './api';

export const getCategories = () => api.get('categories/');
export const getTransactions = (params) => api.get('transactions/', { params });
export const getAccounts = () => api.get('accounts/');
