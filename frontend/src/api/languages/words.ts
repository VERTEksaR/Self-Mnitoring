import api from "../api";
import type { Word, WordCreate, WordFilter, WordChange } from "../../types/languages/words";
import type { Page } from "../../types/common/page";

export async function getWords(language_id: number, params: WordFilter = {}): Promise<Page<Word>> {
    const response = await api.get(`languages/${language_id}/words/`, { params });
    return response.data;
}

export async function createWord(language_id: number, payload: WordCreate): Promise<Word> {
    const response = await api.post(`languages/${language_id}/words/`, payload);
    return response.data;
}

export async function updateWord(language_id: number, word_id: number, payload: WordChange): Promise<Word> {
    const response = await api.patch(`languages/${language_id}/words/${word_id}/`, payload);
    return response.data;
}

export async function getWord(language_id: number, word_id: number): Promise<Word> {
    const response = await api.get(`languages/${language_id}/words/${word_id}/`);
    return response.data;
}

export async function deleteWord(language_id: number, word_id: number): Promise<void> {
    await api.delete(`languages/${language_id}/words/${word_id}/`);
}