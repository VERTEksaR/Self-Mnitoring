import type { LanguageLevel } from "../types/languages/language";
import type { Note } from "../types/languages/notes";
import type { PartOfSpeech, Word, WordCreate } from "../types/languages/words";
import type {StudySession, StudySessionCreate, StudyType} from "../types/languages/studySession";

export const LANGUAGE_LEVELS: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const PARTS_OF_SPEECH: PartOfSpeech[] = [
    "Существительное", "Глагол", "Прилагательное", "Наречие", "Местоимение",
    "Числительное", "Предлог", "Союз", "Междометие", "Фраза",
];

export const LANGUAGE_FORM_DEFAULT = { name: "", code: "", current_level: "A1", target_level: "B2" };
export const WORD_FORM_DEFAULT = {
    word: "", translation: "", transcription: "", part_of_speech: "", example: "", note: "",
    tag_ids: [] as number[],
};

export const emptyToNull = (value: string) => (value.trim() === "" ? null : value.trim());

export type WordForm = typeof WORD_FORM_DEFAULT & { id?: number };

export const wordToForm = (w: Word): WordForm => ({
    id: w.id, word: w.word, translation: w.translation,
    transcription: w.transcription ?? "", part_of_speech: w.part_of_speech ?? "",
    example: w.example ?? "", note: w.note ?? "", tag_ids: w.tags.map(t => t.id),
});

export const formToWord = (f: WordForm): WordCreate => ({
    word: f.word.trim(), translation: f.translation.trim(),
    transcription: emptyToNull(f.transcription),
    part_of_speech: (f.part_of_speech || null) as PartOfSpeech | null,
    example: emptyToNull(f.example), note: emptyToNull(f.note), tag_ids: f.tag_ids,
});

export const NOTE_FORM_DEFAULT = { title: "", content: "" };

export type NoteForm = typeof NOTE_FORM_DEFAULT & { id?: number };

export const noteToForm = (n: Note): NoteForm => ({ id: n.id, title: n.title, content: n.content });

// «8 окт. 2026 г., 13:08»; если конспект правили — дата правки
export const formatNoteDate = (n: Note) => new Date(n.updated_at ?? n.created_at)
    .toLocaleString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const wordStatus = (box: number) => (box === 0 ? "Новое" : box >= 5 ? "Выучено" : "Изучаю");

export const wordStatusStyle = (box: number) =>
    box === 0 ? { color: "var(--text-muted)", background: "var(--surface-sunken)", border: "1px solid var(--border)" }       // Новое
    : box >= 5 ? { color: "var(--brand-on)", background: "var(--brand)", border: "1px solid var(--brand)" }                   // Выучено — залитый
    : { color: "var(--brand)", background: "var(--brand-subtle)", border: "1px solid var(--brand-subtle-bd)" };     // Изучаю — контур

export const STUDY_TYPES: StudyType[] = ["Слова", "Грамматика", "Чтение", "Аудирование", "Говорение", "Письмо"];

// YYYY-MM-DD по местному времени. toISOString() дал бы дату по UTC: в 01:00 по Москве это ещё «вчера»
export const todayISO = () => new Date().toLocaleDateString("sv-SE");
export const daysAgoISO = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString("sv-SE"); };

// Функция, а не константа: дата берётся в момент открытия формы, а не при загрузке страницы
export const studyFormDefault = () => ({ study_date: todayISO(), minutes: "30", study_type: "Слова" as StudyType, comment: "" });
export type StudyForm = ReturnType<typeof studyFormDefault> & { id?: number };

export const studyToForm = (s: StudySession): StudyForm => ({
    id: s.id, study_date: s.study_date, minutes: String(s.minutes), study_type: s.study_type, comment: s.comment ?? "",
});

export const formToStudy = (f: StudyForm): StudySessionCreate => ({
    study_date: f.study_date, minutes: Number(f.minutes), study_type: f.study_type, comment: emptyToNull(f.comment),
});

export const formatMinutes = (m: number) => {
    const h = Math.floor(m / 60), rest = m % 60;
    return h === 0 ? `${rest} мин` : rest === 0 ? `${h} ч` : `${h} ч ${rest} мин`;
};

// 1 слово, 2 слова, 5 слов, 21 слово, 11 слов
export const pluralLabel = (n: number, words: Array<string>) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return words[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return words[1];
    return words[2];
};

export const formatStudyDate = (iso: string) =>
    new Date(iso + "T00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" });
