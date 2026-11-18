import { useEffect } from 'react';

// Вешает класс на <body>, пока страница открыта (тема модуля: цвета, фон), и снимает при уходе
export function useBodyClass(className) {
    useEffect(() => {
        document.body.classList.add(className);
        return () => document.body.classList.remove(className);
    }, [className]);
}
