import api from "../api";
import type { ReviewBatch } from "../../types/languages/review";
import type { Word } from "../../types/languages/words";

export async function getReview(language_id: number, limit = 20): Promise<ReviewBatch> {
    const response = await api.get(`languages/${language_id}/review/`, { params: { limit } });
    return response.data;
}

export async function answerReview(language_id: number, word_id: number, remembered: boolean): Promise<Word> {
    const response = await api.post(`languages/${language_id}/words/${word_id}/review/`, { remembered });
    return response.data;
}