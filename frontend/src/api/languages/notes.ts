import api from "../api";
import type { Note, NoteCreate, NoteFilter, NoteChange } from "../../types/languages/notes";
import type { Page } from "../../types/common/page";

export async function getNotes(language_id: number, params: NoteFilter = {}): Promise<Page<Note>> {
    const response = await api.get(`languages/${language_id}/notes/`, { params });
    return response.data;
}

export async function createNote(language_id: number, payload: NoteCreate): Promise<Note> {
    const response = await api.post(`languages/${language_id}/notes/`, payload);
    return response.data;
}

export async function updateNote(language_id: number, note_id: number, payload: NoteChange): Promise<Note> {
    const response = await api.patch(`languages/${language_id}/notes/${note_id}/`, payload);
    return response.data;
}

export async function getNote(language_id: number, note_id: number): Promise<Note> {
    const response = await api.get(`languages/${language_id}/notes/${note_id}/`);
    return response.data;
}

export async function deleteNote(language_id: number, note_id: number): Promise<void> {
    await api.delete(`languages/${language_id}/notes/${note_id}/`);
}