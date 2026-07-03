import axios from "axios";

// baseURL — относительный путь, запросы проксируются через Vite на localhost:8000
// paramsSerializer (object-форма для axios v1): массивы → ?id=1&id=2, как ждёт FastAPI
const api = axios.create({
    baseURL: '/',
    paramsSerializer: {
        serialize: (params) => {
            const sp = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value === undefined || value === null) continue;
                if (Array.isArray(value)) {
                    value.forEach(v => sp.append(key, String(v)));
                } else {
                    sp.append(key, String(value));
                }
            }
            return sp.toString();
        },
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

// При 401 (кроме самого логина) — токен протух, выкидываем на страницу входа
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginEndpoint = error.config?.url?.includes('auth/login');
        if (error.response?.status === 401 && !isLoginEndpoint) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

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
export const updateCategory = (id, data) => api.patch(`categories/${id}`, data);
export const createAccount = (data) => api.post('accounts/', data);

export const getSteamAccounts = () => api.get('steam/accounts');
export const linkSteam = (steam_id) => api.post('steam/link', { steam_id });
export const unlinkSteam = (steam_id) => api.delete(`steam/link/${steam_id}`);
export const getPlayerInfo = (steam_id) => api.get(`steam/player-info/${steam_id}`);

export const getTrackedGames = (steam_id, page = 1, size = 10) =>
    api.get(`steam/tracked-games/${steam_id}`, { params: { page, size } });
export const addTrackedGame = (steam_id, appid) =>
    api.post(`steam/tracked-games/${steam_id}`, { appid });
export const removeTrackedGame = (steam_id, appid) =>
    api.delete(`steam/tracked-games/${steam_id}/${appid}`);
export const getAchievementsSummary = (steam_id, appids) =>
    api.get(`steam/ach-summary/${steam_id}`, { params: { appids } });
export const getAchievementsDetail = (steam_id, appid) =>
    api.get(`steam/ach-detail/${steam_id}/${appid}`);