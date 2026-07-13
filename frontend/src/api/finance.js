import api from './api';

export const getCategories = () => api.get('categories/');
export const getTransactions = (params) => api.get('transactions/', { params });
export const getAccounts = () => api.get('accounts/');

export const getSavingsAccounts = () => api.get('accounts/savings');
export const getSavingsTrend = (months = 6) => api.get('accounts/savings/trend', { params: { months } });
