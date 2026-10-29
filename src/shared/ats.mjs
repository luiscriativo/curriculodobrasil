// Análise para sistemas de RH (ATS): checklist do conteúdo e comparação com o texto de uma vaga.
import { parseDate, monthsBetween } from './dates.mjs';
import { SECTION_TYPES, sectionTitle } from './model.mjs';

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Todo o texto visível do currículo, na ordem de leitura (também usado na verificação do PDF). */
export function resumeText(r) {
  const p = r.profile || {};
  const out = [p.name, p.title, p.email, p.phone, p.location, p.website, p.linkedin, p.github, ...(p.extra || []).map((e) => `${e.label} ${e.value}`)];
  for (const s of r.sections || []) {
    if (s.hidden) continue;
    out.push(sectionTitle(s, r.style?.lang));
    if (s.type === 'summary') out.push(s.text);
    for (const it of s.items || []) out.push(it.name, it.role, it.org, it.location, it.description);
  }
  return out.filter(Boolean).join('\n');
}

export function wordCount(text) {
  return (String(text).match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || []).length;
}

const visible = (r, type) => (r.sections || []).filter((s) => s.type === type && !s.hidden);
const items = (r, type) => visible(r, type).flatMap((s) => s.items || []);

/**
 * @param {object} r currículo
 * @param {{ats?: 'alta'|'media'|'baixa', name?: string}} [tpl] informação do modelo escolhido
 * @returns {{score:number, checks:Array<{id:string,status:'ok'|'warn'|'bad'|'info',title:string,detail:string,target?:string,weight:number}>}}
 */
