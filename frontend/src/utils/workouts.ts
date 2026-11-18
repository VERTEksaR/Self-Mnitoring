export const fmtNum = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

export const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };

export const WK_RED = '#ff3b4e';

export const MUSCLE_COLORS = ['#ff3b4e','#ff6b35','#ffd700','#3ee07a','#06b6d4','#6366f1','#ec4899'];

export function getWeekKey(iso) {
    const d   = new Date(iso + 'T00:00:00');
    const dow = d.getDay();
    const mon = new Date(d.getTime() + (dow === 0 ? -6 : 1 - dow) * 86400000);
    return mon.toISOString().slice(0, 10);
}

const MONTH_NAMES   = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

function monthLabel(key) { const [y, m] = key.split('-'); return `${MONTH_NAMES[Number(m)-1]} ${y.slice(2)}`; }

function weekLabel(key)  { const [, m, d] = key.split('-'); return `${Number(d)}.${m}`; }

export function bucketOf(iso, gran)    { return gran === 'month' ? iso.slice(0, 7) : getWeekKey(iso); }

export function bucketLblOf(key, gran) { return gran === 'month' ? monthLabel(key) : weekLabel(key); }

export const TODAY= new Date().toISOString().slice(0, 10);

export const YEAR_START = `${new Date().getFullYear()}-01-01`;

export const EX_FORM_DEFAULT = { name: '', muscle_group: 'Грудь', exercise_type: 'Силовое' };

export const WK_RED_SUBTLE = 'rgba(255,59,78,.14)';

export const WK_RED_BD = 'rgba(255,59,78,.36)';

export const MUSCLE_GROUPS = ['Ноги', 'Грудь', 'Бицепс', 'Трицепс', 'Спина', 'Плечи', 'Пресс'];

export const EXERCISE_TYPES = ['Силовое', 'Кардио', 'Растяжка'];

export const HISTORY_LIMIT = 15;