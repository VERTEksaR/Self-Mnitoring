import api from './api';

export const getExercises = (params) => api.get('exercises/', { params });
export const createExercise = (data) => api.post('exercises/', data);
export const updateExercise = (id, data) => api.patch(`exercises/${id}`, data);
export const deleteExercise = (id) => api.delete(`exercises/${id}`);

export const getTrainings = (params) => api.get('trainings/', { params });
export const createTraining = (data) => api.post('trainings/', data);
export const updateTraining = (id, data) => api.patch(`trainings/${id}`, data);
export const deleteTraining = (id) => api.delete(`trainings/${id}`);
