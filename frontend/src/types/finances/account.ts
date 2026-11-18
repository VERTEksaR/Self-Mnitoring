export interface Account {
    id: number;
    name: string;
    user_id: number;
    account_type: "Обычный" | "Накопительный" | "Инвестиционный";
    goal_amount?: string;
    bank_id: number | null;
}

export interface AccountCreate {
    name: string;
    account_type: "Обычный" | "Накопительный" | "Инвестиционный";
    goal_amount?: number | null;
    bank_id?: number | null
}

export interface AccountChange {
    name?: string;
    account_type?: "Обычный" | "Накопительный" | "Инвестиционный";
    goal_amount?: number | null;
    bank_id?: number | null;
}

export interface AccountFilter {
    name?: string;
    page?: number;
    size?: number;
}

export interface AccountSavings {
    account_id: number;
    account_name: string;
    balance: number;
}

export interface AccountSavingsTrend {
    month: string;
    net: number;
}

export interface AccountSavingsTrendFilter {
    months: number;
}