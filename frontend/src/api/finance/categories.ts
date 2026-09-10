import api from "../api";
import type { Category, CategoryChange, CategoryCreate, CategoryFilter } from "../../types/finances/category";
import type {Page} from "../../types/common/page";

export async function getCategories(params: CategoryFilter = {}): Promise<Page<Category>> {
    const response = await api.get("categories/", { params });
    return response.data;
}

export async function deleteCategory(category_id: number): Promise<void> {
    await api.delete(`categories/${category_id}/`)
}

export async function createCategory(payload: CategoryCreate): Promise<Category> {
    const response = await api.post("categories/", payload);
    return response.data;
}

export async function updateCategory(category_id: number, payload: CategoryChange): Promise<Category> {
    const result = await api.patch(`categories/${category_id}`, payload);
    return result.data;
}