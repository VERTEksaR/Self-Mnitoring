import api from "../api";
import type { StudyType, StudySession, StudySessionCreate, StudySessionFilter, StudySessionPage, StudySessionChange } from "../../types/languages/studySession";

export async function getStudySessions(language_id: number, params: StudySessionFilter): Promise<StudySessionPage> {
    const response = await api.get(`languages/${language_id}/sessions/`, { params });
    return response.data;
}

export async function createStudySession(language_id: number, payload: StudySessionCreate): Promise<StudySession> {
    const response = await api.post(`languages/${language_id}/sessions/`, payload);
    return response.data;
}

export async function updateStudySession(language_id: number, study_id: number, payload: StudySessionChange): Promise<StudySession> {
    const response = await api.patch(`languages/${language_id}/sessions/${study_id}/`, payload);
    return response.data;
}

export async function deleteStudySession(language_id: number, study_id: number): Promise<void> {
    await api.delete(`languages/${language_id}/sessions/${study_id}/`);
}