export function analyzeResume(r, tpl = {}) {
  const p = r.profile || {};
  const checks = [];
  const add = (id, ok, weight, title, detail, target, soft = false) =>
    checks.push({ id, status: ok ? 'ok' : soft ? 'warn' : 'bad', title, detail, target, weight });

  add('name', p.name.trim().split(/\s+/).length >= 2, 10, 'Nome completo', p.name.trim() ? 'Use nome e sobrenome.' : 'Preencha seu nome.', 'profile.name');
  add('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim()), 10, 'E-mail válido', p.email.trim() ? 'O e-mail parece incompleto.' : 'Sem e-mail o recrutador não consegue responder.', 'profile.email');
  add('phone', (p.phone.replace(/\D/g, '').length >= 10), 6, 'Telefone com DDD', 'Inclua o DDD, ex.: (11) 98765-4321.', 'profile.phone', true);
  add('location', !!p.location.trim(), 4, 'Cidade e estado', 'Muitas vagas filtram por localização.', 'profile.location', true);
  add('title', !!p.title.trim(), 6, 'Cargo desejado ou atual', 'O título logo abaixo do nome é uma das primeiras palavras-chave lidas.', 'profile.title', true);

  const summary = visible(r, 'summary').map((s) => s.text).join(' ').trim();
  add('summary', summary.length >= 200 && summary.length <= 900, 8, 'Resumo profissional',
    !summary ? 'Escreva 3 a 5 linhas sobre sua experiência e seus resultados.'
      : summary.length < 200 ? `Está curto (${summary.length} caracteres). Busque de 200 a 900.` : `Está longo (${summary.length} caracteres). Busque de 200 a 900.`,
    'section.summary', true);

  const exp = items(r, 'experience').filter((e) => e.role || e.org);
  add('experience', exp.length > 0, 12, 'Experiência profissional', 'Adicione ao menos uma experiência (estágios e trabalhos voluntários também contam).', 'section.experience');
  if (exp.length) {
    const incomplete = exp.filter((e) => !e.role.trim() || !e.org.trim() || !e.start.trim());
    add('exp-complete', incomplete.length === 0, 8, 'Cargo, empresa e início em todas as experiências',
      `${incomplete.length} experiência(s) sem cargo, empresa ou data de início.`, 'section.experience', true);
    const withBullets = exp.filter((e) => /^\s*[-•*–]/m.test(e.description));
    add('bullets', withBullets.length >= Math.ceil(exp.length / 2), 6, 'Conquistas em tópicos',
      'Liste conquistas em tópicos (comece a linha com "- "). O ATS e o recrutador leem mais rápido.', 'section.experience', true);
    add('numbers', exp.some((e) => /\d/.test(e.description)), 6, 'Resultados com números',
      'Inclua números: "aumentei as vendas em 30%", "equipe de 5 pessoas", "R$ 2 milhões".', 'section.experience', true);
  }

  const badDates = [...exp, ...items(r, 'education')].filter((e) => (e.start && !parseDate(e.start)) || (!e.current && e.end && !parseDate(e.end)));
  add('dates', badDates.length === 0, 4, 'Datas em formato reconhecível', 'Use MM/AAAA ou AAAA (ex.: 03/2021). Datas como "ano passado" confundem o ATS.', 'section.experience', true);
  const inverted = exp.filter((e) => e.start && (e.end || e.current) && monthsBetween(e.start, e.end, e.current) === null && parseDate(e.start) && (e.current || parseDate(e.end)));
  if (inverted.length) add('order', false, 3, 'Início antes do fim', `${inverted.length} experiência(s) com data de término antes do início.`, 'section.experience', true);

  add('education', items(r, 'education').some((e) => e.role || e.org), 8, 'Formação', 'Inclua sua formação mais alta (curso e instituição).', 'section.education', true);
  const skills = items(r, 'skills').filter((s) => s.name.trim());
  add('skills', skills.length >= 5, 8, 'Habilidades (5 ou mais)', `Você tem ${skills.length}. Liste ferramentas e competências que aparecem nas vagas.`, 'section.skills', true);
  add('linkedin', !!p.linkedin.trim(), 3, 'LinkedIn', 'Recrutadores costumam conferir o perfil.', 'profile.linkedin', true);

  const words = wordCount(resumeText(r));
  add('length', words >= 150 && words <= 1100, 4, 'Tamanho adequado',
    words < 150 ? `Apenas ${words} palavras: conte mais sobre suas experiências.` : `${words} palavras: tente resumir em até 2 páginas.`, null, true);

  const atsLevel = tpl.ats || 'media';
  checks.push({
    id: 'template', weight: 6, target: 'tab.template',
    status: atsLevel === 'alta' ? 'ok' : atsLevel === 'media' ? 'warn' : 'bad',
    title: 'Modelo fácil de ler por máquina',
    detail: atsLevel === 'alta' ? 'Modelo de uma coluna, ideal para ATS.'
      : atsLevel === 'media' ? 'Modelo de duas colunas: o PDF tem texto real, mas a ordem de leitura pode variar em sistemas antigos. Exporte também a versão ATS.'
        : 'Modelo criativo: ótimo para enviar a pessoas, mas prefira a versão ATS para candidaturas em sites.',
  });
  if (p.photo) checks.push({ id: 'photo', weight: 0, status: 'info', title: 'Foto', detail: 'No Brasil a foto é opcional. Para vagas no exterior (EUA, Reino Unido), remova a foto.', target: 'profile.photo' });

  const total = checks.reduce((a, c) => a + c.weight, 0);
  const got = checks.reduce((a, c) => a + (c.status === 'ok' ? c.weight : c.status === 'warn' ? c.weight * 0.35 : c.status === 'info' ? c.weight : 0), 0);
  return { score: total ? Math.round((got / total) * 100) : 0, checks, words };
}

const STOP = new Set(`a o as os um uma uns umas de da do das dos e em no na nos nas para por com sem sob sobre ao aos à às que se ou como mais menos muito muita
muitos muitas seu sua seus suas nosso nossa nossos nossas você vocês ele ela eles elas isso esse essa este esta estes estas aquele aquela ser estar ter
será sera serão é são foi era está estão tem têm temos ter haver há pelo pela pelos pelas entre até após desde também já não sim mas porém todo toda todos
todas cada qual quais quando onde qualquer bem bom boa boas bons forma área areas área vaga vagas empresa empresas trabalho trabalhar atuar atuação
experiência experiencia conhecimento conhecimentos requisitos requisito desejável desejaveis desejáveis diferencial diferenciais responsabilidades
atividades benefícios beneficios salário local horário candidato candidata profissional profissionais buscamos procuramos oportunidade nível
avancado intermediario basico fluente desejavel obrigatorio conhecimento conhecimentos vaga requisitos diferencial
the and or of to in for with on at by from as is are be an a our your you we will this that it its into about have has
y el la los las del un una para con por en es son al lo como más su sus`.split(/\s+/));

/** Palavras e expressões mais importantes do texto da vaga, na forma em que aparecem (com acento). */
export function extractKeywords(jobText, max = 30) {
  const text = String(jobText || '');
  const toks = [];
  let prevEnd = 0;
  for (const m of text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}+#.]*[\p{L}\p{N}+#]|[\p{L}\p{N}]/gu)) {
    // "joined": separado da palavra anterior só por espaço (sem vírgula, ponto, quebra de linha)
    toks.push({ show: m[0], n: norm(m[0]), joined: /^[ 	]+$/.test(text.slice(prevEnd, m.index)) });
    prevEnd = m.index + m[0].length;
  }
  // Siglas curtas (BI, TI, RH, UX) contam; demais palavras precisam de 3 letras
  const ok = (t) => t && !STOP.has(t.n) && !/^\d+$/.test(t.n) && (t.n.length >= 3 || (t.n.length === 2 && t.show === t.show.toUpperCase() && /\p{L}/u.test(t.show)));
  const counts = new Map();
  const shown = new Map();
  const bump = (k, show, w = 1) => { counts.set(k, (counts.get(k) || 0) + w); if (!shown.has(k)) shown.set(k, show); };
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (!ok(t)) continue;
    bump(t.n, t.show);
    const nx = toks[i + 1];
    if (ok(nx) && nx.joined) bump(`${t.n} ${nx.n}`, `${t.show} ${nx.show}`, 0.9);
  }
  // Expressões de duas palavras só valem se repetirem (ou se incluem uma sigla, como "Power BI")
  const list = [...counts.entries()].filter(([k, c]) => !k.includes(' ') || c >= 1.8 || k.split(' ').some((w) => w.length === 2));
  list.sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
  const picked = [];
  for (const [k] of list) {
    if (picked.length >= max) break;
    if (picked.some((p) => p.includes(' ') && p.split(' ').includes(k))) continue;
    if (k.includes(' ') && k.split(' ').some((w) => picked.includes(w))) {
      // a expressão substitui as palavras soltas já escolhidas
      for (const w of k.split(' ')) { const i = picked.indexOf(w); if (i >= 0) picked.splice(i, 1); }
    }
    picked.push(k);
  }
  return picked.map((k) => ({ key: k, label: shown.get(k).replace(/^\p{Ll}/u, (c) => (k.length <= 3 ? c.toUpperCase() : c)) }));
}

/** Quais palavras-chave da vaga aparecem (ou não) no currículo. */
export function matchKeywords(r, jobText, max = 30) {
  const keys = extractKeywords(jobText, max);
  const hay = ` ${norm(resumeText(r)).replace(/[^a-z0-9+#]+/g, ' ')} `;
  const found = [], missing = [];
  for (const { key, label } of keys) {
    const k = key.replace(/[^a-z0-9+# ]+/g, ' ').trim();
    (hay.includes(` ${k} `) || (k.length > 4 && hay.includes(` ${k.slice(0, -1)}`)) ? found : missing).push(label);
  }
  const pct = keys.length ? Math.round((found.length / keys.length) * 100) : 0;
  return { keys: keys.map((k) => k.label), found, missing, pct };
}

export { SECTION_TYPES };
