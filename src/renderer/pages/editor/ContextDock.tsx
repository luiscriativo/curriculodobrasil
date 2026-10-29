// Barra de contexto: flutua à esquerda da prévia e mostra as ações do que está selecionado no currículo
// (o currículo todo, dados pessoais, foto, uma seção ou um item). O texto em si é digitado direto no currículo.
import { createPortal } from 'react-dom';
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/Icon';
import { Switch, useConfirm } from '../../components/ui';
import type { Item, Resume, ResumeStyle, Section, SectionType } from '../../types';
import type { Update } from '../Editor';
import { LEVEL_LABELS, SECTION_ORDER, SECTION_TYPES, newItem, newSection, sectionTitle, uid } from '../../../shared/model.mjs';
import { parseDate } from '../../../shared/dates.mjs';
import { FONT_PAIRS, FONTS } from '../../templates/engine';
import { getTemplate } from '../../templates';
import { EXTRA_COLORS } from './StylePanel';

export type Sel = { kind: 'doc' } | { kind: 'profile' } | { kind: 'contacts' } | { kind: 'photo' } | { kind: 'sec'; sec: string } | { kind: 'item'; sec: string; item: string };
export type Select = (s: Sel, pop?: string | null) => void;

const TYPES = SECTION_TYPES as Record<string, { kind: string; icon: string; single?: boolean }>;
const TYPE_NAMES: Record<string, string> = {
  summary: 'Resumo / perfil', experience: 'Experiência', education: 'Formação', skills: 'Habilidades', languages: 'Idiomas', courses: 'Cursos e certificações',
  projects: 'Projetos', awards: 'Prêmios', volunteer: 'Voluntariado', references: 'Referências', interests: 'Interesses', custom: 'Seção personalizada',
};

/** Como se chama um item de cada seção (para "Adicionar experiência" etc.) */
export const ITEM_NAMES: Record<string, string> = {
  experience: 'Experiência', education: 'Formação', skills: 'Habilidade', languages: 'Idioma', courses: 'Curso', projects: 'Projeto',
  awards: 'Prêmio', volunteer: 'Trabalho voluntário', references: 'Referência', interests: 'Interesse', custom: 'Item',
};

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const out = arr.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

/**
 * Vizinha visível da seção na mesma coluna. Só seções que seguem a ordem do usuário (data-flow) se movem:
 * as que o modelo fixa num lugar (o perfil no topo, por exemplo) ficam onde estão. undefined = seção fixa.
 */
export function flowNeighbor(secId: string, d: number): string | null | undefined {
  const el = document.querySelector<HTMLElement>(`.cv-editing [data-flow][data-sec="${secId}"]`);
  if (!el?.parentElement) return undefined;
  const sib = [...el.parentElement.children].filter((x) => x.hasAttribute('data-flow')) as HTMLElement[];
  return sib[sib.indexOf(el) + d]?.dataset.sec ?? null;
}
const swapSections = (r: Resume, a: string, b: string): Resume => {
  const i = r.sections.findIndex((x) => x.id === a), j = r.sections.findIndex((x) => x.id === b);
  if (i < 0 || j < 0) return r;
  const out = r.sections.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return { ...r, sections: out };
};

/** O que o modelo atual realmente mostra da seleção (lido da folha desenhada): decide quais ações fazem sentido. */
function useSheetFacts(sel: Sel) {
  const [f, setF] = useState({ flow: false, up: false, down: false, title: false, level: false, col: '' });
  useLayoutEffect(() => {
    const id = sel.kind === 'sec' || sel.kind === 'item' ? sel.sec : '';
    const q = (x: string) => document.querySelector(`.cv-editing ${x}`);
    const n = {
      flow: !!id && flowNeighbor(id, 1) !== undefined,
      up: !!id && !!flowNeighbor(id, -1),
      down: !!id && !!flowNeighbor(id, 1),
      title: !!id && !!q(`[data-path="sec.${id}.title"]`),
      col: (id && (q(`[data-flow][data-sec="${id}"]`) as HTMLElement | null)?.dataset.col) || '',
      level: sel.kind === 'item' && !!q(`[data-item="${sel.sec}/${sel.item}"] :is(.lv-bar, .lv-pips, .lv-segpips, .lv-lb, .lv-ring)`),
    };
    if (JSON.stringify(n) !== JSON.stringify(f)) setF(n);
  });
  return f;
}

const firstField = (s: Section, it: Item) => `item.${s.id}.${it.id}.${TYPES[s.type].kind === 'entry' ? 'role' : 'name'}`;
const hasText = (s: Section) => (s.type === 'summary' ? !!s.text.trim() : s.items.some((i) => i.name || i.role || i.org || i.description));

