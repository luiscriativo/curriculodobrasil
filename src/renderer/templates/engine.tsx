// Motor dos modelos: peças comuns (nome, contatos, foto, seções, níveis) que cada modelo
// combina e estiliza com o seu CSS. A ordem no HTML segue a ordem natural de leitura
// (nome → contato → resumo → experiência…), que é a ordem em que o texto entra no PDF.
import { Fragment, type CSSProperties, type ReactNode } from 'react';
import type { Item, Resume, Section, SectionType } from '../types';
import { formatRange, formatDate, monthsBetween, formatDuration } from '../../shared/dates.mjs';
import { LEVEL_LABELS, SECTION_TYPES, parseDescription, sectionTitle } from '../../shared/model.mjs';
import { Icon } from '../components/Icon';
import { E, PanelLink, PhotoSlot } from './inline';

export type EntryVariant = 'stack' | 'sub' | 'left' | 'timeline' | 'top' | 'right';
export type LevelVariant = 'bars' | 'dots' | 'tags' | 'list' | 'bullets' | 'plain' | 'circles' | 'segments' | 'columns' | 'checks';

export interface Opts {
  entry?: EntryVariant;
  skills?: LevelVariant;
  langs?: LevelVariant;
  interests?: 'tags' | 'bullets' | 'plain' | 'icons';
  icons?: boolean; // ícone no título das seções
  dateSep?: string;
  orgFirst?: boolean; // empresa antes do cargo
  duration?: boolean; // "2 anos e 3 meses" abaixo do período
}

export interface TemplateDef {
  id: string;
  name: string;
  refs: string[]; // imagens de referência em modelos/
  desc: string;
  photo: 'yes' | 'no';
  ats: 'alta' | 'media' | 'baixa';
  cols: 1 | 2;
  tags: string[];
  accent: string;
  palette?: string[];
  fonts: { head: string; body: string };
  aside?: SectionType[]; // seções que vão para a coluna lateral por padrão
  css: string; // use .T como prefixo; vira .tpl-<id>
  render: (c: Ctx) => ReactNode;
}

export const FONTS: Record<string, string> = {
  inter: "'Inter Variable', sans-serif",
  montserrat: "'Montserrat Variable', sans-serif",
  poppins: "'Poppins', sans-serif",
  raleway: "'Raleway Variable', sans-serif",
  lato: "'Lato', sans-serif",
  opensans: "'Open Sans Variable', sans-serif",
  roboto: "'Roboto Variable', sans-serif",
  oswald: "'Oswald Variable', sans-serif",
  bebas: "'Bebas Neue', sans-serif",
  anton: "'Anton', sans-serif",
  archivo: "'Archivo Variable', sans-serif",
  archivoblack: "'Archivo Black', sans-serif",
  playfair: "'Playfair Display Variable', serif",
  cormorant: "'Cormorant Garamond Variable', serif",
  lora: "'Lora Variable', serif",
  josefin: "'Josefin Sans Variable', sans-serif",
  dmsans: "'DM Sans Variable', sans-serif",
  baskerville: "'Libre Baskerville', serif",
  vibes: "'Great Vibes', cursive",
  barlow: "'Barlow Condensed', sans-serif",
  spartan: "'League Spartan Variable', sans-serif",
  worksans: "'Work Sans Variable', sans-serif",
  garamond: "'EB Garamond Variable', serif",
  grotesk: "'Space Grotesk Variable', sans-serif",
  caveat: "'Caveat Variable', cursive",
  dmserif: "'DM Serif Display', serif",
  bodoni: "'Bodoni Moda Variable', serif",
};

/** Combinações que o usuário pode escolher em Estilo (null = as do modelo). */
export const FONT_PAIRS: { id: string; name: string; head: string; body: string }[] = [
  { id: 'moderna', name: 'Moderna', head: 'montserrat', body: 'opensans' },
  { id: 'neutra', name: 'Neutra', head: 'inter', body: 'inter' },
  { id: 'geometrica', name: 'Geométrica', head: 'poppins', body: 'poppins' },
  { id: 'elegante', name: 'Elegante', head: 'cormorant', body: 'lato' },
  { id: 'classica', name: 'Clássica', head: 'baskerville', body: 'lora' },
  { id: 'editorial', name: 'Editorial', head: 'playfair', body: 'worksans' },
  { id: 'impacto', name: 'Impacto', head: 'oswald', body: 'roboto' },
  { id: 'suave', name: 'Suave', head: 'raleway', body: 'raleway' },
  { id: 'tecnica', name: 'Técnica', head: 'grotesk', body: 'dmsans' },
  { id: 'garamond', name: 'Tradicional', head: 'garamond', body: 'garamond' },
];

