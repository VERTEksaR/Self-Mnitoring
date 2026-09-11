export interface Account {
    id: number;
    name: string;
    user_id: number;
    account_type: "Обычный" | "Накопительный" | "Инвестиционный";
    goal_amount?: string;
}

export interface AccountCreate {
    name: string;
    account_type: "Обычный" | "Накопительный" | "Инвестиционный";
    goal_amount?: number;
}

export interface AccountChange {
    name?: string;
    account_type?: "Обычный" | "Накопительный" | "Инвестиционный";
    goal_amount?: number;
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