export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Language {
    id: number;
    name: string;
    code?: string | null;
    current_level: LanguageLevel;
    target_level: LanguageLevel;
    user_id: number;
}

export interface LanguageCreate {
    name: string;
    code?: string | null;
    current_level: LanguageLevel;
    target_level: LanguageLevel;
}

export interface LanguageChange {
    name?: string;
    code?: string | null;
    current_level?: LanguageLevel;
    target_level?: LanguageLevel;
}