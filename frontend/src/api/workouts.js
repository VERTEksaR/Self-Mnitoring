import api from './api';

export const getExercises = (params) => api.get('exercises/', { params });
export const createExercise = (data) => api.post('exercises/', data);
export const updateExercise = (id, data) => api.patch(`exercises/${id}`, data);
export const deleteExercise = (id) => api.delete(`exercises/${id}`);

export const getTrainings = (params) => api.get('trainings/', { params });
export const getTraining = (id) => api.get(`trainings/${id}`);
export const createTraining = (data) => api.post('trainings/', data);
export const updateTraining = (id, data) => api.patch(`trainings/${id}`, data);
export const deleteTraining = (id) => api.delete(`trainings/${id}`);

export const createTrainingExercise = (data) =>
    api.post('training-exercises/', data);
export const updateTrainingExercise = (exerciseId, trainingId, data) =>
    api.patch(`training-exercises/ex_training?exercise_id=${exerciseId}&training_id=${trainingId}`, data);
export const deleteTrainingExercise = (exerciseId, trainingId) =>
    api.delete(`training-exercises/ex_training?exercise_id=${exerciseId}&training_id=${trainingId}`);