import api from "../api";
import type {
    Account,
    AccountChange, AccountCreate,
    AccountFilter,
    AccountSavings, AccountSavingsTrend,
    AccountSavingsTrendFilter
} from "../../types/finances/account";
import type {Page} from "../../types/common/page";

export async function getAccounts(params: AccountFilter = {}): Promise<Page<Account>> {
    const response = await api.get("accounts/", { params });
    return response.data;
}

export async function getAccountsSavings(): Promise<AccountSavings[]> {
    const response = await api.get("accounts/savings/");
    return response.data;
}

export async function getAccountsSavingsTrend(params: AccountSavingsTrendFilter): Promise<AccountSavingsTrend[]> {
    const response = await api.get("accounts/savings/trend/", { params });
    return response.data;
}

export async function deleteAccount(account_id: number): Promise<void> {
    await api.delete(`accounts/${account_id}/`);
}

export async function createAccount(payload: AccountCreate): Promise<Account> {
    const response = await api.post("accounts/", payload);
    return response.data;
}

export async function updateAccount(account_id: number, payload: AccountChange): Promise<Account> {
    const result = await api.patch(`accounts/${account_id}`, payload);
    return result.data;
}