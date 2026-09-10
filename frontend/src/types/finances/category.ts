export interface Category {
    id: number;
    name: string;
    user_id: string;
    show_analytics: boolean;
}

export interface CategoryCreate {
    name: string;
    show_analytics?: boolean;
}

export interface CategoryChange {
    name?: string;
    show_analytics?: boolean;
}

export interface CategoryFilter {
    name?: string;
    page?: number;
    size?: number;
}