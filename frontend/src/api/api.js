import axios from "axios";


const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

export default api;

export const deleteTransaction = (id) => {
    return api.delete(`finance/transaction/?id=${id}`)
};

export const deleteCategory = (id) => {
    return api.delete(`finance/category/?id=${id}`)
};

export const deleteAccount = (id) => {
    return api.delete(`finance/account/?id=${id}`)
};

export const getTransactions = (params) => {
    return api.get(`finance/transactions/`, params)
};

export const getCategories = () => {
    return api.get(`finance/categories/`)
};

export const getAccounts = () => {
    return api.get(`finance/accounts/`)
};

export const createTransaction = (data) => {
    return api.post(`finance/transactions/`, data)
};

export const updateTransaction = (id, data) => {
    return api.patch(`finance/transaction/?id=${id}`, data)
};

export const createCategory = (data) => {
    return api.post(`finance/categories/`, data)
};

export const createAccount = (data) => {
    return api.post(`finance/accounts/`, data)
};