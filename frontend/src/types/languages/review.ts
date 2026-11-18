import type { Word } from "./words";

export interface ReviewBatch {
    items: Word[];
    total: number;
}

export interface ReviewAnswer {
    remembered: boolean;
}

export interface ChoiceItem {
    id: number;
    word: string;
    translation: string;
}