import api from './api';


export const getCategories = () => api.get('finance/categories/');
export const getTransactions = (params) => api.get('finance/transactions/', { params });
export const getAccounts = () => api.get('finance/accounts/');
