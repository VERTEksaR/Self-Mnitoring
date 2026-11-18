// Local SVG assets from flagcdn.com. Country codes differ from language codes.
const FLAGS = new Map([
    ['de', 'de'], ['en', 'gb'], ['pl', 'pl'], ['fr', 'fr'],
    ['es', 'es'], ['it', 'it'], ['pt', 'pt'], ['nl', 'nl'],
    ['sv', 'se'], ['no', 'no'], ['nb', 'no'], ['nn', 'no'],
    ['da', 'dk'], ['fi', 'fi'], ['cs', 'cz'], ['uk', 'ua'],
    ['ru', 'ru'], ['tr', 'tr'], ['el', 'gr'], ['ja', 'jp'],
    ['ko', 'kr'], ['zh', 'cn'],
]);

export function getLanguageFlag(code) {
    const language = typeof code === 'string' ? code.trim().toLowerCase().split(/[-_]/)[0] : '';
    const country = FLAGS.get(language);
    return country ? `/images/flags/flag-${country}.svg` : null;
}
