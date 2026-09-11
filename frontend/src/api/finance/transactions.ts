import type {
    Transaction,
    TransactionChange,
    TransactionCreate,
    TransactionFilter
} from "../../types/finances/transaction";
import type {Page} from "../../types/common/page";
import api from "../api";

export async function getTransactions(params: TransactionFilter = {}): Promise<Page<Transaction>> {
    const response = await api.get("transactions/", { params });
    return response.data;
}

export async function deleteTransaction(transaction_id: number): Promise<void> {
    await api.delete(`transactions/${transaction_id}/`);
}

export async function createTransaction(payload: TransactionCreate): Promise<Transaction> {
    const response = await api.post("transactions/", payload);
    return response.data;
}

export async function updateTransaction(transaction_id: number, payload: TransactionChange): Promise<Transaction> {
    const result = await api.patch(`transactions/${transaction_id}`, payload);
    return result.data;
}