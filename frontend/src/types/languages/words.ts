import type { Tag } from "./tags";

export type PartOfSpeech =
    | "Существительное" | "Глагол" | "Прилагательное" | "Наречие" | "Местоимение"
    | "Числительное" | "Предлог" | "Союз" | "Междометие" | "Фраза";

export interface Word {
    id: number;
    word: string;
    translation: string;
    transcription?: string | null;
    part_of_speech?: PartOfSpeech | null;
    example?: string | null;
    note?: string | null;
    created_at: string;
    box: number;
    next_review_date?: string | null;
    language_id: number;
    user_id: number;
    tags: Tag[];
}

export interface WordCreate {
    word: string;
    translation: string;
    transcription?: string | null;
    part_of_speech?: PartOfSpeech | null;
    example?: string | null;
    note?: string | null;
    tag_ids?: number[];
}

export interface WordChange {
    word?: string;
    translation?: string;
    transcription?: string | null;
    part_of_speech?: PartOfSpeech | null;
    example?: string | null;
    note?: string | null;
    tag_ids?: number[];
}

export interface WordFilter {
    search?: string;
    page?: number;
    size?: number;
    tag_id?: number;
}