const PAPER = { A4: { w: '210mm', h: '297mm' }, Letter: { w: '215.9mm', h: '279.4mm' } };

export class Ctx {
  r: Resume;
  p: Resume['profile'];
  lang: 'pt' | 'en' | 'es';
  tpl: TemplateDef;
  private used = new Set<string>();
  readonly all: Section[];
  /** Prévia do editor: mostra também o que está vazio, com indicações clicáveis */
  readonly editing: boolean;

  constructor(r: Resume, tpl: TemplateDef, editing = false) {
    this.r = r;
    this.p = r.profile;
    this.lang = r.style.lang;
    this.tpl = tpl;
    this.editing = editing;
    // Só seções visíveis e com conteúdo (no editor, as vazias também, para preencher no lugar)
    this.all = r.sections.filter((s) => !s.hidden && (editing || (s.type === 'summary' ? s.text.trim() : s.items.some(hasContent))));
  }

  /** Itens a desenhar: no editor também os vazios */
  items(s: Section) { return this.editing ? s.items : s.items.filter(hasContent); }

  /** No editor, modelos com foto reservam o espaço (com "Adicionar foto") mesmo sem foto */
  get hasPhoto() { return !!this.p.photo || (this.editing && this.tpl.photo === 'yes'); }
  has(type: SectionType) { return this.all.some((s) => s.type === type && !this.used.has(s.id)); }

  /** Retira a primeira seção do tipo (para o modelo posicioná-la num lugar especial). */
  take(type: SectionType): Section | undefined {
    const s = this.all.find((x) => x.type === type && !this.used.has(x.id));
    if (s) this.used.add(s.id);
    return s;
  }

  /** Retira todas as seções restantes; com `aside`, divide em principal/lateral. */
  split(aside: SectionType[] = this.tpl.aside || []): { main: Section[]; aside: Section[] } {
    const rest = this.all.filter((s) => !this.used.has(s.id));
    rest.forEach((s) => this.used.add(s.id));
    const isAside = (s: Section) => (s.placement === 'aside' ? true : s.placement === 'main' ? false : aside.includes(s.type));
    return { main: rest.filter((s) => !isAside(s)), aside: rest.filter(isAside) };
  }
  rest(): Section[] { return this.split([]).main; }

  title(s: Section) { return sectionTitle(s, this.lang); }
  label(key: string) { return sectionTitle({ type: key, title: '' } as never, this.lang); }
  date(it: Item, sep?: string) { return formatRange(it.start, it.end, it.current, this.r.style.dateFormat, this.lang, sep ?? ' — '); }
  fmt(d: string) { return formatDate(d, this.r.style.dateFormat, this.lang); }
  levelLabel(type: SectionType, n: number) {
    const L = (LEVEL_LABELS as Record<string, Record<string, string[]>>)[type === 'languages' ? 'languages' : 'skills'];
    return (L[this.lang] || L.pt)[Math.max(0, Math.min(5, n))] || '';
  }
  get first() { const w = this.p.name.trim().split(/\s+/); return w.length > 1 ? w.slice(0, -1).join(' ') : w[0] || ''; }
  get last() { const w = this.p.name.trim().split(/\s+/); return w.length > 1 ? w[w.length - 1] : ''; }
}

const hasContent = (it: Item) => !!(it.name?.trim() || it.role?.trim() || it.org?.trim() || it.description?.trim());

