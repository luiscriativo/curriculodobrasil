// Aba "Conteúdo": dados pessoais, foto e seções (com itens) — tudo reordenável, ocultável e renomeável.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useConfirm, useMenu, useToast } from '../../components/ui';
import type { Item, Resume, Section, SectionType } from '../../types';
import type { Update } from '../Editor';
import { LEVEL_LABELS, SECTION_ORDER, SECTION_TYPES, newItem, newSection, sectionTitle, uid } from '../../../shared/model.mjs';
import { formatRange, parseDate } from '../../../shared/dates.mjs';

type FieldDef = { key: string; label: string; placeholder?: string; type?: string; title?: boolean; half?: boolean };
const TYPES = SECTION_TYPES as Record<string, { kind: string; icon: string; single?: boolean; fields: FieldDef[] }>;
const TYPE_NAMES: Record<string, string> = {
  summary: 'Resumo / perfil', experience: 'Experiência', education: 'Formação', skills: 'Habilidades', languages: 'Idiomas', courses: 'Cursos e certificações',
  projects: 'Projetos', awards: 'Prêmios', volunteer: 'Voluntariado', references: 'Referências', interests: 'Interesses', custom: 'Seção personalizada',
};

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = arr.slice();
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

export function ContentPanel({ doc, update, focusTarget, clearFocus }: { doc: Resume; update: Update; focusTarget: string | null; clearFocus: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ profile: true }));
  const [flash, setFlash] = useState<string | null>(null);
  const menu = useMenu();
  const rootRef = useRef<HTMLDivElement>(null);

  const [openItemReq, setOpenItemReq] = useState<{ id: string; n: number } | null>(null);

  // Vindo da análise ATS ou de um clique no currículo: abre e destaca o campo certo.
  // Alvos: profile.<campo> · section.<tipo> · sec.<seção>.<text|title> · item.<seção>.<item>.<campo>
  // "|soft" = o usuário está digitando no currículo: só mostra o campo, sem tirar o foco de lá.
  useEffect(() => {
    if (!focusTarget) return;
    const [target, flag] = focusTarget.split('|');
    const soft = flag === 'soft';
    const [kind, a, b, c] = target.split('.');
    let blockId = 'profile';
    let field: string | null = kind === 'profile' ? a : null;
    if (kind === 'section') {
      const s = doc.sections.find((x) => x.type === a);
      if (s) blockId = s.id;
      else {
        const ns = newSection(a) as Section;
        update((r) => ({ ...r, sections: [...r.sections, ns] }));
        blockId = ns.id;
      }
    } else if (kind === 'sec') {
      blockId = a;
      field = b === 'text' ? `${a}.text` : null;
    } else if (kind === 'item') {
      blockId = a;
      field = `${b}.${c === 'end' ? 'start' : c}`;
      setOpenItemReq({ id: b, n: Date.now() });
    }
    setOpen((o) => ({ ...o, [blockId]: true }));
    setFlash(blockId);
    window.setTimeout(() => {
      const fieldEl = field ? (rootRef.current?.querySelector(`[data-k="${field}"]`) as HTMLElement | null) : null;
      const el = fieldEl || rootRef.current?.querySelector(`[data-block="${blockId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: soft ? 'nearest' : 'center' });
      if (!soft) fieldEl?.focus();
    }, 80);
    window.setTimeout(() => setFlash(null), 1400);
    clearFocus();
  }, [focusTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSection = (id: string, fn: (s: Section) => Section, coalesce?: string) =>
    update((r) => ({ ...r, sections: r.sections.map((s) => (s.id === id ? fn(s) : s)) }), coalesce ? { coalesce } : undefined);

  const addSection = (type: SectionType) => {
    const s = newSection(type) as Section;
    update((r) => ({ ...r, sections: [...r.sections, s] }));
    setOpen((o) => ({ ...o, [s.id]: true }));
    window.setTimeout(() => rootRef.current?.querySelector(`[data-block="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const addMenu = (e: React.MouseEvent) => {
    const existing = new Set<string>(doc.sections.map((s) => s.type));
    menu.open(e, [
      { header: 'Adicionar seção' },
      ...SECTION_ORDER.filter((t: string) => t === 'custom' || !(TYPES[t].single && existing.has(t))).map((t: string) => ({
        label: `${TYPE_NAMES[t]}${existing.has(t) && t !== 'custom' ? ' (outra)' : ''}`, icon: TYPES[t].icon, onClick: () => addSection(t as SectionType),
      })),
    ]);
  };

  return (
    <div ref={rootRef}>
      <ProfileBlock doc={doc} update={update} open={!!open.profile} flash={flash === 'profile'} toggle={() => setOpen((o) => ({ ...o, profile: !o.profile }))} />
      {doc.sections.map((s, i) => (
        <SectionBlock key={s.id} s={s} index={i} total={doc.sections.length} doc={doc} update={update} setSection={setSection} openItemReq={openItemReq}
          open={!!open[s.id]} flash={flash === s.id} toggle={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))} />
      ))}
      <button className="btn" style={{ width: '100%', height: 42, borderStyle: 'dashed' }} onClick={addMenu}><Icon name="plus" size={17} />Adicionar seção</button>
      <p className="hint" style={{ textAlign: 'center', marginTop: 14 }}>Dica: nas descrições, comece a linha com “- ” para criar tópicos. <span className="kbd">Ctrl</span>+<span className="kbd">Z</span> desfaz qualquer alteração.</p>
      {menu.node}
    </div>
  );
}

// ── Dados pessoais ───────────────────────────────────────────────────────────
const PROFILE_FIELDS: { k: keyof Resume['profile']; label: string; placeholder: string; type?: string }[] = [
  { k: 'name', label: 'Nome completo', placeholder: 'Maria da Silva' },
  { k: 'title', label: 'Cargo / objetivo', placeholder: 'Analista Financeira' },
  { k: 'email', label: 'E-mail', placeholder: 'maria@email.com', type: 'email' },
  { k: 'phone', label: 'Telefone', placeholder: '(11) 98765-4321', type: 'tel' },
  { k: 'location', label: 'Cidade / UF', placeholder: 'São Paulo, SP' },
  { k: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/seunome' },
  { k: 'website', label: 'Site / portfólio', placeholder: 'seusite.com.br' },
  { k: 'github', label: 'GitHub', placeholder: 'github.com/seunome' },
  { k: 'birth', label: 'Data de nascimento (opcional)', placeholder: '12/05/1995' },
];

function ProfileBlock({ doc, update, open, toggle, flash }: { doc: Resume; update: Update; open: boolean; toggle: () => void; flash: boolean }) {
  const p = doc.profile;
  const set = (k: string, v: unknown) => update((r) => ({ ...r, profile: { ...r.profile, [k]: v } }), { coalesce: `profile.${k}` });
  const emailBad = p.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim());
  return (
    <div className={`blk ${open ? 'open' : ''} ${flash ? 'flash' : ''}`} data-block="profile">
      <div className="blk-h" onClick={toggle}>
        <span className="ic"><Icon name="user" size={17} /></span>
        <span className="tt"><b>Dados pessoais</b><small>{p.name || 'Nome, contato e foto'}</small></span>
        <Icon name="chevron-down" size={18} className="chev" />
      </div>
      {open ? (
        <div className="blk-b">
          <PhotoField doc={doc} update={update} />
          <div className="grid2">
            {PROFILE_FIELDS.map((f) => (
              <div className="field" key={f.k} style={f.k === 'name' || f.k === 'title' ? { gridColumn: '1 / 3' } : undefined}>
                <label>{f.label}</label>
                <input className={`input ${f.k === 'email' && emailBad ? 'invalid' : ''}`} data-k={f.k} type={f.type || 'text'} placeholder={f.placeholder} value={String(p[f.k] || '')}
                  onChange={(e) => set(f.k, e.target.value)} spellCheck={f.k === 'title'} />
                {f.k === 'email' && emailBad ? <span className="hint bad">Confira o e-mail — parece incompleto.</span> : null}
              </div>
            ))}
          </div>
          {p.extra.map((x, i) => (
            <div className="grid2" key={x.id} style={{ gridTemplateColumns: '1fr 1.6fr auto', alignItems: 'end' }}>
              <div className="field"><label>Rótulo</label><input className="input" value={x.label} placeholder="Ex.: CNH" onChange={(e) => set('extra', p.extra.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} /></div>
              <div className="field"><label>Valor</label><input className="input" value={x.value} placeholder="Categoria B" onChange={(e) => set('extra', p.extra.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} /></div>
              <button className="iconbtn danger" title="Remover campo" onClick={() => set('extra', p.extra.filter((_, j) => j !== i))}><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <div><button className="btn sm ghost" onClick={() => set('extra', [...p.extra, { id: uid(), label: '', value: '' }])}><Icon name="plus" size={15} />Campo extra (CNH, disponibilidade…)</button></div>
        </div>
      ) : null}
    </div>
  );
}

/** Reduz a foto para no máximo 900 px (JPEG) — o arquivo do currículo continua leve. */
async function loadPhoto(file: File): Promise<string> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
  if (file.size > 25e6) throw new Error('A imagem é muito grande (máximo 25 MB).');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.88);
  } catch (e) {
    throw new Error((e as Error).message.includes('decode') ? 'Não foi possível ler esta imagem.' : (e as Error).message);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function PhotoField({ doc, update }: { doc: Resume; update: Update }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const p = doc.profile;
  const pick = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    try {
      const data = await loadPhoto(f);
      update((r) => ({ ...r, profile: { ...r.profile, photo: data, photoPos: { x: 50, y: 50, zoom: 1 } } }));
      toast.show({ kind: 'success', title: 'Foto adicionada', text: 'Ajuste o enquadramento com os controles ao lado.', timeout: 3000 });
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível usar a foto', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };
  const pos = (k: 'x' | 'y' | 'zoom', v: number) => update((r) => ({ ...r, profile: { ...r.profile, photoPos: { ...r.profile.photoPos, [k]: v } } }), { coalesce: `photo.${k}` });
  return (
    <div className="photo-box">
      <div className={`photo-drop ${drag ? 'drag' : ''}`} data-own-drop role="button" tabIndex={0} title="Clique ou arraste uma foto"
        onClick={() => input.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter') input.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}>
        {busy ? <span className="spinner" /> : p.photo ? <img src={p.photo} alt="Sua foto" style={{ objectPosition: `${p.photoPos.x}% ${p.photoPos.y}%`, transform: `scale(${p.photoPos.zoom})`, filter: doc.style.grayscale ? 'grayscale(1)' : undefined }} /> : <Icon name="camera" size={24} />}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      <div className="photo-ctl">
        {p.photo ? <>
          <div className="row">Zoom<input type="range" min={1} max={3} step={0.05} value={p.photoPos.zoom} onChange={(e) => pos('zoom', +e.target.value)} /></div>
          <div className="row">Horizontal<input type="range" min={0} max={100} value={p.photoPos.x} onChange={(e) => pos('x', +e.target.value)} /></div>
          <div className="row">Vertical<input type="range" min={0} max={100} value={p.photoPos.y} onChange={(e) => pos('y', +e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn sm" onClick={() => input.current?.click()}>Trocar</button>
            <button className="btn sm ghost danger" onClick={() => update((r) => ({ ...r, profile: { ...r.profile, photo: null } }))}>Remover</button>
          </div>
        </> : <>
          <b style={{ fontWeight: 500 }}>Foto (opcional)</b>
          <span className="hint">Clique ou arraste uma imagem. No Brasil a foto é comum, mas não obrigatória — os modelos se ajustam sem ela.</span>
        </>}
      </div>
    </div>
  );
}

// ── Seções ───────────────────────────────────────────────────────────────────
function SectionBlock({ s, index, total, doc, update, setSection, open, toggle, flash, openItemReq }: {
  openItemReq?: { id: string; n: number } | null;
  s: Section; index: number; total: number; doc: Resume; update: Update; setSection: (id: string, fn: (s: Section) => Section, c?: string) => void; open: boolean; toggle: () => void; flash: boolean;
}) {
  const T = TYPES[s.type];
  const confirm = useConfirm();
  const menu = useMenu();
  const [renaming, setRenaming] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(s.items.length === 1 ? s.items[0].id : null);
  useEffect(() => {
    if (openItemReq && s.items.some((i) => i.id === openItemReq.id)) setOpenItem(openItemReq.id);
  }, [openItemReq]); // eslint-disable-line react-hooks/exhaustive-deps
  const title = sectionTitle(s, doc.style.lang);
  const count = s.type === 'summary' ? (s.text.trim() ? `${s.text.trim().length} caracteres` : 'vazio') : `${s.items.length} ${s.items.length === 1 ? 'item' : 'itens'}`;

  const removeSection = async () => {
    const has = s.type === 'summary' ? !!s.text.trim() : s.items.some((i) => i.name || i.role || i.org || i.description);
    if (has && !(await confirm({ title: `Excluir a seção “${title}”?`, text: 'O conteúdo dela sai do currículo. Dá para desfazer com Ctrl+Z.', ok: 'Excluir', danger: true }))) return;
    update((r) => ({ ...r, sections: r.sections.filter((x) => x.id !== s.id) }));
  };
  const more = (e: React.MouseEvent) => menu.open(e, [
    { label: 'Renomear título', icon: 'edit', onClick: () => { if (!open) toggle(); setRenaming(true); } },
    { header: 'Posição em modelos de duas colunas' },
    ...(['auto', 'main', 'aside'] as const).map((p) => ({ label: `${s.placement === p ? '● ' : '○ '}${{ auto: 'Automática (do modelo)', main: 'Coluna principal', aside: 'Coluna lateral' }[p]}`, onClick: () => setSection(s.id, (x) => ({ ...x, placement: p })) })),
    { sep: true },
    { label: 'Excluir seção', icon: 'trash', danger: true, onClick: removeSection },
  ]);

  const setItem = (id: string, patch: Partial<Item>, key: string) => setSection(s.id, (x) => ({ ...x, items: x.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }), `${s.id}.${id}.${key}`);
  const addItem = () => {
    const it = newItem(s.type) as Item;
    setSection(s.id, (x) => ({ ...x, items: [...x.items, it] }));
    setOpenItem(it.id);
    // Foco no primeiro campo do item novo (clicado no painel, não no currículo)
    window.setTimeout(() => (document.querySelector(`[data-k="${it.id}.${T.kind === "entry" ? "role" : "name"}"]`) as HTMLElement | null)?.focus(), 60);
  };

  return (
    <div className={`blk ${open ? 'open' : ''} ${s.hidden ? 'hidden-sec' : ''} ${flash ? 'flash' : ''}`} data-block={s.id}>
      <div className="blk-h" onClick={toggle}>
        <span className="ic"><Icon name={T.icon} size={17} /></span>
        <span className="tt"><b>{title}</b><small>{s.hidden ? 'Oculta no currículo · ' : ''}{count}</small></span>
        <span style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
          <button className="iconbtn" title={s.hidden ? 'Mostrar no currículo' : 'Ocultar do currículo (sem apagar)'} onClick={() => setSection(s.id, (x) => ({ ...x, hidden: !x.hidden }))}><Icon name={s.hidden ? 'eye-off' : 'eye'} size={16} /></button>
          <button className="iconbtn" title="Subir" disabled={index === 0} onClick={() => update((r) => ({ ...r, sections: move(r.sections, index, -1) }))}><Icon name="arrow-up" size={16} /></button>
          <button className="iconbtn" title="Descer" disabled={index === total - 1} onClick={() => update((r) => ({ ...r, sections: move(r.sections, index, 1) }))}><Icon name="arrow-down" size={16} /></button>
          <button className="iconbtn" title="Mais opções" onClick={more}><Icon name="more" size={16} /></button>
        </span>
        <Icon name="chevron-down" size={18} className="chev" />
      </div>
      {open ? (
        <div className="blk-b">
          {renaming || s.title ? (
            <div className="field">
              <label>Título da seção</label>
              <input className="input" autoFocus={renaming} value={s.title} placeholder={sectionTitle({ ...s, title: '' }, doc.style.lang)}
                onChange={(e) => setSection(s.id, (x) => ({ ...x, title: e.target.value }), `${s.id}.title`)} onBlur={() => setRenaming(false)} />
            </div>
          ) : null}
          {s.type === 'summary' ? (
            <div className="field">
              <textarea className="textarea" data-k={`${s.id}.text`} rows={6} value={s.text} spellCheck placeholder="Em 3 a 5 linhas: quem você é, sua experiência e os resultados que entrega. Ex.: Analista financeira com 5 anos de experiência…"
                onChange={(e) => setSection(s.id, (x) => ({ ...x, text: e.target.value }), `${s.id}.text`)} />
              <span className={`hint ${s.text.length > 900 ? 'bad' : ''}`}>{s.text.length} caracteres · ideal entre 200 e 900</span>
            </div>
          ) : T.kind === 'level' || T.kind === 'tag' ? (
            <>
              {s.items.map((it, i) => (
                <div className="lvl-row" key={it.id}>
                  <input className="input" data-k={`${it.id}.name`} value={it.name} placeholder={T.fields[0].placeholder}
                    onChange={(e) => setItem(it.id, { name: e.target.value }, 'name')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }} />
                  {T.kind === 'level' ? <Level type={s.type} value={it.level} lang={doc.style.lang} onChange={(v) => setItem(it.id, { level: v }, 'level')} /> : <span />}
                  <span style={{ display: 'flex' }}>
                    <button className="iconbtn" title="Subir" disabled={i === 0} onClick={() => setSection(s.id, (x) => ({ ...x, items: move(x.items, i, -1) }))}><Icon name="arrow-up" size={15} /></button>
                    <button className="iconbtn danger" title="Remover" onClick={() => setSection(s.id, (x) => ({ ...x, items: x.items.filter((y) => y.id !== it.id) }))}><Icon name="x" size={15} /></button>
                  </span>
                </div>
              ))}
              <div className="add-row"><button className="btn sm" onClick={addItem}><Icon name="plus" size={15} />Adicionar</button><span className="hint" style={{ alignSelf: 'center' }}>Enter adiciona o próximo</span></div>
            </>
          ) : (
            <>
              {s.items.map((it, i) => (
                <EntryItem key={it.id} it={it} fields={T.fields} lang={doc.style.lang} open={openItem === it.id} toggle={() => setOpenItem((o) => (o === it.id ? null : it.id))}
                  set={(patch, key) => setItem(it.id, patch, key)} first={i === 0} last={i === s.items.length - 1}
                  onMove={(d) => setSection(s.id, (x) => ({ ...x, items: move(x.items, i, d) }))}
                  onDuplicate={() => { const c = { ...it, id: uid() }; setSection(s.id, (x) => ({ ...x, items: [...x.items.slice(0, i + 1), c, ...x.items.slice(i + 1)] })); setOpenItem(c.id); }}
                  onRemove={() => setSection(s.id, (x) => ({ ...x, items: x.items.filter((y) => y.id !== it.id) }))} />
              ))}
              <div className="add-row"><button className="btn sm" onClick={addItem}><Icon name="plus" size={15} />Adicionar {TYPE_NAMES[s.type].toLowerCase().replace(/ e .*/, '').replace(/s$/, '')}</button></div>
            </>
          )}
        </div>
      ) : null}
      {menu.node}
    </div>
  );
}

function Level({ type, value, lang, onChange }: { type: string; value: number; lang: string; onChange: (v: number) => void }) {
  const L = (LEVEL_LABELS as Record<string, Record<string, string[]>>)[type === 'languages' ? 'languages' : 'skills'];
  return (
    <div className="lvl" role="radiogroup" aria-label="Nível">
      {[1, 2, 3, 4, 5].map((n) => <button key={n} role="radio" aria-checked={value === n} className={n <= value ? 'on' : ''} title={(L[lang] || L.pt)[n]} onClick={() => onChange(n === value ? n - 1 : n)} />)}
      <span>{(L[lang] || L.pt)[value] || '—'}</span>
    </div>
  );
}

function EntryItem({ it, fields, lang, open, toggle, set, first, last, onMove, onDuplicate, onRemove }: {
  it: Item; fields: FieldDef[]; lang: string; open: boolean; toggle: () => void; set: (p: Partial<Item>, key: string) => void;
  first: boolean; last: boolean; onMove: (d: number) => void; onDuplicate: () => void; onRemove: () => void;
}) {
  const head = it.role || it.org;
  const range = formatRange(it.start, it.end, it.current, 'mm/yyyy', lang as 'pt');
  return (
    <div className="item">
      <div className="item-h" onClick={toggle}>
        <span className={`tt ${head ? '' : 'placeholder'}`}>{head || 'Novo item — clique para preencher'}{it.role && it.org ? <small>{it.org}</small> : null}{range ? <small>{range}</small> : null}</span>
        <span style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
          <button className="iconbtn" title="Subir" disabled={first} onClick={() => onMove(-1)}><Icon name="arrow-up" size={15} /></button>
          <button className="iconbtn" title="Descer" disabled={last} onClick={() => onMove(1)}><Icon name="arrow-down" size={15} /></button>
          <button className="iconbtn" title="Duplicar" onClick={onDuplicate}><Icon name="copy" size={15} /></button>
          <button className="iconbtn danger" title="Remover" onClick={onRemove}><Icon name="trash" size={15} /></button>
        </span>
      </div>
      {open ? (
        <div className="item-b">
          {fields.map((f) => {
            if (f.type === 'period') return <Period key={f.key} it={it} set={set} single={f.label === 'Data'} />;
            if (f.type === 'textarea') {
              return (
                <div className="field" key={f.key}>
                  <label>{f.label}</label>
                  <textarea className="textarea" data-k={`${it.id}.${f.key}`} rows={4} spellCheck value={String(it[f.key as keyof Item] || '')} placeholder={f.placeholder}
                    onChange={(e) => set({ [f.key]: e.target.value } as Partial<Item>, f.key)}
                    onKeyDown={(e) => {
                      // Enter numa linha de tópico já começa o próximo tópico
                      if (e.key !== 'Enter' || e.shiftKey) return;
                      const ta = e.currentTarget;
                      const before = ta.value.slice(0, ta.selectionStart);
                      const line = before.split('\n').pop() || '';
                      if (/^\s*[-•]\s+\S/.test(line)) {
                        e.preventDefault();
                        const v = `${before}\n- ${ta.value.slice(ta.selectionEnd)}`;
                        set({ [f.key]: v } as Partial<Item>, f.key);
                        const pos = before.length + 3;
                        requestAnimationFrame(() => ta.setSelectionRange(pos, pos));
                      }
                    }} />
                </div>
              );
            }
            return (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input className="input" data-k={`${it.id}.${f.key}`} value={String(it[f.key as keyof Item] || '')} placeholder={f.placeholder} spellCheck={f.key !== 'org'}
                  onChange={(e) => set({ [f.key]: e.target.value } as Partial<Item>, f.key)} />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Period({ it, set, single }: { it: Item; set: (p: Partial<Item>, key: string) => void; single?: boolean }) {
  const bad = (v: string) => !!v.trim() && !parseDate(v);
  const s = parseDate(it.start), e = parseDate(it.end);
  const inverted = s && e && !it.current && (e.y * 12 + (e.m || 12)) < (s.y * 12 + (s.m || 1));
  return (
    <div className="field">
      <div className="grid2" style={{ gridTemplateColumns: single ? '1fr 1fr' : '1fr 1fr', alignItems: 'end' }}>
        <div className="field"><label>{single ? 'Data' : 'Início'}</label><input data-k={`${it.id}.start`} className={`input ${bad(it.start) ? 'invalid' : ''}`} placeholder="MM/AAAA" value={it.start} onChange={(ev) => set({ start: ev.target.value }, 'start')} /></div>
        {!single ? (
          <div className="field"><label>Fim</label><input className={`input ${bad(it.end) ? 'invalid' : ''}`} placeholder={it.current ? 'Atual' : 'MM/AAAA'} disabled={it.current} value={it.current ? '' : it.end} onChange={(ev) => set({ end: ev.target.value }, 'end')} /></div>
        ) : <span />}
      </div>
      {!single ? <label className="check" style={{ marginTop: 4 }}><input type="checkbox" checked={it.current} onChange={(ev) => set({ current: ev.target.checked }, 'current')} />Atual (ainda estou aqui)</label> : null}
      {bad(it.start) || bad(it.end) ? <span className="hint bad">Use MM/AAAA (ex.: 03/2021), só o ano (2021) ou “mar 2021”.</span> : null}
      {inverted ? <span className="hint bad">O fim está antes do início.</span> : null}
    </div>
  );
}
