import api from "../api";
import type { Language, LanguageChange, LanguageCreate } from "../../types/languages/language";

export async function getLanguages(): Promise<Language[]> {
    const response = await api.get("languages/");
    return response.data;
}

export async function createLanguage(payload: LanguageCreate): Promise<Language> {
    const response = await api.post("languages/", payload);
    return response.data;
}

export async function updateLanguage(language_id: number, payload: LanguageChange): Promise<Language> {
    const response = await api.patch(`languages/${language_id}/`, payload);
    return response.data;
}

export async function getLanguage(language_id: number): Promise<Language> {
    const response = await api.get(`languages/${language_id}/`);
    return response.data;
}

export async function deleteLanguage(language_id: number): Promise<void> {
    await api.delete(`languages/${language_id}/`);
}