/** Variáveis CSS do currículo (cor, fontes, tamanho, espaçamento, papel, foto). */
export function sheetVars(r: Resume, tpl: TemplateDef): CSSProperties {
  const pair = FONT_PAIRS.find((f) => f.id === r.style.font);
  const paper = PAPER[r.style.paper] || PAPER.A4;
  const pp = r.profile.photoPos || { x: 50, y: 50, zoom: 1 };
  return {
    '--accent': r.style.accent || tpl.accent,
    '--f-head': FONTS[pair ? pair.head : tpl.fonts.head] || FONTS.inter,
    '--f-body': FONTS[pair ? pair.body : tpl.fonts.body] || FONTS.inter,
    '--fs': r.style.fontScale,
    '--sp': r.style.spacing,
    '--pw': paper.w,
    '--ph': paper.h,
    '--px': `${pp.x}%`,
    '--py': `${pp.y}%`,
    '--pz': pp.zoom,
  } as CSSProperties;
}

// ── Peças ─────────────────────────────────────────────────────────────────────

export function Name({ c, split, tag = 'h1', className = '' }: { c: Ctx; split?: boolean; tag?: 'h1' | 'div'; className?: string }) {
  const T = tag;
  const display = split && c.last ? <><span className="nm-first">{c.first}</span>{' '}<span className="nm-last">{c.last}</span></> : c.p.name;
  if (c.editing) return <T className={`nm ${className}`}><E editing path="profile.name" value={c.p.name} ph="Seu nome completo" display={display} /></T>;
  return <T className={`nm ${className}`}>{c.p.name ? display : ' '}</T>;
}

export function JobTitle({ c, className = '' }: { c: Ctx; className?: string }) {
  if (c.editing) return <div className={`jt ${className}`}><E editing path="profile.title" value={c.p.title} ph="Cargo ou objetivo" /></div>;
  return c.p.title ? <div className={`jt ${className}`}>{c.p.title}</div> : null;
}

type ContactKey = 'phone' | 'email' | 'location' | 'website' | 'linkedin' | 'github' | 'birth';
const CONTACT_ICON: Record<ContactKey, string> = { phone: 'phone', email: 'mail', location: 'pin', website: 'globe', linkedin: 'linkedin', github: 'github', birth: 'calendar' };
const CONTACT_LABEL: Record<string, Record<ContactKey, string>> = {
  pt: { phone: 'Telefone', email: 'E-mail', location: 'Endereço', website: 'Site', linkedin: 'LinkedIn', github: 'GitHub', birth: 'Nascimento' },
  en: { phone: 'Phone', email: 'Email', location: 'Address', website: 'Website', linkedin: 'LinkedIn', github: 'GitHub', birth: 'Birth date' },
  es: { phone: 'Teléfono', email: 'Correo', location: 'Dirección', website: 'Sitio web', linkedin: 'LinkedIn', github: 'GitHub', birth: 'Nacimiento' },
};

const CONTACT_PH: Record<string, string> = { phone: '(11) 90000-0000', email: 'seu@email.com', location: 'Cidade, UF', linkedin: 'linkedin.com/in/voce' };

function hrefFor(k: ContactKey, v: string) {
  if (k === 'email') return `mailto:${v}`;
  if (k === 'phone') return `tel:${v.replace(/[^\d+]/g, '')}`;
  if (k === 'website' || k === 'linkedin' || k === 'github') return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  return undefined;
}

export function contactList(c: Ctx, keys: ContactKey[] = ['phone', 'email', 'location', 'website', 'linkedin', 'github', 'birth']) {
  const out: { key: string; icon: string; label: string; value: string; href?: string; path?: string }[] = [];
  // No editor, os contatos principais aparecem como indicação mesmo vazios
  const always: string[] = c.editing ? ['phone', 'email', 'location', 'linkedin'] : [];
  for (const k of keys) {
    const v = (c.p[k] || '').trim();
    if (v || always.includes(k)) out.push({ key: k, icon: CONTACT_ICON[k], label: (CONTACT_LABEL[c.lang] || CONTACT_LABEL.pt)[k], value: v, href: v ? hrefFor(k, v) : undefined, path: `profile.${k}` });
  }
  for (const e of c.p.extra || []) if (e.value.trim()) out.push({ key: e.id, icon: 'link', label: e.label, value: e.value });
  return out;
}

/**
 * variant: icons (ícone + valor), labels (rótulo em cima), inline (uma linha), plain (só valores),
 * letter (inicial do rótulo), right (alinhado à direita com ícone no fim)
 */
