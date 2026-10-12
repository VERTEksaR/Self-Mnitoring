export interface Tag {
    id: number;
    name: string;
    language_id: number;
}

export interface TagCreate {
    name: string;
}

export interface TagChange {
    name?: string;
}