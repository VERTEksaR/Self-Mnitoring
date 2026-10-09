import api from "../api";
import type { TagChange, Tag, TagCreate } from "../../types/languages/tags";

export async function getTags(language_id: number): Promise<Tag[]> {
    const response = await api.get(`languages/${language_id}/tags/`);
    return response.data;
}

export async function createTag(language_id: number, payload: TagCreate): Promise<Tag> {
    const response = await api.post(`languages/${language_id}/tags/`, payload);
    return response.data;
}

export async function updateTag(language_id: number, tag_id: number, payload: TagChange): Promise<Tag> {
    const response = await api.patch(`languages/${language_id}/tags/${tag_id}/`, payload);
    return response.data;
}

export async function deleteTag(language_id: number, tag_id: number): Promise<void> {
    await api.delete(`languages/${language_id}/tags/${tag_id}/`);
}