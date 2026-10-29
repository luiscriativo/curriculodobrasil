// Modelo de dados do currículo. Puro (sem Electron/DOM): usado pelo app, pelos modelos e pelos testes.

export const SCHEMA_VERSION = 1;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Títulos padrão das seções por idioma do currículo (o usuário pode renomear cada uma). */
export const SECTION_TITLES = {
  pt: {
    summary: 'Perfil', experience: 'Experiência', education: 'Formação', skills: 'Habilidades', languages: 'Idiomas',
    courses: 'Cursos e certificações', projects: 'Projetos', awards: 'Prêmios', references: 'Referências',
    interests: 'Interesses', volunteer: 'Voluntariado', custom: 'Outros', contact: 'Contato',
  },
  en: {
    summary: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', languages: 'Languages',
    courses: 'Courses & certifications', projects: 'Projects', awards: 'Awards', references: 'References',
    interests: 'Interests', volunteer: 'Volunteering', custom: 'Other', contact: 'Contact',
  },
  es: {
    summary: 'Perfil', experience: 'Experiencia', education: 'Formación', skills: 'Habilidades', languages: 'Idiomas',
    courses: 'Cursos y certificaciones', projects: 'Proyectos', awards: 'Premios', references: 'Referencias',
    interests: 'Intereses', volunteer: 'Voluntariado', custom: 'Otros', contact: 'Contacto',
  },
};

export const LEVEL_LABELS = {
  skills: { pt: ['', 'Básico', 'Intermediário', 'Bom', 'Avançado', 'Especialista'], en: ['', 'Basic', 'Intermediate', 'Good', 'Advanced', 'Expert'], es: ['', 'Básico', 'Intermedio', 'Bueno', 'Avanzado', 'Experto'] },
  languages: { pt: ['', 'Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'], en: ['', 'Basic', 'Intermediate', 'Advanced', 'Fluent', 'Native'], es: ['', 'Básico', 'Intermedio', 'Avanzado', 'Fluido', 'Nativo'] },
};

/**
 * Tipos de seção e os campos de cada item. `kind` define como o modelo desenha:
 *  entry = cargo/curso com período e descrição; level = nome + nível; text = texto corrido; tag = só nome.
 */
