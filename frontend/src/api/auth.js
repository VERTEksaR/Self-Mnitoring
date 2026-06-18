import api from './api';

export const loginUser = (data) => api.post('auth/login', data);
export const registerUser = (data) => api.post('auth/register', data);

// Используется после логина, чтобы узнать user_id текущего пользователя
export const getUsers = (params) => api.get('users/', { params });
