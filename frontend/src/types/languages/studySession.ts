import type { Page } from "../common/page";

export type StudyType = "Слова" | "Грамматика" | "Чтение" | "Аудирование" | "Говорение" | "Письмо";


export interface StudySession {
    id: number;
    study_date: string;
    minutes: number;
    study_type: StudyType;
    comment?: string | null;
    created_at: string;
    language_id: number;
    user_id: number;
}

export interface StudySessionCreate {
    study_date: string;
    minutes: number;
    study_type: StudyType;
    comment?: string | null;
}

export type StudySessionChange = Partial<StudySessionCreate>

export interface StudySessionFilter {
    page?: number;
    size?: number;
    date_from?: string;
    date_to?: string;
    study_type?: StudyType;
}

export interface StudySessionPage extends Page<StudySession> {
    total_minutes: number;
}