export function Contacts({ c, variant = 'icons', className = '', keys, sep = ' · ' }: { c: Ctx; variant?: 'icons' | 'labels' | 'inline' | 'plain' | 'letter' | 'right' | 'iconsInline'; className?: string; keys?: ContactKey[]; sep?: string }) {
  const list = contactList(c, keys);
  if (!list.length) return null;
  const val = (x: (typeof list)[number]) => (c.editing && x.path
    ? <E editing path={x.path} value={x.value} ph={CONTACT_PH[x.key] || x.label} />
    : x.href ? <a href={x.href}>{x.value}</a> : x.value);
  if (variant === 'inline') {
    return <div className={`ct ct-inline ${className}`}>{list.map((x, i) => <Fragment key={x.key}>{i > 0 && <span className="ct-sep">{sep}</span>}<span className="ct-v">{val(x)}</span></Fragment>)}</div>;
  }
  return (
    <ul className={`ct ct-${variant} ${className}`}>
      {list.map((x) => (
        <li key={x.key}>
          {variant === 'icons' || variant === 'iconsInline' ? <span className="ct-ic"><Icon name={x.icon} size="1em" stroke={2} /></span> : null}
          {variant === 'labels' ? <span className="ct-l">{x.label}</span> : null}
          {variant === 'letter' ? <span className="ct-l">{x.label.charAt(0)}</span> : null}
          <span className="ct-v">{val(x)}</span>
          {variant === 'right' ? <span className="ct-ic"><Icon name={x.icon} size="1em" stroke={2} /></span> : null}
        </li>
      ))}
    </ul>
  );
}

export function Photo({ c, className = '', shape }: { c: Ctx; className?: string; shape?: string }) {
  const sh = c.r.style.photoShape || shape || 'circle';
  if (!c.p.photo) return c.hasPhoto ? <PhotoSlot className={`ph ph-${sh} ${className}`} /> : null;
  return (
    <div className={`ph ph-${sh} ${c.r.style.grayscale ? 'ph-gray' : ''} ${className}`}>
      <img src={c.p.photo} alt="" />
    </div>
  );
}

export function Desc({ text, className = '' }: { text: string; className?: string }) {
  const blocks = parseDescription(text) as ({ type: 'p'; text: string } | { type: 'ul'; items: string[] })[];
  if (!blocks.length) return null;
  return (
    <div className={`en-desc ${className}`}>
      {blocks.map((b, i) => (b.type === 'p' ? <p key={i}>{b.text}</p> : <ul key={i}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>))}
    </div>
  );
}

const ENTRY_PH: Record<string, [string, string]> = {
  experience: ['Cargo', 'Empresa'], education: ['Curso', 'Instituição'], courses: ['Curso ou certificação', 'Instituição'],
  projects: ['Projeto', 'Link ou cliente'], awards: ['Prêmio', 'Concedido por'], volunteer: ['Função', 'Organização'],
  references: ['Nome da referência', 'Cargo e empresa'], custom: ['Título', 'Subtítulo'],
};

