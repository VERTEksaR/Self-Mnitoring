import type { LanguageLevel } from "../types/languages/language";
import type { Note } from "../types/languages/notes";
import type { PartOfSpeech, Word, WordCreate } from "../types/languages/words";

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