/** Operações sobre a seleção — usadas pela barra e pelos atalhos de teclado. */
export function useSelOps(doc: Resume | null, update: Update, sel: Sel, select: Select, focusPath: (path: string) => void) {
  const confirm = useConfirm();
  const sec = sel.kind === 'sec' || sel.kind === 'item' ? doc?.sections.find((s) => s.id === sel.sec) : undefined;
  const item = sel.kind === 'item' ? sec?.items.find((i) => i.id === sel.item) : undefined;
  const setSection = (id: string, fn: (s: Section) => Section, coalesce?: string) =>
    update((r) => ({ ...r, sections: r.sections.map((s) => (s.id === id ? fn(s) : s)) }), coalesce ? { coalesce } : undefined);

  const addItem = (s: Section, after?: string) => {
    if (s.type === 'summary') return;
    const it = newItem(s.type) as Item;
    setSection(s.id, (x) => {
      const items = x.items.slice();
      const i = after ? items.findIndex((y) => y.id === after) : -1;
      items.splice(i >= 0 ? i + 1 : items.length, 0, it);
      return { ...x, hidden: false, items };
    });
    select({ kind: 'item', sec: s.id, item: it.id });
    focusPath(firstField(s, it));
  };
  const addSection = (type: SectionType) => {
    const s = newSection(type) as Section;
    update((r) => ({ ...r, sections: [...r.sections, s] }));
    select({ kind: 'sec', sec: s.id });
    focusPath(type === 'summary' ? `sec.${s.id}.text` : firstField(s, s.items[0]));
  };
  const moveSel = (d: number) => {
    if (!sec) return;
    if (item) setSection(sec.id, (x) => ({ ...x, items: move(x.items, x.items.findIndex((y) => y.id === item.id), d) }));
    else { const other = flowNeighbor(sec.id, d); if (other) update((r) => swapSections(r, sec.id, other)); }
  };
  const duplicate = () => {
    if (!sec || !item) return;
    const c = { ...item, id: uid() };
    setSection(sec.id, (x) => { const i = x.items.findIndex((y) => y.id === item.id); return { ...x, items: [...x.items.slice(0, i + 1), c, ...x.items.slice(i + 1)] }; });
    select({ kind: 'item', sec: sec.id, item: c.id });
  };
  const toggleHidden = (s: Section) => {
    setSection(s.id, (x) => ({ ...x, hidden: !x.hidden }));
    // Seção oculta some do currículo: a seleção volta para o documento
    if (!s.hidden && sel.kind !== 'doc' && 'sec' in sel && sel.sec === s.id) select({ kind: 'doc' });
  };
  const removeSection = async (s: Section) => {
    if (hasText(s) && !(await confirm({ title: `Excluir a seção “${sectionTitle(s, doc?.style.lang)}”?`, text: 'O conteúdo dela sai do currículo. Dá para desfazer com Ctrl+Z.', ok: 'Excluir', danger: true }))) return;
    update((r) => ({ ...r, sections: r.sections.filter((x) => x.id !== s.id) }));
    select({ kind: 'doc' });
  };
  const remove = () => {
    if (!sec) return;
    if (!item) return removeSection(sec);
    setSection(sec.id, (x) => ({ ...x, items: x.items.filter((y) => y.id !== item.id) }));
    select({ kind: 'sec', sec: sec.id });
  };
  return { sec, item, setSection, addItem, addSection, moveSel, duplicate, toggleHidden, removeSection, remove };
}

type Ops = ReturnType<typeof useSelOps>;
interface Act { id: string; icon: string; label: string; kbd?: string[]; onClick?: () => void; pop?: () => ReactNode; disabled?: boolean; danger?: boolean }

