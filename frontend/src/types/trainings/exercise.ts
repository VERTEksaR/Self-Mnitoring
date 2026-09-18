export interface Exercise {
    id: number;
    name: string;
    user_id: number;
    muscle_group: "Ноги" | "Грудь" | "Бицепс" | "Трицепс" | "Спина" | "Плечи" | "Пресс";
    exercise_group: "Кардио" | "Силовое" | "Растяжка";
}

export interface ExerciseFilter {
    page?: number;
    size?: number;
}

export interface ExerciseCreate {
    name: string;
    muscle_group: "Ноги" | "Грудь" | "Бицепс" | "Трицепс" | "Спина" | "Плечи" | "Пресс";
    exercise_group: "Кардио" | "Силовое" | "Растяжка";
}

export interface ExerciseUpdate {
    name?: string;
    muscle_group?: "Ноги" | "Грудь" | "Бицепс" | "Трицепс" | "Спина" | "Плечи" | "Пресс";
    exercise_group?: "Кардио" | "Силовое" | "Растяжка";
}