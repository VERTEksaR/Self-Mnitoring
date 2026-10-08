import type { LanguageLevel } from "../types/languages/language";
import type { PartOfSpeech, Word, WordCreate } from "../types/languages/words";

export const LANGUAGE_LEVELS: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const PARTS_OF_SPEECH: PartOfSpeech[] = [
    "Существительное", "Глагол", "Прилагательное", "Наречие", "Местоимение",
    "Числительное", "Предлог", "Союз", "Междометие", "Фраза",
];

export const LANGUAGE_FORM_DEFAULT = { name: "", code: "", current_level: "A1", target_level: "B2" };
export const WORD_FORM_DEFAULT = {
    word: "", translation: "", transcription: "", part_of_speech: "", example: "", note: "",
};

export const emptyToNull = (value: string) => (value.trim() === "" ? null : value.trim());

export type WordForm = typeof WORD_FORM_DEFAULT & { id?: number };

// Слово из API → форма: null → '', иначе <input value={null}> React считает неуправляемым
export const wordToForm = (w: Word): WordForm => ({
    id: w.id, word: w.word, translation: w.translation,
    transcription: w.transcription ?? "", part_of_speech: w.part_of_speech ?? "",
    example: w.example ?? "", note: w.note ?? "",
});

// Форма → API: '' → null, чтобы при правке можно было стереть необязательное поле
export const formToWord = (f: WordForm): WordCreate => ({
    word: f.word.trim(), translation: f.translation.trim(),
    transcription: emptyToNull(f.transcription),
    part_of_speech: (f.part_of_speech || null) as PartOfSpeech | null,
    example: emptyToNull(f.example), note: emptyToNull(f.note),
});