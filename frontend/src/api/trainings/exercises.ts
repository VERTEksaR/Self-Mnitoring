import api from "../api";
import type { Exercise, ExerciseFilter, ExerciseCreate, ExerciseUpdate } from "../../types/trainings/exercise";
import type { Page } from "../../types/common/page";

export async function getExercises(params: ExerciseFilter = {}): Promise<Page<Exercise>> {
    const response = await api.get("exercises/", { params });
    return response.data;
}

export async function createExercise(payload: ExerciseCreate): Promise<Exercise> {
    const response = await api.post("exercises/", payload);
    return response.data;
}

export async function updateExercise(exercise_id: number, payload: ExerciseUpdate): Promise<Exercise> {
    const response = await api.patch(`exercises/${exercise_id}/`, payload);
    return response.data;
}

export async function deleteExercise(exercise_id: number): Promise<void> {
    await api.delete(`exercises/${exercise_id}/`);
}