export function Entry({ c, it, o, s }: { c: Ctx; it: Item; o: Opts; s?: Section }) {
  const date = c.date(it, o.dateSep);
  const v = o.entry || 'stack';
  const ed = c.editing && !!s;
  const base = s ? `item.${s.id}.${it.id}` : '';
  const [phRole, phOrg] = ENTRY_PH[s?.type || 'custom'] || ENTRY_PH.custom;
  const title = ed ? <h3 className="en-t"><E editing path={`${base}.role`} value={it.role} ph={phRole} /></h3>
    : it.role ? <h3 className="en-t">{it.role}</h3> : null;
  const sub = ed ? (
    <div className="en-s">
      <span className="en-o"><E editing path={`${base}.org`} value={it.org} ph={phOrg} /></span>
      {s?.type === 'experience' || s?.type === 'education' || it.location
        ? <><span className="en-sep"> · </span><span className="en-l"><E editing path={`${base}.location`} value={it.location} ph="Cidade" /></span></> : null}
    </div>
  ) : it.org || it.location ? (
    <div className="en-s">
      {it.org ? <span className="en-o">{it.org}</span> : null}
      {it.org && it.location ? <span className="en-sep"> · </span> : null}
      {it.location ? <span className="en-l">{it.location}</span> : null}
    </div>
  ) : null;
  const dur = o.duration && it.start ? formatDuration(monthsBetween(it.start, it.end, it.current), c.lang) : '';
  const d = ed && s?.type !== 'references'
    ? <div className="en-d"><PanelLink editing path={`${base}.start`} ph="Período">{date || null}</PanelLink>{dur ? <span className="en-dur">{dur}</span> : null}</div>
    : date ? <div className="en-d">{date}{dur ? <span className="en-dur">{dur}</span> : null}</div> : null;
  const desc = ed
    ? <E editing block multiline path={`${base}.description`} value={it.description} display={<Desc text={it.description} />}
      ph={s?.type === 'experience' ? 'Descreva o que você fez e os resultados. Comece a linha com “- ” para criar tópicos.' : 'Detalhes (opcional)'} />
    : <Desc text={it.description} />;
  const head = o.orgFirst ? <>{sub}{title}</> : <>{title}{sub}</>;
  if (v === 'left' || v === 'right') {
    return <div className={`en en-${v}`}>{v === 'left' ? d || <div className="en-d" /> : null}<div className="en-b">{head}{desc}</div>{v === 'right' ? d : null}</div>;
  }
  if (v === 'top') return <div className="en en-top">{d}{head}{desc}</div>;
  if (v === 'sub' || v === 'timeline') {
    return (
      <div className={`en en-${v}`}>
        {o.orgFirst ? sub : title}
        <div className="en-meta">{o.orgFirst ? title : sub}{d}</div>
        {desc}
      </div>
    );
  }
  // stack: título e data na mesma linha
  return (
    <div className="en en-stack">
      <div className="en-h">{o.orgFirst ? sub : title}{d}</div>
      {o.orgFirst ? title : sub}
      {desc}
    </div>
  );
}