export function ContextDock({ doc, update, sel, select, pop, setPop, ops, pages, onFit, onPanel, pickPhoto, focusPath, crumbSlot }: {
  doc: Resume; update: Update; sel: Sel; select: Select; pop: string | null; setPop: (p: string | null) => void; ops: Ops;
  pages: number; onFit: () => void; onPanel: (tab: 'template' | 'style' | 'ats') => void; pickPhoto: () => void; focusPath: (path: string) => void;
  /** Onde mostrar o caminho da seleção (na barra de cima da prévia) */
  crumbSlot: HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [popTop, setPopTop] = useState(0);
  const facts = useSheetFacts(sel);
  const tpl = getTemplate(doc.template);
  const { sec, item } = ops;
  const p = doc.profile;
  const setStyle = (patch: Partial<ResumeStyle>, coalesce?: string) => update((r) => ({ ...r, style: { ...r.style, ...patch } }), coalesce ? { coalesce } : undefined);

  // Clique fora da barra fecha o ajuste aberto
  useEffect(() => {
    if (!pop) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setPop(null); };
    window.addEventListener('mousedown', down, true);
    return () => window.removeEventListener('mousedown', down, true);
  }, [pop, setPop]);

  // O ajuste abre ao lado do botão, sem sair da janela
  useLayoutEffect(() => {
    if (!pop || !ref.current) return;
    const btn = ref.current.querySelector<HTMLElement>(`[data-act="${pop}"]`);
    const box = ref.current.getBoundingClientRect();
    const h = popRef.current?.offsetHeight || 0;
    let top = btn ? btn.offsetTop - 8 : 0;
    const maxBottom = window.innerHeight - 14 - box.top;
    if (top + h > maxBottom) top = maxBottom - h;
    if (box.top + top < 70) top = 70 - box.top;
    setPopTop(top);
  }, [pop, sel, doc]);

  // Caminho até o que está selecionado (topo da barra); cada parte volta para aquele nível
  const crumbs: { label: string; go?: () => void }[] = [{ label: 'Currículo', go: () => select({ kind: 'doc' }) }];
  let acts: (Act | '|')[];
  const withPhoto = tpl.photo === 'yes';
  const color: Act = { id: 'color', icon: 'palette', label: 'Cor de destaque', pop: () => <ColorPop doc={doc} setStyle={setStyle} /> };
  const font: Act = { id: 'font', icon: 'type', label: 'Fontes', pop: () => <FontPop doc={doc} setStyle={setStyle} /> };
  const moreContacts: Act = { id: 'more', icon: 'phone', label: 'Mais contatos (site, GitHub, CNH…)', pop: () => <ContactsPop doc={doc} update={update} /> };

  if (sel.kind === 'item' && sec && item) {
    const kind = TYPES[sec.type].kind;
    const idx = sec.items.findIndex((i) => i.id === item.id);
    const what = (item.role || item.name || '').trim();
    crumbs.push({ label: sectionTitle(sec, doc.style.lang), go: () => select({ kind: 'sec', sec: sec.id }) }, { label: what || ITEM_NAMES[sec.type] || 'Item' });
    acts = [
      ...(kind === 'entry' && sec.type !== 'references' ? [{ id: 'period', icon: 'calendar', label: sec.type === 'courses' || sec.type === 'awards' ? 'Data' : 'Período', pop: () => <PeriodPop it={item} set={(patch, key) => ops.setSection(sec.id, (x) => ({ ...x, items: x.items.map((y) => (y.id === item.id ? { ...y, ...patch } : y)) }), `${sec.id}.${item.id}.${key}`)} single={sec.type === 'courses' || sec.type === 'awards'} /> }] : []),
      ...(kind === 'level' && (facts.level || !doc.style.showLevels) ? [{ id: 'level', icon: 'chart', label: 'Nível', pop: () => <LevelPop type={sec.type} value={item.level} lang={doc.style.lang} showLevels={doc.style.showLevels}
        onChange={(v) => ops.setSection(sec.id, (x) => ({ ...x, items: x.items.map((y) => (y.id === item.id ? { ...y, level: v } : y)) }))} onShowLevels={() => setStyle({ showLevels: true })} /> }] : []),
      { id: 'add', icon: 'plus', label: `Adicionar ${(ITEM_NAMES[sec.type] || 'item').toLowerCase()} abaixo`, onClick: () => ops.addItem(sec, item.id) },
      { id: 'dup', icon: 'copy', label: 'Duplicar', kbd: ['Ctrl', 'D'], onClick: ops.duplicate },
      ...(sec.items.length > 1 ? ['|' as const,
        { id: 'up', icon: 'arrow-up', label: 'Subir', kbd: ['Alt', '↑'], disabled: idx === 0, onClick: () => ops.moveSel(-1) },
        { id: 'down', icon: 'arrow-down', label: 'Descer', kbd: ['Alt', '↓'], disabled: idx === sec.items.length - 1, onClick: () => ops.moveSel(1) }] : []),
      '|',
      { id: 'del', icon: 'trash', label: 'Remover', kbd: ['Del'], danger: true, onClick: ops.remove },
    ];
  } else if ((sel.kind === 'sec' || sel.kind === 'item') && sec) {
    crumbs.push({ label: sectionTitle(sec, doc.style.lang) });
    acts = [
      ...(sec.type !== 'summary' ? [{ id: 'add', icon: 'plus', label: `Adicionar ${(ITEM_NAMES[sec.type] || 'item').toLowerCase()}`, onClick: () => ops.addItem(sec) }] : []),
      ...(facts.title ? [{ id: 'rename', icon: 'edit', label: 'Renomear título', onClick: () => focusPath(`sec.${sec.id}.title`) }] : []),
      ...(tpl.cols === 2 && facts.col ? [{ id: 'place', icon: 'sidebar', label: facts.col === 'aside' ? 'Está na coluna lateral' : 'Está na coluna principal', pop: () => (
        <MenuPop title="Coluna" rows={[
          ...(['main', 'aside'] as const).map((v) => ({
            icon: v === 'main' ? 'layout' : 'sidebar', label: v === 'main' ? 'Coluna principal' : 'Coluna lateral', on: facts.col === v,
            onClick: () => { if (facts.col !== v) ops.setSection(sec.id, (x) => ({ ...x, placement: v })); },
          })),
          ...(sec.placement !== 'auto' ? [{ icon: 'refresh', label: 'Voltar ao lugar padrão do modelo', onClick: () => ops.setSection(sec.id, (x) => ({ ...x, placement: 'auto' as const })) }] : []),
        ]} />
      ) }] : []),
      ...(facts.up || facts.down ? ['|' as const,
        { id: 'up', icon: 'arrow-up', label: 'Subir seção', kbd: ['Alt', '↑'], disabled: !facts.up, onClick: () => ops.moveSel(-1) },
        { id: 'down', icon: 'arrow-down', label: 'Descer seção', kbd: ['Alt', '↓'], disabled: !facts.down, onClick: () => ops.moveSel(1) }] : []),
      '|',
      { id: 'hide', icon: 'eye-off', label: 'Ocultar (sem apagar)', onClick: () => ops.toggleHidden(sec) },
      '|',
      { id: 'del', icon: 'trash', label: 'Excluir seção', kbd: ['Del'], danger: true, onClick: () => ops.removeSection(sec) },
    ];
  } else if (sel.kind === 'photo') {
    crumbs.push({ label: 'Foto' });
    acts = [
      { id: 'pick', icon: 'upload', label: p.photo ? 'Trocar foto' : 'Escolher foto', onClick: pickPhoto },
      { id: 'frame', icon: 'zoom-in', label: 'Enquadrar', disabled: !p.photo, pop: () => <FramePop doc={doc} update={update} /> },
      { id: 'shape', icon: 'shapes', label: 'Formato e preto e branco', pop: () => <ShapePop doc={doc} setStyle={setStyle} /> },
      '|',
      { id: 'del', icon: 'trash', label: 'Remover foto', danger: true, disabled: !p.photo, onClick: () => { update((r) => ({ ...r, profile: { ...r.profile, photo: null } })); select({ kind: 'doc' }); } },
    ];
  } else if (sel.kind === 'contacts') {
    crumbs.push({ label: 'Contatos' });
    acts = [moreContacts, color];
  } else if (sel.kind === 'profile') {
    crumbs.push({ label: 'Nome e cargo' });
    acts = [
      font, color,
      '|',
      moreContacts,
      ...(withPhoto ? [{ id: 'photo', icon: 'camera', label: p.photo ? 'Foto' : 'Adicionar foto', onClick: () => (p.photo ? select({ kind: 'photo' }) : pickPhoto()) }] : []),
    ];
  } else {
    const existing = new Set<string>(doc.sections.map((s) => s.type));
    acts = [
      { id: 'add', icon: 'plus', label: 'Adicionar seção', pop: () => (
        <MenuPop title="Adicionar seção" rows={SECTION_ORDER.filter((t: string) => t === 'custom' || !(TYPES[t].single && existing.has(t))).map((t: string) => ({
          icon: TYPES[t].icon, label: `${TYPE_NAMES[t]}${existing.has(t) && t !== 'custom' ? ' (outra)' : ''}`, onClick: () => ops.addSection(t as SectionType),
        }))} />
      ) },
      { id: 'sections', icon: 'layers', label: 'Seções (ordem e visibilidade)', pop: () => <SectionsPop doc={doc} update={update} ops={ops} select={select} /> },
      moreContacts,
      ...(withPhoto ? [{ id: 'photo', icon: 'camera', label: p.photo ? 'Foto' : 'Adicionar foto', onClick: () => (p.photo ? select({ kind: 'photo' }) : pickPhoto()) }] : []),
      '|',
      { id: 'template', icon: 'layout', label: 'Trocar modelo', onClick: () => onPanel('template') },
      color, font,
      { id: 'size', icon: 'sliders', label: 'Tamanho e espaçamento', pop: () => <SizePop doc={doc} setStyle={setStyle} pages={pages} onFit={onFit} /> },
      '|',
      { id: 'ats', icon: 'target', label: 'Análise para RH', onClick: () => onPanel('ats') },
    ];
  }

  const open = acts.find((a): a is Act => a !== '|' && a.id === pop && !!a.pop && !a.disabled);
  const last = crumbs[crumbs.length - 1];
  return (
    <div className={`dock ${open ? 'has-pop' : ''}`} ref={ref} role="toolbar" aria-label={`Ações: ${last.label}`} aria-orientation="vertical">
      {crumbSlot ? createPortal(
        <nav className="pv-crumb" aria-label="Seleção" key={crumbs.map((c) => c.label).join('/')}>
          {crumbs.length === 1 ? <><Icon name="edit" size={13} />Clique no currículo para editar</> : crumbs.map((c, i) => (i < crumbs.length - 1
            ? <span key={i}><button onClick={c.go} title={i === 0 ? 'Currículo todo' : c.label} aria-label={c.label}>{i === 0 ? <Icon name="file" size={14} /> : c.label}</button><Icon name="chevron-right" size={12} /></span>
            : <b key={i}>{c.label}</b>))}
        </nav>, crumbSlot) : null}
      {crumbs.length > 1 ? <>
        <button className="dock-b dock-back" data-tip="Voltar  ·  Esc" aria-label="Voltar" onClick={crumbs[crumbs.length - 2].go}><Icon name="arrow-left" size={18} /></button>
        <hr />
      </> : null}
      {acts.map((a, i) => (a === '|' ? <hr key={i} /> : (
        <button key={a.id} data-act={a.id} className={`dock-b ${a.danger ? 'danger' : ''} ${open?.id === a.id ? 'on' : ''}`} disabled={a.disabled}
          data-tip={a.kbd ? `${a.label}  ·  ${a.kbd.join('+')}` : a.label} aria-label={a.label} aria-expanded={a.pop ? open?.id === a.id : undefined}
          onClick={() => (a.pop ? setPop(open?.id === a.id ? null : a.id) : a.onClick?.())}>
          <Icon name={a.icon} size={18} />
        </button>
      )))}
      {open ? <div className="dock-pop" ref={popRef} style={{ top: popTop }} onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setPop(null); } }}>{open.pop!()}</div> : null}
    </div>
  );
}