export const SECTION_TYPES = {
  summary: { kind: 'text', icon: 'user', single: true, fields: [] },
  experience: {
    kind: 'entry', icon: 'briefcase',
    fields: [
      { key: 'role', label: 'Cargo', placeholder: 'Analista de Marketing', title: true },
      { key: 'org', label: 'Empresa', placeholder: 'Nome da empresa' },
      { key: 'location', label: 'Local', placeholder: 'São Paulo, SP', half: true },
      { key: 'period', label: 'Período', type: 'period' },
      { key: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Comece cada conquista com "- " para virar um tópico.\n- Aumentei as vendas em 30% em 6 meses' },
    ],
  },
  education: {
    kind: 'entry', icon: 'graduation',
    fields: [
      { key: 'role', label: 'Curso', placeholder: 'Bacharelado em Administração', title: true },
      { key: 'org', label: 'Instituição', placeholder: 'Universidade de São Paulo' },
      { key: 'location', label: 'Local', placeholder: 'São Paulo, SP', half: true },
      { key: 'period', label: 'Período', type: 'period' },
      { key: 'description', label: 'Detalhes', type: 'textarea', placeholder: 'TCC, destaques, média (opcional)' },
    ],
  },
  skills: {
    kind: 'level', icon: 'sparkles',
    fields: [{ key: 'name', label: 'Habilidade', placeholder: 'Excel avançado', title: true }, { key: 'level', label: 'Nível', type: 'level' }],
  },
  languages: {
    kind: 'level', icon: 'globe',
    fields: [{ key: 'name', label: 'Idioma', placeholder: 'Inglês', title: true }, { key: 'level', label: 'Nível', type: 'level' }],
  },
  courses: {
    kind: 'entry', icon: 'award',
    fields: [
      { key: 'role', label: 'Curso ou certificação', placeholder: 'Google Analytics', title: true },
      { key: 'org', label: 'Instituição', placeholder: 'Google' },
      { key: 'period', label: 'Data', type: 'period' },
      { key: 'description', label: 'Detalhes', type: 'textarea', placeholder: 'Carga horária, credencial…' },
    ],
  },
  projects: {
    kind: 'entry', icon: 'folder',
    fields: [
      { key: 'role', label: 'Projeto', placeholder: 'Site institucional', title: true },
      { key: 'org', label: 'Link ou cliente', placeholder: 'meusite.com.br' },
      { key: 'period', label: 'Período', type: 'period' },
      { key: 'description', label: 'Descrição', type: 'textarea', placeholder: 'O que você fez e o resultado' },
    ],
  },
  awards: {
    kind: 'entry', icon: 'trophy',
    fields: [
      { key: 'role', label: 'Prêmio', placeholder: 'Funcionário do ano', title: true },
      { key: 'org', label: 'Concedido por', placeholder: 'Empresa' },
      { key: 'period', label: 'Data', type: 'period' },
      { key: 'description', label: 'Detalhes', type: 'textarea' },
    ],
  },
  volunteer: {
    kind: 'entry', icon: 'heart',
    fields: [
      { key: 'role', label: 'Função', placeholder: 'Voluntário', title: true },
      { key: 'org', label: 'Organização', placeholder: 'ONG' },
      { key: 'period', label: 'Período', type: 'period' },
      { key: 'description', label: 'Descrição', type: 'textarea' },
    ],
  },
  references: {
    kind: 'entry', icon: 'users',
    fields: [
      { key: 'role', label: 'Nome', placeholder: 'Maria Souza', title: true },
      { key: 'org', label: 'Cargo e empresa', placeholder: 'Gerente — Empresa X' },
      { key: 'description', label: 'Contato', type: 'textarea', placeholder: '(11) 99999-0000 · maria@email.com' },
    ],
  },
  interests: { kind: 'tag', icon: 'heart', fields: [{ key: 'name', label: 'Interesse', placeholder: 'Fotografia', title: true }] },
  custom: {
    kind: 'entry', icon: 'list',
    fields: [
      { key: 'role', label: 'Título', title: true },
      { key: 'org', label: 'Subtítulo' },
      { key: 'period', label: 'Período', type: 'period' },
      { key: 'description', label: 'Descrição', type: 'textarea' },
    ],
  },
};

export const SECTION_ORDER = ['summary', 'experience', 'education', 'skills', 'languages', 'courses', 'projects', 'awards', 'volunteer', 'references', 'interests', 'custom'];

export function sectionTitle(section, lang = 'pt') {
  return (section.title || '').trim() || (SECTION_TITLES[lang] || SECTION_TITLES.pt)[section.type] || '';
}

export function newItem(type) {
  const kind = SECTION_TYPES[type]?.kind;
  if (kind === 'level') return { id: uid(), name: '', level: type === 'languages' ? 3 : 4 };
  if (kind === 'tag') return { id: uid(), name: '' };
  return { id: uid(), role: '', org: '', location: '', start: '', end: '', current: false, description: '' };
}

export function newSection(type) {
  return { id: uid(), type, title: '', hidden: false, placement: 'auto', text: '', items: type === 'summary' ? [] : [newItem(type)] };
}

export const DEFAULT_STYLE = {
  accent: null, // null = cor original do modelo
  font: null, // null = fontes do modelo
  fontScale: 1,
  spacing: 1,
  photoShape: null, // null = do modelo
  grayscale: false,
  dateFormat: 'mm/yyyy',
  lang: 'pt',
  paper: 'A4',
  showLevels: true,
  decorativeSpacing: false, // letras bem espaçadas como no modelo original (pior para leitura por ATS)
};

export function emptyProfile() {
  return {
    name: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '',
    birth: '', extra: [], photo: null, photoPos: { x: 50, y: 50, zoom: 1 },
  };
}

export function createResume({ name = '', title = 'Meu currículo', template = 'ipanema', lang = 'pt' } = {}) {
  const now = Date.now();
  return {
    schema: SCHEMA_VERSION,
    id: uid(),
    docTitle: title,
    createdAt: now,
    updatedAt: now,
    template,
    style: { ...DEFAULT_STYLE, lang },
    profile: { ...emptyProfile(), name },
    sections: ['summary', 'experience', 'education', 'skills', 'languages'].map(newSection),
  };
}

const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));

