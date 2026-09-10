export interface Transaction {
    id: number;
    destination: string;
    amount: number;
    cashback: number;
    replenishment: boolean;
    transaction_date: string;
    category_id: number;
    account_id: number;
    user_id: number;
}

export interface TransactionCreate {
    destination: string;
    amount: number;
    cashback: number;
    replenishment: boolean;
    transaction_date: string;
    category_id: number;
    account_id: number;
}

export interface TransactionChange {
    destination?: string;
    amount?: number;
    cashback?: number;
    replenishment?: boolean;
    transaction_date?: string;
    category_id?: number;
    account_id?: number;
}

export interface TransactionFilter {
    page?: number;
    size?: number;
    destination?: string;
    min_amount?: number;
    max_amount?: number;
    amount?: number;
    min_cashback?: number;
    max_cashback?: number;
    cashback?: number;
    transaction_date_from?: string;
    transaction_date_to?: string;
    transaction_date?: string;
    category_id?: number[];
    account_id?: number[];
}