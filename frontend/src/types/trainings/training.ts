import {Exercise} from "./exercise";

export interface Training {
    id: number;
    name: string;
    date: string;
    user_id: number;
    training_exercises: ExerciseTraining;
}

export interface TrainingCreate {
    name: string;
    date: string;
}

export interface TrainingUpdate {
    name?: string;
    date?: string;
}

export interface TrainingFilter {
    page?: number;
    size?: number;
}

export interface ExerciseTraining {
    id: number;
    exercise_id: number;
    training_id: number;
    exercise: Exercise;
    quantity: number;
    weight: number;
}

export interface ExerciseTrainingCreate {
    training_id: number;
    exercise_id: number;
    quantity?: number;
    weight?: number;
}

export interface ExerciseTrainingUpdate {
    quantity?: number;
    weight?: number;
}