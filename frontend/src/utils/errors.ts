// Ошибка axios с телом ответа FastAPI: detail — строка (404, 409) или список ошибок валидации (422)
type ApiError = { response?: { data?: { detail?: string | { loc?: (string | number)[]; msg: string }[] } } };

export function extractErrorMessage(err: ApiError, fallback: string): string {
    const detail = err.response?.data?.detail;
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail
            .map(d => {
                const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null;
                return field ? `${field}: ${d.msg}` : d.msg;
            })
            .filter(Boolean)
            .join('; ') || fallback;
    }
    return fallback;
}