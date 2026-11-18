import api from "../api";
import type {
    Bank,
    BankCreate,
    BankChange,
    BankFilter
} from '../../types/finances/bank';
import type { Page } from "../../types/common/page";

export async function getBanks(params: BankFilter = {}): Promise<Page<Bank>> {
    const response = await api.get("banks/", { params });
    return response.data;
}

export async function getAllBanks(): Promise<Bank[]> {
    const banks: Bank[] = [];
    let page = 1;

    while (true) {
        const result = await getBanks({ page, size: 100 });
        banks.push(...result.items);

        if (page >= result.pages) {
            return banks;
        }

        page += 1;
    }
}

export async function createBank(payload: BankCreate): Promise<Bank> {
    const response = await api.post("banks/", payload);
    return response.data;
}

export async function updateBank(bankId: number, payload: BankChange): Promise<Bank> {
    const response = await api.patch(`banks/${bankId}/`, payload);
    return response.data;
}

export async function deleteBank(bankId: number): Promise<void> {
    await api.delete(`banks/${bankId}/`);
}
