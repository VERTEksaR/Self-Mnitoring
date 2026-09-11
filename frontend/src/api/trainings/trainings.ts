import api from "../api";
import {
    ExerciseTraining,
    ExerciseTrainingCreate, ExerciseTrainingUpdate,
    Training,
    TrainingCreate,
    TrainingFilter,
    TrainingUpdate
} from "../../types/trainings/training";
import {Page} from "../../types/common/page";

export async function getTrainings(params: TrainingFilter): Promise<Page<Training>> {
    const response = await api.get("trainings/", { params });
    return response.data;
}

export async function getTraining(training_id: number): Promise<Training> {
    const response = await api.get(`trainings/${training_id}/`);
    return response.data;
}

export async function createTraining(payload: TrainingCreate): Promise<Training> {
    const response = await api.post("trainings/", payload);
    return response.data;
}

export async function updateTraining(trainingId: number, payload: TrainingUpdate): Promise<Training> {
    const response = await api.patch(`trainings/${trainingId}/`, payload);
    return response.data;
}

export async function deleteTraining(trainingId: number): Promise<void> {
    await api.delete(`trainings/${trainingId}/`);
}

export async function createTrainingExercise(payload: ExerciseTrainingCreate): Promise<ExerciseTraining> {
    const response = await api.post("training-exercises/", payload);
    return response.data;
}

export async function updateTrainingExercise(exerciseId: number, trainingId: number, payload: ExerciseTrainingUpdate): Promise<ExerciseTraining> {
    const response = await api.patch("training-exercises/ex_training", payload,
        {params: {exerciseId: exerciseId, trainingId: trainingId}});
    return response.data;
}

export async function deleteTrainingExercise(exerciseId: number, trainingId: number): Promise<void> {
    await api.delete("training-exercises/ex_training",
        {params: {exerciseId: exerciseId, trainingId: trainingId}})
}