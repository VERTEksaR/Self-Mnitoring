import type { Word } from "./words";

export interface ReviewBatch {
    items: Word[];
    total: number;
}

export interface ReviewAnswer {
    remembered: boolean;
}