/** Garante que um currículo lido do disco/arquivo importado tenha todos os campos (e nada perigoso). */
export function normalizeResume(input) {
  if (!input || typeof input !== 'object') throw new Error('Arquivo de currículo inválido.');
  const r = input;
  const base = createResume();
  const profile = { ...emptyProfile(), ...(r.profile && typeof r.profile === 'object' ? r.profile : {}) };
  for (const k of ['name', 'title', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'birth']) profile[k] = str(profile[k]);
  profile.extra = Array.isArray(profile.extra) ? profile.extra.filter((e) => e && typeof e === 'object').map((e) => ({ id: e.id || uid(), label: str(e.label), value: str(e.value) })) : [];
  // Só imagens embutidas (SVG é seguro aqui: é desenhado num <img>, que não executa scripts)
  if (profile.photo && !/^data:image\/(png|jpe?g|webp|svg\+xml);base64,/.test(profile.photo)) profile.photo = null;
  const pp = profile.photoPos || {};
  profile.photoPos = { x: clamp(+pp.x, 0, 100, 50), y: clamp(+pp.y, 0, 100, 50), zoom: clamp(+pp.zoom, 1, 3, 1) };
  const sections = (Array.isArray(r.sections) ? r.sections : base.sections)
    .filter((s) => s && SECTION_TYPES[s.type])
    .map((s) => ({
      id: str(s.id) || uid(), type: s.type, title: str(s.title), hidden: !!s.hidden,
      placement: ['auto', 'main', 'aside'].includes(s.placement) ? s.placement : 'auto',
      text: str(s.text),
      items: (Array.isArray(s.items) ? s.items : []).filter((it) => it && typeof it === 'object').map((it) => normalizeItem(s.type, it)),
    }));
  const style = { ...DEFAULT_STYLE, ...(r.style && typeof r.style === 'object' ? r.style : {}) };
  style.fontScale = clamp(+style.fontScale, 0.8, 1.25, 1);
  style.spacing = clamp(+style.spacing, 0.6, 1.6, 1);
  if (!['pt', 'en', 'es'].includes(style.lang)) style.lang = 'pt';
  if (!['A4', 'Letter'].includes(style.paper)) style.paper = 'A4';
  if (style.accent && !/^#[0-9a-f]{6}$/i.test(style.accent)) style.accent = null;
  style.decorativeSpacing = !!style.decorativeSpacing;
  style.grayscale = !!style.grayscale;
  style.showLevels = style.showLevels !== false;
  return {
    schema: SCHEMA_VERSION,
    id: str(r.id) || uid(),
    docTitle: str(r.docTitle) || (profile.name ? `Currículo — ${profile.name}` : 'Meu currículo'),
    createdAt: Number.isFinite(r.createdAt) ? r.createdAt : Date.now(),
    updatedAt: Number.isFinite(r.updatedAt) ? r.updatedAt : Date.now(),
    template: str(r.template) || 'ipanema',
    style,
    profile,
    sections,
  };
}

function normalizeItem(type, it) {
  const kind = SECTION_TYPES[type].kind;
  if (kind === 'level') return { id: str(it.id) || uid(), name: str(it.name), level: clamp(Math.round(+it.level), 0, 5, 3) };
  if (kind === 'tag') return { id: str(it.id) || uid(), name: str(it.name) };
  return {
    id: str(it.id) || uid(), role: str(it.role), org: str(it.org), location: str(it.location),
    start: str(it.start), end: str(it.end), current: !!it.current, description: str(it.description),
  };
}

function clamp(v, min, max, fallback) {
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

/** Cópia com ids novos (duplicar currículo). */
export function duplicateResume(r, suffix = ' (cópia)') {
  const copy = normalizeResume(JSON.parse(JSON.stringify(r)));
  const now = Date.now();
  return {
    ...copy, id: uid(), docTitle: copy.docTitle + suffix, createdAt: now, updatedAt: now,
    sections: copy.sections.map((s) => ({ ...s, id: uid(), items: s.items.map((it) => ({ ...it, id: uid() })) })),
  };
}

/** Separa a descrição em parágrafos e tópicos: linhas com "-", "•", "*" ou "–" viram tópicos. */
export function parseDescription(text) {
  const blocks = [];
  for (const raw of str(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^[-•*–▪●]\s*(.*)$/);
    if (m) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'ul') last.items.push(m[1]);
      else blocks.push({ type: 'ul', items: [m[1]] });
    } else blocks.push({ type: 'p', text: line });
  }
  return blocks;
}

/** Nome de arquivo seguro em Windows/macOS/Linux. */
export function safeFileName(name, fallback = 'Curriculo') {
  const cleaned = str(name)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '');
  const base = cleaned || fallback;
  return /^(con|prn|aux|nul|com\d|lpt\d)$/i.test(base) ? `${base}_` : base.slice(0, 120);
}

/** Aplica o padrão de nome do arquivo de exportação: {nome}, {cargo}, {data}, {titulo}. */
export function exportFileName(pattern, resume, now = new Date()) {
  const p = resume.profile || {};
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const out = str(pattern || 'Currículo - {nome}')
    .replace(/\{nome\}/gi, p.name || '')
    .replace(/\{cargo\}/gi, p.title || '')
    .replace(/\{titulo\}/gi, resume.docTitle || '')
    .replace(/\{data\}/gi, date)
    .replace(/\s*-\s*$/, '')
    .replace(/^\s*-\s*/, '');
  return `${safeFileName(out, 'Curriculo')}.pdf`;
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}
