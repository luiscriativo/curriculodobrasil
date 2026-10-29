// Datas dos currículos: o usuário digita do jeito que quiser ("03/2020", "mar 2020", "2020",
// "2020-03") e o modelo mostra no formato escolhido. O que não for reconhecido aparece como foi digitado.

const MONTHS = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
};
const MONTHS_LONG = {
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};
const PRESENT = { pt: 'Atual', en: 'Present', es: 'Actual' };

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function monthFromName(word) {
  const w = strip(word).replace(/\./g, '');
  if (w.length < 3) return null;
  for (const lang of Object.keys(MONTHS_LONG)) {
    const i = MONTHS_LONG[lang].findIndex((m, k) => strip(m).startsWith(w) || strip(MONTHS[lang][k]) === w);
    if (i >= 0) return i + 1;
  }
  return null;
}

/** "03/2020" | "3-2020" | "2020-03" | "mar 2020" | "março de 2020" | "2020" → { y, m } (m pode ser null) */
export function parseDate(input) {
  const s = String(input ?? '').trim();
  if (!s) return null;
  let m;
  if ((m = s.match(/^(\d{1,2})\s*[/.\-]\s*(\d{4})$/))) {
    const mo = +m[1];
    return mo >= 1 && mo <= 12 ? { y: +m[2], m: mo } : null;
  }
  if ((m = s.match(/^(\d{4})\s*[/.\-]\s*(\d{1,2})$/))) {
    const mo = +m[2];
    return mo >= 1 && mo <= 12 ? { y: +m[1], m: mo } : null;
  }
  if ((m = s.match(/^(\d{4})$/))) return { y: +m[1], m: null };
  if ((m = s.match(/^([a-zA-ZÀ-ÿ.]+)\s*(?:de\s+|\/\s*)?(\d{4})$/))) {
    const mo = monthFromName(m[1]);
    return mo ? { y: +m[2], m: mo } : null;
  }
  return null;
}

/**
 * Formatos: 'mm/yyyy' (03/2020), 'mon yyyy' (mar 2020), 'month yyyy' (março 2020), 'yyyy' (2020)
 */
export function formatDate(input, format = 'mm/yyyy', lang = 'pt') {
  const d = parseDate(input);
  if (!d) return String(input ?? '').trim();
  if (!d.m || format === 'yyyy') return String(d.y);
  const L = MONTHS[lang] ? lang : 'pt';
  if (format === 'mon yyyy') return `${MONTHS[L][d.m - 1]} ${d.y}`;
  if (format === 'month yyyy') return `${MONTHS_LONG[L][d.m - 1]}${L === 'en' ? '' : ' de'} ${d.y}`;
  return `${String(d.m).padStart(2, '0')}/${d.y}`;
}

/** Período "03/2020 — Atual". Só um dos lados preenchido também funciona. */
export function formatRange(start, end, current, format = 'mm/yyyy', lang = 'pt', sep = ' — ') {
  const a = formatDate(start, format, lang);
  const b = current ? (PRESENT[lang] || PRESENT.pt) : formatDate(end, format, lang);
  if (a && b) return a === b ? a : `${a}${sep}${b}`;
  return a || b || '';
}

/** Meses entre duas datas (para o resumo "3 anos e 2 meses" e a análise ATS). */
export function monthsBetween(start, end, current, now = new Date()) {
  const a = parseDate(start);
  const b = current ? { y: now.getFullYear(), m: now.getMonth() + 1 } : parseDate(end);
  if (!a || !b) return null;
  const diff = (b.y - a.y) * 12 + ((b.m || 12) - (a.m || 1)) + 1;
  return diff > 0 ? diff : null;
}

export function formatDuration(months, lang = 'pt') {
  if (!months) return '';
  const y = Math.floor(months / 12), m = months % 12;
  const W = {
    pt: [(n) => (n === 1 ? 'ano' : 'anos'), (n) => (n === 1 ? 'mês' : 'meses'), ' e '],
    en: [(n) => (n === 1 ? 'year' : 'years'), (n) => (n === 1 ? 'month' : 'months'), ' '],
    es: [(n) => (n === 1 ? 'año' : 'años'), (n) => (n === 1 ? 'mes' : 'meses'), ' y '],
  }[lang] || null;
  const [Y, M, and] = W || [(n) => (n === 1 ? 'ano' : 'anos'), (n) => (n === 1 ? 'mês' : 'meses'), ' e '];
  const parts = [];
  if (y) parts.push(`${y} ${Y(y)}`);
  if (m) parts.push(`${m} ${M(m)}`);
  return parts.join(and);
}

/** "Hoje", "Ontem", "12 de fev. de 2026" — agrupamento da lista de currículos. */
export function dayLabel(ts, now = new Date()) {
  const d = new Date(ts);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / 86400000);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) {
    const w = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "agora", "há 5 min", "há 2 h", "há 3 dias" */
export function timeAgo(ts, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return 'agora';
  const min = Math.round(s / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `há ${mo} ${mo === 1 ? 'mês' : 'meses'}`;
  const y = Math.round(mo / 12);
  return `há ${y} ${y === 1 ? 'ano' : 'anos'}`;
}