export function Levels({ c, s, variant = 'bars' }: { c: Ctx; s: Section; variant?: LevelVariant }) {
  const items = c.editing ? s.items : s.items.filter((i) => i.name?.trim());
  const ph = s.type === 'languages' ? 'Idioma' : 'Habilidade';
  const nm = (i: Item) => (c.editing ? <E editing path={`item.${s.id}.${i.id}.name`} value={i.name} ph={ph} /> : i.name);
  let v = variant;
  if (!c.r.style.showLevels && ['bars', 'dots', 'circles', 'segments', 'list'].includes(v)) v = 'bullets';
  if (v === 'plain') return <p className="lv-plain">{c.editing ? items.map((i, k) => <Fragment key={i.id}>{k ? ' · ' : ''}{nm(i)}</Fragment>) : items.map((i) => i.name).join(' · ')}</p>;
  if (v === 'tags') return <ul className="lv lv-tags">{items.map((i) => <li key={i.id}>{nm(i)}</li>)}</ul>;
  if (v === 'checks') return <ul className="lv lv-checks">{items.map((i) => <li key={i.id}><Icon name="check" size="1em" stroke={2.4} /><span>{nm(i)}</span></li>)}</ul>;
  if (v === 'bullets' || v === 'columns') return <ul className={`lv lv-${v}`}>{items.map((i) => <li key={i.id}>{nm(i)}</li>)}</ul>;
  return (
    <ul className={`lv lv-${v}`}>
      {items.map((i) => {
        const pct = Math.max(0, Math.min(5, i.level)) * 20;
        return (
          <li key={i.id} style={{ '--lv': `${pct}%` } as CSSProperties}>
            {v === 'circles' ? <svg className="lv-ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" className="tr" /><circle cx="18" cy="18" r="15.5" className="fl" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} /></svg> : null}
            <span className="lv-n">{nm(i)}</span>
            {v === 'bars' ? <span className="lv-bar" aria-hidden><i /></span> : null}
            {v === 'dots' || v === 'segments' ? <span className={`lv-${v === 'dots' ? 'pips' : 'segpips'}`} aria-hidden>{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= i.level ? 'on' : ''} />)}</span> : null}
            {v === 'list' ? <span className="lv-lb">{c.levelLabel(s.type, i.level)}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

const INTEREST_ICONS: [RegExp, string][] = [
  [/foto|camera|câmera|photo/i, 'camera'], [/m[uú]sica|music|viol|guitar|piano/i, 'music'], [/viage|travel|viaj/i, 'plane'],
  [/leitura|livro|read|book|lectura/i, 'book'], [/escrita|writ|escrev/i, 'pen'], [/corrida|esporte|run|sport|futebol|bike|ciclis/i, 'heart'],
];
const interestIcon = (n: string) => INTEREST_ICONS.find(([re]) => re.test(n))?.[1] || 'star';

export function SectionBody({ c, s, o = {} }: { c: Ctx; s: Section; o?: Opts }) {
  const kind = (SECTION_TYPES as Record<string, { kind: string }>)[s.type].kind;
  if (s.type === 'summary') return <SummaryText c={c} s={s} />;
  if (kind === 'level') return <Levels c={c} s={s} variant={(s.type === 'languages' ? o.langs : o.skills) || (s.type === 'languages' ? 'list' : 'bars')} />;
  if (kind === 'tag') {
    const items = c.editing ? s.items : s.items.filter((i) => i.name?.trim());
    const nm = (i: Item) => (c.editing ? <E editing path={`item.${s.id}.${i.id}.name`} value={i.name} ph="Interesse" /> : i.name);
    const v = o.interests || 'tags';
    if (v === 'plain') return <p className="lv-plain">{c.editing ? items.map((i, k) => <Fragment key={i.id}>{k ? ' · ' : ''}{nm(i)}</Fragment>) : items.map((i) => i.name).join(' · ')}</p>;
    if (v === 'icons') return <ul className="lv lv-icons">{items.map((i) => <li key={i.id}><Icon name={interestIcon(i.name)} size="1.5em" stroke={1.6} /><span>{nm(i)}</span></li>)}</ul>;
    return <ul className={`lv lv-${v}`}>{items.map((i) => <li key={i.id}>{nm(i)}</li>)}</ul>;
  }
  return <div className="ens">{c.items(s).map((it) => <Entry key={it.id} c={c} it={it} o={o} s={s} />)}</div>;
}

export function Sec({ c, s, o = {}, className = '', title }: { c: Ctx; s: Section; o?: Opts; className?: string; title?: ReactNode }) {
  const icon = (SECTION_TYPES as Record<string, { icon: string }>)[s.type].icon;
  return (
    <section className={`sec sec-${s.type} ${className}`}>
      <h2 className="sec-t">
        {o.icons ? <span className="sec-ic"><Icon name={icon} size="1em" stroke={2} /></span> : null}
        <span className="sec-tx">{title ?? (c.editing ? <E editing path={`sec.${s.id}.title`} value={c.title(s)} ph="Título da seção" /> : c.title(s))}</span>
      </h2>
      <SectionBody c={c} s={s} o={o} />
    </section>
  );
}

export function Secs({ c, list, o = {}, className = '' }: { c: Ctx; list: Section[]; o?: Opts; className?: string }) {
  return <>{list.map((s) => <Sec key={s.id} c={c} s={s} o={o} className={className} />)}</>;
}

/** Seção "Contato" montada a partir dos dados pessoais. */
export function ContactSec({ c, variant = 'icons', o = {}, className = '' }: { c: Ctx; variant?: Parameters<typeof Contacts>[0]['variant']; o?: Opts; className?: string }) {
  if (!contactList(c).length) return null;
  return (
    <section className={`sec sec-contact ${className}`}>
      <h2 className="sec-t">{o.icons ? <span className="sec-ic"><Icon name="phone" size="1em" stroke={2} /></span> : null}<span className="sec-tx">{c.label('contact')}</span></h2>
      <Contacts c={c} variant={variant} />
    </section>
  );
}

/** Resumo (perfil) sem título, para modelos que o colocam no cabeçalho. */
export function SummaryText({ c, s, className = '' }: { c: Ctx; s?: Section; className?: string }) {
  if (!s) return null;
  const paras = s.text.split(/\n+/).filter(Boolean).map((t, i) => <p key={i}>{t}</p>);
  if (c.editing) {
    return <div className={`sum ${className}`}><E editing block multiline path={`sec.${s.id}.text`} value={s.text} display={paras} ph="Escreva 3 a 5 linhas sobre você: experiência, especialidades e resultados." /></div>;
  }
  return <div className={`sum ${className}`}>{paras}</div>;
}

/** Fundo que se repete em todas as páginas do PDF (colunas coloridas, faixas laterais). */
export function Bg({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`bg ${className}`} style={style} aria-hidden />;
}

export { Icon };
