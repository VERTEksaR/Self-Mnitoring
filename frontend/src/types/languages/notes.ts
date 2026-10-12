export interface Note {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at?: string | null;
    language_id: number;
    user_id: number;
}

export interface NoteCreate {
    title: string;
    content: string;
}

export interface NoteChange {
    title?: string;
    content?: string;
}

export interface NoteFilter {
    page?: number;
    size?: number;
}