// ── Ajustes (abrem ao lado da barra) ─────────────────────────────────────────

type Row = { icon?: string; label: ReactNode; kbd?: string[]; on?: boolean; danger?: boolean; onClick: () => void; side?: ReactNode };
function MenuPop({ title, rows }: { title?: string; rows: Row[] }) {
  return (
    <div className="dp-menu">
      {title ? <div className="dp-h">{title}</div> : null}
      {rows.map((r, i) => (
        <button key={i} className={`dp-row ${r.on ? 'on' : ''} ${r.danger ? 'danger' : ''}`} onClick={r.onClick}>
          {r.icon ? <Icon name={r.icon} size={18} /> : null}
          <span className="dp-l">{r.label}</span>
          {r.side}
          {r.on ? <Icon name="check" size={16} className="dp-ck" /> : null}
          {r.kbd ? <span className="dock-kbd">{r.kbd.map((k) => <kbd key={k}>{k}</kbd>)}</span> : null}
        </button>
      ))}
    </div>
  );
}

function SectionsPop({ doc, update, ops, select }: { doc: Resume; update: Update; ops: Ops; select: Select }) {
  const mv = (id: string, d: number) => { const o = flowNeighbor(id, d); if (o) update((r) => swapSections(r, id, o)); };
  // A lista lê a folha desenhada (ordem e vizinhas): redesenha depois que a folha muda
  const [, redraw] = useState(0);
  const key = doc.template + doc.sections.map((s) => s.id + s.hidden + s.placement).join();
  useLayoutEffect(() => redraw((n) => n + 1), [key]);
  // Na ordem em que aparecem na folha (coluna a coluna); as ocultas no fim
  const at = (id: string) => document.querySelector(`.cv-editing [data-sec="${id}"]`);
  const list = doc.sections.slice().sort((a, b) => {
    const ea = at(a.id), eb = at(b.id);
    if (!ea || !eb) return ea ? -1 : eb ? 1 : 0;
    return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  return (
    <div className="dp-menu" style={{ width: 300 }}>
      <div className="dp-h">Seções do currículo</div>
      {list.map((s, i) => {
        // Em duas colunas, agrupa por coluna: as setas só trocam com vizinhas da mesma coluna
        const g = (x: Section) => (x.hidden ? 'Ocultas' : getTemplate(doc.template).cols === 2 ? ({ aside: 'Coluna lateral', main: 'Coluna principal' } as Record<string, string>)[(at(x.id) as HTMLElement | null)?.dataset.col || ''] || '' : '');
        const head = g(s) && (i === 0 || g(list[i - 1]) !== g(s)) ? <div className="dp-h dp-sub">{g(s)}</div> : null;
        return <Fragment key={s.id}>{head}
        <div className={`dp-sec ${s.hidden ? 'off' : ''}`}>
          <button className="dp-row" title={s.hidden ? 'Oculta — mostre para editar no currículo' : 'Selecionar no currículo'} disabled={s.hidden}
            onClick={() => { select({ kind: 'sec', sec: s.id }); document.querySelector(`.cv-editing [data-sec="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
            <Icon name={TYPES[s.type].icon} size={17} /><span className="dp-l">{sectionTitle(s, doc.style.lang)}</span>
          </button>
          <button className="iconbtn" title={s.hidden ? 'Mostrar no currículo' : 'Ocultar (sem apagar)'} onClick={() => ops.toggleHidden(s)}><Icon name={s.hidden ? 'eye-off' : 'eye'} size={16} /></button>
          {flowNeighbor(s.id, 1) === undefined ? <span className="dp-fixed" title={s.hidden ? 'Oculta' : 'Este modelo põe esta seção num lugar fixo'}>{s.hidden ? '' : 'fixa'}</span> : <>
            <button className="iconbtn" title="Subir" disabled={!flowNeighbor(s.id, -1)} onClick={() => mv(s.id, -1)}><Icon name="arrow-up" size={15} /></button>
            <button className="iconbtn" title="Descer" disabled={!flowNeighbor(s.id, 1)} onClick={() => mv(s.id, 1)}><Icon name="arrow-down" size={15} /></button>
          </>}
        </div></Fragment>;
      })}
      <p className="hint dp-foot">Seções ocultas ficam guardadas, mas não aparecem no currículo nem no PDF.</p>
    </div>
  );
}

function ColorPop({ doc, setStyle }: { doc: Resume; setStyle: (p: Partial<ResumeStyle>, c?: string) => void }) {
  const tpl = getTemplate(doc.template);
  const colors = [...new Set([...(tpl.palette || [tpl.accent]), ...EXTRA_COLORS])];
  const current = doc.style.accent || tpl.accent;
  return (
    <div style={{ width: 252 }}>
      <div className="dp-h">Cor de destaque</div>
      <div className="swatches dp-pad">
        {colors.map((c) => <button key={c} className={`sw ${current.toLowerCase() === c.toLowerCase() ? 'on' : ''}`} style={{ background: c }} title={c === tpl.accent ? `${c} (original do modelo)` : c} aria-label={`Cor ${c}`} onClick={() => setStyle({ accent: c === tpl.accent ? null : c })} />)}
        <label className="sw custom" title="Escolher outra cor"><input type="color" value={current} onChange={(e) => setStyle({ accent: e.target.value }, 'accent')} /></label>
      </div>
      {doc.style.accent ? <div className="dp-pad"><button className="btn ghost sm" onClick={() => setStyle({ accent: null })}>Voltar à cor do modelo</button></div> : null}
    </div>
  );
}

function FontPop({ doc, setStyle }: { doc: Resume; setStyle: (p: Partial<ResumeStyle>) => void }) {
  const tpl = getTemplate(doc.template);
  return (
    <MenuPop title="Fontes" rows={[
      { label: <>Do modelo<small>{tpl.fonts.head === tpl.fonts.body ? tpl.fonts.head : `${tpl.fonts.head} + ${tpl.fonts.body}`}</small></>, on: !doc.style.font, onClick: () => setStyle({ font: null }) },
      ...FONT_PAIRS.map((f) => ({ label: <><span style={{ fontFamily: FONTS[f.head], fontSize: 15 }}>{f.name}</span><small style={{ fontFamily: FONTS[f.body] }}>Texto do currículo</small></>, on: doc.style.font === f.id, onClick: () => setStyle({ font: f.id }) })),
    ]} />
  );
}

function SizePop({ doc, setStyle, pages, onFit }: { doc: Resume; setStyle: (p: Partial<ResumeStyle>, c?: string) => void; pages: number; onFit: () => void }) {
  const st = doc.style;
  return (
    <div className="dp-pad" style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="dp-h" style={{ padding: 0 }}>Tamanho e espaçamento</div>
      <div className="field"><label>Tamanho do texto</label>
        <div className="range-row"><input type="range" min={0.8} max={1.25} step={0.01} value={st.fontScale} onChange={(e) => setStyle({ fontScale: +e.target.value }, 'fontScale')} /><span className="num">{Math.round(st.fontScale * 100)}%</span></div></div>
      <div className="field"><label>Espaço entre seções e itens</label>
        <div className="range-row"><input type="range" min={0.6} max={1.6} step={0.05} value={st.spacing} onChange={(e) => setStyle({ spacing: +e.target.value }, 'spacing')} /><span className="num">{Math.round(st.spacing * 100)}%</span></div></div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn sm" onClick={onFit} disabled={pages <= 1}><Icon name="wand" size={15} />Caber em 1 página</button>
        {st.fontScale !== 1 || st.spacing !== 1 ? <button className="btn ghost sm" onClick={() => setStyle({ fontScale: 1, spacing: 1 })}>Restaurar 100%</button> : null}
      </div>
      <span className="hint">{pages === 1 ? 'Já cabe em 1 página.' : `≈ ${pages} páginas agora.`}</span>
    </div>
  );
}

const CONTACTS: { k: 'email' | 'phone' | 'location' | 'linkedin' | 'website' | 'github' | 'birth'; label: string; ph: string; type?: string }[] = [
  { k: 'email', label: 'E-mail', ph: 'maria@email.com', type: 'email' },
  { k: 'phone', label: 'Telefone', ph: '(11) 98765-4321', type: 'tel' },
  { k: 'location', label: 'Cidade / UF', ph: 'São Paulo, SP' },
  { k: 'linkedin', label: 'LinkedIn', ph: 'linkedin.com/in/seunome' },
  { k: 'website', label: 'Site / portfólio', ph: 'seusite.com.br' },
  { k: 'github', label: 'GitHub', ph: 'github.com/seunome' },
  { k: 'birth', label: 'Nascimento (opcional)', ph: '12/05/1995' },
];

function ContactsPop({ doc, update }: { doc: Resume; update: Update }) {
  const p = doc.profile;
  const set = (k: string, v: unknown) => update((r) => ({ ...r, profile: { ...r.profile, [k]: v } }), { coalesce: `profile.${k}` });
  // Os contatos que já aparecem no currículo são editados lá mesmo; aqui ficam os que faltam
  const [hidden] = useState(() => CONTACTS.filter((f) => !document.querySelector(`.cv-editing [data-path="profile.${f.k}"]`)));
  return (
    <div className="dp-pad" style={{ width: 340 }}>
      <div className="dp-h" style={{ padding: '0 0 4px' }}>Mais contatos</div>
      <p className="hint" style={{ margin: '0 0 10px' }}>Preenchidos, eles aparecem no currículo. Os que já estão lá você edita clicando no texto.</p>
      {hidden.length ? (
        <div className="grid2">
          {hidden.map((f) => (
            <div className="field" key={f.k}>
              <label>{f.label}</label>
              <input className="input" type={f.type || 'text'} placeholder={f.ph} value={String(p[f.k] || '')} onChange={(e) => set(f.k, e.target.value)} spellCheck={false} />
            </div>
          ))}
        </div>
      ) : null}
      <div className="dp-h" style={{ padding: '14px 0 8px' }}>Campos extras</div>
      {p.extra.map((x, i) => (
        <div className="grid2" key={x.id} style={{ gridTemplateColumns: '1fr 1.4fr auto', alignItems: 'center', marginBottom: 6 }}>
          <input className="input" value={x.label} placeholder="Ex.: CNH" aria-label="Rótulo" autoFocus={!x.label && !x.value} onChange={(e) => set('extra', p.extra.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
          <input className="input" value={x.value} placeholder="Categoria B" aria-label="Valor" onChange={(e) => set('extra', p.extra.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
          <button className="iconbtn danger" title="Remover campo" onClick={() => set('extra', p.extra.filter((_, j) => j !== i))}><Icon name="trash" size={16} /></button>
        </div>
      ))}
      <button className="btn sm ghost" onClick={() => set('extra', [...p.extra, { id: uid(), label: '', value: '' }])}><Icon name="plus" size={15} />Campo extra (CNH, disponibilidade…)</button>
    </div>
  );
}

function FramePop({ doc, update }: { doc: Resume; update: Update }) {
  const p = doc.profile;
  const pos = (k: 'x' | 'y' | 'zoom', v: number) => update((r) => ({ ...r, profile: { ...r.profile, photoPos: { ...r.profile.photoPos, [k]: v } } }), { coalesce: `photo.${k}` });
  return (
    <div className="dp-pad" style={{ width: 280 }}>
      <div className="dp-h" style={{ padding: '0 0 8px' }}>Enquadrar foto</div>
      <div className="photo-ctl">
        <div className="row">Zoom<input type="range" min={1} max={3} step={0.05} value={p.photoPos.zoom} onChange={(e) => pos('zoom', +e.target.value)} /></div>
        <div className="row">Horizontal<input type="range" min={0} max={100} value={p.photoPos.x} onChange={(e) => pos('x', +e.target.value)} /></div>
        <div className="row">Vertical<input type="range" min={0} max={100} value={p.photoPos.y} onChange={(e) => pos('y', +e.target.value)} /></div>
      </div>
      <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => update((r) => ({ ...r, profile: { ...r.profile, photoPos: { x: 50, y: 50, zoom: 1 } } }))}>Centralizar</button>
    </div>
  );
}

function ShapePop({ doc, setStyle }: { doc: Resume; setStyle: (p: Partial<ResumeStyle>) => void }) {
  const st = doc.style;
  return (
    <div style={{ width: 260 }}>
      <MenuPop title="Formato da foto" rows={([[null, 'Do modelo', 'wand'], ['circle', 'Redonda', 'user'], ['rounded', 'Arredondada', 'image'], ['square', 'Quadrada', 'layout'], ['arch', 'Arco', 'shapes']] as const).map(([v, l, ic]) => ({
        icon: ic, label: l, on: st.photoShape === v, onClick: () => setStyle({ photoShape: v }),
      }))} />
      <div className="opt-row dp-pad"><div className="ot"><b>Preto e branco</b></div><Switch checked={st.grayscale} onChange={(v) => setStyle({ grayscale: v })} label="Preto e branco" /></div>
    </div>
  );
}

function LevelPop({ type, value, lang, showLevels, onChange, onShowLevels }: { type: string; value: number; lang: string; showLevels: boolean; onChange: (v: number) => void; onShowLevels: () => void }) {
  const L = (LEVEL_LABELS as Record<string, Record<string, string[]>>)[type === 'languages' ? 'languages' : 'skills'];
  const labels = L[lang] || L.pt;
  return (
    <div style={{ width: 240 }}>
      <MenuPop title="Nível" rows={[1, 2, 3, 4, 5].map((n) => ({
        label: labels[n], on: value === n, onClick: () => onChange(n),
        side: <span className="dp-lvl" aria-hidden>{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= n ? 'on' : ''} />)}</span>,
      }))} />
      {!showLevels ? <div className="dp-pad"><span className="hint">Os níveis estão ocultos neste currículo.</span> <button className="btn ghost sm" onClick={onShowLevels}>Mostrar níveis</button></div> : null}
    </div>
  );
}

function PeriodPop({ it, set, single }: { it: Item; set: (p: Partial<Item>, key: string) => void; single?: boolean }) {
  const bad = (v: string) => !!v.trim() && !parseDate(v);
  const s = parseDate(it.start), e = parseDate(it.end);
  const inverted = s && e && !it.current && (e.y * 12 + (e.m || 12)) < (s.y * 12 + (s.m || 1));
  return (
    <div className="dp-pad" style={{ width: 280 }}>
      <div className="dp-h" style={{ padding: '0 0 8px' }}>{single ? 'Data' : 'Período'}</div>
      <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
        <div className="field"><label>{single ? 'Data' : 'Início'}</label><input autoFocus className={`input ${bad(it.start) ? 'invalid' : ''}`} placeholder="MM/AAAA" value={it.start} onChange={(ev) => set({ start: ev.target.value }, 'start')} /></div>
        {!single ? <div className="field"><label>Fim</label><input className={`input ${bad(it.end) ? 'invalid' : ''}`} placeholder={it.current ? 'Atual' : 'MM/AAAA'} disabled={it.current} value={it.current ? '' : it.end} onChange={(ev) => set({ end: ev.target.value }, 'end')} /></div> : null}
      </div>
      {!single ? <label className="check" style={{ marginTop: 8 }}><input type="checkbox" checked={it.current} onChange={(ev) => set({ current: ev.target.checked }, 'current')} />Atual (ainda estou aqui)</label> : null}
      {bad(it.start) || bad(it.end) ? <span className="hint bad">Use MM/AAAA (ex.: 03/2021), só o ano (2021) ou “mar 2021”.</span> : null}
      {inverted ? <span className="hint bad">O fim está antes do início.</span> : null}
    </div>
  );
}
