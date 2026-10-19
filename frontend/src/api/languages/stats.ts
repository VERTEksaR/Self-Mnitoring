import api from "../api";
import type { LanguageStats } from "../../types/languages/stats";

export async function getStats(language_id: number, weeks = 12): Promise<LanguageStats> {
    const response = await api.get(`languages/${language_id}/stats/`, { params: { weeks } });
    return response.data;
}