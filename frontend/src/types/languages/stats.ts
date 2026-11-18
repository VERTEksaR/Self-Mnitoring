import type { StudyType } from "./studySession";

export interface WeekStat {
    week: string;   // понедельник недели
    words_added: number;
    words_learned: number;
    reviews: number;
    remembered: number;
    minutes: number;
}

export interface TypeMinutes {
    study_type: StudyType;
    minutes: number;
}

export interface LanguageStats {
    total_words: number;
    learned_words: number;
    due_today: number;
    streak_days: number;
    period_reviews: number;
    period_accuracy: number | null;   // null — ответов за период не было
    period_minutes: number;
    weeks: WeekStat[];
    minutes_by_type: TypeMinutes[];
}