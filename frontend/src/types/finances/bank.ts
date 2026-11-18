export interface Bank {
    id: number;
    name: string;
    user_id: number;
}

export interface BankCreate {
    name: string;
}

export interface BankChange {
    name?: string;
}

export interface BankFilter {
    name?: string;
    page?: number;
    size?: number;
}