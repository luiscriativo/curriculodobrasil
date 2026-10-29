// Editor: o currículo é editado direto na prévia, com uma barra de contexto flutuando à esquerda;
// modelo, estilo e análise ficam num painel à direita que dá para recolher. Salva sozinho.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { TopBar } from '../App';
import { api } from '../api';
import { Icon } from '../components/Icon';
import { Segmented, SHEET_PX, useMenu, useToast } from '../components/ui';
import { useStore } from '../store';
import type { Resume } from '../types';
import { Sheet } from '../templates/Sheet';
import { getTemplate } from '../templates';
import { ContextDock, ITEM_NAMES, useSelOps, type Sel } from './editor/ContextDock';
import { StylePanel } from './editor/StylePanel';
import { TemplatePanel } from './editor/TemplatePanel';
import { AtsPanel } from './editor/AtsPanel';
import { timeAgo } from '../../shared/dates.mjs';
import { EditCtx, applyEdit, type EditApi } from '../templates/inline';
import { loadPhoto } from '../lib/photo';

type Tab = 'template' | 'style' | 'ats';
const MM = 96 / 25.4;
const DOCK_W = 76; // espaço da barra de contexto à esquerda da folha
const PANEL_KEY = 'editor.panel';
const readPanel = () => { try { return localStorage.getItem(PANEL_KEY) !== 'off'; } catch { return true; } };
// Área útil por página no PDF: a 1ª página perde só a margem de baixo; as demais, cima e baixo (ver PrintView)
const PDF_MARGIN_MM = 11;

/** Fim do último bloco de conteúdo dentro da folha (sem o padding inferior, que no PDF vira margem de página). */
function contentHeight(cv: HTMLElement) {
  const box = cv.getBoundingClientRect();
  const k = box.height / (cv.offsetHeight || 1); // a prévia está em escala (zoom)
  let max = 0;
  // Netos da folha (seções) e filhos sem filhos: colunas esticadas até a altura mínima ficam de fora
  for (const c of cv.querySelectorAll<HTMLElement>(':scope > :not(.bg), :scope > :not(.bg) > *')) {
    if (c.parentElement === cv && c.childElementCount) continue;
    const r = c.getBoundingClientRect();
    if (r.height && r.bottom > max) max = r.bottom;
  }
  return max ? (max - box.top) / k : 0;
}

/** Contorno do que está selecionado na prévia (as marcas data-* vêm do motor dos modelos). */
function selCss(sel: Sel) {
  const q = sel.kind === 'item' ? `[data-item="${sel.sec}/${sel.item}"]`
    : sel.kind === 'sec' ? `[data-sec="${sel.sec}"]:not([data-sec="${sel.sec}"] *)`
    : sel.kind === 'contacts' || sel.kind === 'photo' ? `[data-ctx="${sel.kind}"]` : '';
  return q ? `.cv-editing ${q} { outline: 2px solid rgba(240, 18, 127, .7); outline-offset: 3px; border-radius: 2px; }` : '';
}

/** "+ Adicionar …" na borda de baixo do item ou da seção selecionada: o próximo passo mais comum, no lugar onde ele acontece. */
function AddChip({ sheet, sel, doc, onAdd }: { sheet: React.RefObject<HTMLDivElement | null>; sel: Sel; doc: Resume; onAdd: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const s = sel.kind === 'sec' || sel.kind === 'item' ? doc.sections.find((x) => x.id === sel.sec) : undefined;
  const q = !s || s.type === 'summary' ? '' : sel.kind === 'item' ? `[data-item="${sel.sec}/${sel.item}"]` : `[data-sec="${s.id}"]:not([data-sec="${s.id}"] *)`;
  useLayoutEffect(() => {
    const root = sheet.current;
    const el = q && root ? root.querySelector<HTMLElement>(q) : null;
    if (!root || !el) { if (pos) setPos(null); return; }
    const a = root.getBoundingClientRect(), r = el.getBoundingClientRect();
    const n = { x: Math.round(r.left - a.left + r.width / 2), y: Math.round(r.bottom - a.top + 3) };
    if (!pos || pos.x !== n.x || pos.y !== n.y) setPos(n);
  });
  if (!pos || !s) return null;
  const what = (ITEM_NAMES[s.type] || 'item').toLowerCase();
  return (
    <button className="pv-add" style={{ left: pos.x, top: pos.y }} onMouseDown={(e) => e.stopPropagation()} onClick={onAdd}
      title={sel.kind === 'item' ? 'Adiciona logo abaixo deste (Enter no último campo também)' : undefined}>
      <Icon name="plus" size={14} />Adicionar {what}
    </button>
  );
}

export type Update = (fn: (r: Resume) => Resume, opts?: { coalesce?: string }) => void;

export function Editor({ id, initialTab }: { id: string; initialTab?: string }) {
  const { resumes, save, nav, exportPdf, remove, duplicate } = useStore();
  const toast = useToast();
  const initial = resumes.find((r) => r.id === id);
  const [doc, setDoc] = useState<Resume | null>(initial || null);
  const [tab, setTab] = useState<Tab>(initialTab === 'style' || initialTab === 'ats' ? initialTab : 'template');
  const [panel, setPanelRaw] = useState(() => (initialTab && initialTab !== 'content' ? true : readPanel()));
  const setPanel = useCallback((v: boolean | ((o: boolean) => boolean)) => setPanelRaw((o) => {
    const n = typeof v === 'function' ? v(o) : v;
    try { localStorage.setItem(PANEL_KEY, n ? 'on' : 'off'); } catch { /* sem armazenamento: só não lembra */ }
    return n;
  }), []);
  const openPanel = useCallback((t: Tab) => { setTab(t); setPanel(true); }, [setPanel]);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [savedAt, setSavedAt] = useState<number>(initial?.updatedAt || Date.now());
  // O que está selecionado no currículo (a barra de contexto mostra as ações) e o ajuste aberto nela
  const [sel, setSel] = useState<Sel>({ kind: 'doc' });
  const [pop, setPop] = useState<string | null>(null);
  const [crumbSlot, setCrumbSlot] = useState<HTMLElement | null>(null);
  const select = useCallback((s: Sel, p: string | null = null) => { setSel(s); setPop(p); }, []);
  const hist = useRef<{ past: Resume[]; future: Resume[]; lastKey: string; lastAt: number }>({ past: [], future: [], lastKey: '', lastAt: 0 });
  const saveTimer = useRef<number>(0);
  const docRef = useRef(doc);
  docRef.current = doc;
  const menu = useMenu();

  useEffect(() => {
    if (!initial && !doc) api.resumes.get(id).then(setDoc).catch(() => { toast.show({ kind: 'error', title: 'Currículo não encontrado' }); nav({ name: 'home' }); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((r: Resume) => {
    window.clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = window.setTimeout(async () => {
      saveTimer.current = 0;
      try {
        await save(r);
        setSaveState('saved');
        setSavedAt(Date.now());
      } catch (e) {
        setSaveState('error');
        toast.show({ kind: 'error', title: 'Não foi possível salvar', text: (e as Error).message, actions: [{ label: 'Tentar de novo', onClick: () => persist(docRef.current!) }] });
      }
    }, 450);
  }, [save, toast]);

  // Salva o que estiver pendente ao sair do editor ou ao fechar a janela
  useEffect(() => {
    const flush = () => {
      if (saveTimer.current && docRef.current) { window.clearTimeout(saveTimer.current); saveTimer.current = 0; save(docRef.current).catch(() => {}); }
    };
    window.addEventListener('beforeunload', flush);
    return () => { window.removeEventListener('beforeunload', flush); flush(); };
  }, [save]);

  /** Toda alteração passa por aqui: histórico (desfazer) + salvamento automático. */
  const update: Update = useCallback((fn, opts) => {
    const cur = docRef.current;
    if (!cur) return;
    const now = Date.now();
    const next = { ...fn(cur), updatedAt: now };
    const h = hist.current;
    // Digitação contínua no mesmo campo vira um único passo de desfazer
    if (!(opts?.coalesce && opts.coalesce === h.lastKey && now - h.lastAt < 1200)) {
      h.past.push(cur);
      if (h.past.length > 200) h.past.shift();
    }
    h.lastKey = opts?.coalesce || '';
    h.lastAt = now;
    h.future = [];
    docRef.current = next; // várias alterações no mesmo instante se acumulam
    setDoc(next);
    persist(next);
  }, [persist]);

  /** Edição direto no currículo: grava o texto e mostra o campo correspondente no painel */
  const photoInput = useRef<HTMLInputElement>(null);
  const usePhoto = useCallback(async (file?: File | null) => {
    if (!file) return;
    try {
      const data = await loadPhoto(file);
      update((r) => ({ ...r, profile: { ...r.profile, photo: data, photoPos: { x: 50, y: 50, zoom: 1 } } }));
      setSel({ kind: 'photo' });
      setPop(null);
      toast.show({ kind: 'success', title: 'Foto adicionada', text: 'Para enquadrar, use a barra à esquerda.', timeout: 3500 });
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível usar a foto', text: (e as Error).message });
    }
  }, [update, toast]);

  const editApi = useMemo<EditApi>(() => ({
    edit: (path, value) => update((r) => applyEdit(r, path, value), { coalesce: path }),
    focus: (path, soft) => {
      const [kind, a, b, c] = path.split('.');
      if (kind === 'profile') select({ kind: a === 'name' || a === 'title' ? 'profile' : 'contacts' });
      else if (kind === 'sec') select({ kind: 'sec', sec: a });
      else if (kind === 'item') select({ kind: 'item', sec: a, item: b }, !soft && (c === 'start' || c === 'end') ? 'period' : null);
    },
    pickPhoto: (file) => { if (file) usePhoto(file); else photoInput.current?.click(); },
    next: (path) => {
      // Enter: próximo campo do mesmo item (ou do cabeçalho); no fim de uma lista de habilidades, idiomas… cria o próximo
      const root = sheetRef.current;
      const el = root?.querySelector<HTMLElement>(`[data-path="${CSS.escape(path)}"]`);
      if (!root || !el) return;
      const [kind, a, b] = path.split('.');
      const box = kind === 'item' ? el.closest('[data-item]') : root;
      const fields = [...(box || root).querySelectorAll<HTMLElement>('.ie[data-path]')].filter((f) => kind !== 'profile' || f.dataset.path!.startsWith('profile.'));
      const nx = fields[fields.indexOf(el) + 1];
      if (nx) { window.setTimeout(() => nx.focus(), 0); return; }
      const { ops } = live.current;
      const s = docRef.current?.sections.find((x) => x.id === a);
      if (kind === 'item' && s && s.type !== 'summary') ops.addItem(s, b);
    },
  }), [update, usePhoto, select]);

  /** Leva até um texto do currículo e começa a editá-lo (depois que a alteração que o criou aparecer). */
  const sheetRef = useRef<HTMLDivElement>(null);
  const focusPath = useCallback((path: string, onMissing?: () => void) => {
    window.setTimeout(() => {
      const el = sheetRef.current?.querySelector<HTMLElement>(`[data-path="${CSS.escape(path)}"]`);
      if (!el) return onMissing?.();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    }, 60);
  }, []);
  const scrollToSel = (selector: string) => window.setTimeout(() => sheetRef.current?.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);

  // Seleção que deixou de existir (item removido, desfazer…) volta para o documento
  const selOk = !doc || sel.kind === 'doc' || sel.kind === 'profile' || sel.kind === 'contacts' || sel.kind === 'photo'
    || doc.sections.some((s) => s.id === sel.sec && !s.hidden && (sel.kind === 'sec' || s.items.some((i) => i.id === sel.item)));
  const cur: Sel = selOk ? sel : { kind: 'doc' };
  const ops = useSelOps(doc, update, cur, select, focusPath);
  const live = useRef({ cur, pop, ops });
  live.current = { cur, pop, ops };

  /** Clique na prévia: seleciona o item, a seção, os dados pessoais ou a foto sob o cursor. */
  const onStageDown = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-path]')) return; // o próprio texto avisa o que é (EditApi.focus)
    const it = t.closest<HTMLElement>('[data-item]');
    if (it) { const [s, i] = it.dataset.item!.split('/'); return select({ kind: 'item', sec: s, item: i }); }
    const s = t.closest<HTMLElement>('[data-sec]');
    if (s) return select({ kind: 'sec', sec: s.dataset.sec! });
    const c = t.closest<HTMLElement>('[data-ctx]');
    if (c) return select({ kind: c.dataset.ctx as 'profile' | 'contacts' | 'photo' });
    select({ kind: 'doc' });
  };

  /** Itens da análise ATS: leva até o ponto do currículo (ou abre o ajuste certo). */
  const goTarget = (t: string) => {
    setMode('live');
    const [kind, a, b, c] = t.split('.');
    if (kind === 'tab') return openPanel('template');
    if (t === 'profile.photo') { select({ kind: 'photo' }); return scrollToSel('[data-ctx="photo"]'); }
    if (kind === 'profile') return focusPath(t, () => select({ kind: 'contacts' }, 'more'));
    if (kind === 'section') {
      const s = doc?.sections.find((x) => x.type === a);
      if (!s) return ops.addSection(a as never);
      if (s.hidden) update((r) => ({ ...r, sections: r.sections.map((x) => (x.id === s.id ? { ...x, hidden: false } : x)) }));
      select({ kind: 'sec', sec: s.id });
      return scrollToSel(`[data-sec="${s.id}"]`);
    }
    if (kind === 'item' && (c === 'start' || c === 'end')) { select({ kind: 'item', sec: a, item: b }, 'period'); return scrollToSel(`[data-item="${a}/${b}"]`); }
    focusPath(t);
  };

  const undo = useCallback(() => {
    const h = hist.current;
    const prev = h.past.pop();
    if (!prev || !docRef.current) return toast.show({ kind: 'info', title: 'Nada para desfazer', timeout: 1800 });
    h.future.push(docRef.current);
    h.lastKey = '';
    const r = { ...prev, updatedAt: Date.now() };
    docRef.current = r;
    setDoc(r);
    persist(r);
  }, [persist, toast]);
  const redo = useCallback(() => {
    const h = hist.current;
    const nx = h.future.pop();
    if (!nx || !docRef.current) return;
    h.past.push(docRef.current);
    h.lastKey = '';
    const r = { ...nx, updatedAt: Date.now() };
    docRef.current = r;
    setDoc(r);
    persist(r);
  }, [persist]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!docRef.current) return;
      const typing = (e.target as HTMLElement).closest?.('input, textarea, select, [contenteditable]');
      const { cur, pop, ops } = live.current;
      // Atalhos da seleção (fora de campos de texto)
      if (!mod && !typing) {
        if (e.key === 'Escape') {
          if (pop) setPop(null);
          else if (cur.kind === 'item') select({ kind: 'sec', sec: cur.sec });
          else select({ kind: 'doc' });
        } else if ((e.key === 'Delete' || e.key === 'Backspace') && (cur.kind === 'item' || cur.kind === 'sec')) { e.preventDefault(); ops.remove(); }
        else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && (cur.kind === 'item' || cur.kind === 'sec')) { e.preventDefault(); ops.moveSel(e.key === 'ArrowUp' ? -1 : 1); }
        return;
      }
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === '\\') { e.preventDefault(); setPanel((o) => !o); return; }
      if (key === 'd' && !typing && cur.kind === 'item') { e.preventDefault(); ops.duplicate(); return; }
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (key === 'y' || (key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
      else if (key === 'e') { e.preventDefault(); exportPdf(docRef.current, e.shiftKey ? { ats: true } : {}); }
      else if (key === 's') { e.preventDefault(); toast.show({ kind: 'success', title: 'Tudo salvo', text: 'O Currículo do Brasil salva automaticamente enquanto você edita.', timeout: 2500 }); }
      else if (key === 'p') { e.preventDefault(); setMode('pdf'); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [undo, redo, exportPdf, toast, select, setPanel]);

  // ── Prévia ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'live' | 'pdf'>('live');
  const [zoom, setZoom] = useState<'fit' | number>('fit');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 800, h: 600 });
  const [sheetH, setSheetH] = useState(1123);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);
  // Altura real do conteúdo (a folha tem altura mínima de 1 página, que não serve para contar páginas)
  useLayoutEffect(() => {
    const el = sheetRef.current?.querySelector('.cv') as HTMLElement | null;
    if (el) { const h = contentHeight(el); if (Math.abs(h - sheetH) > 1) setSheetH(h); }
  });
  useEffect(() => {
    document.fonts.ready.then(() => { const el = sheetRef.current?.querySelector('.cv') as HTMLElement | null; if (el) setSheetH(contentHeight(el)); });
  }, [doc?.template]);

  const paper = doc?.style.paper === 'Letter' ? 'Letter' : 'A4';
  const [pw, ph] = SHEET_PX[paper];
  const scale = zoom === 'fit' ? Math.min(1.6, Math.max(0.3, (box.w - 80 - DOCK_W) / pw)) : zoom;
  // Estimativa de páginas e posições das quebras
  const usable1 = ph - PDF_MARGIN_MM * MM;
  const usableN = ph - 2 * PDF_MARGIN_MM * MM;
  const contentH = sheetH;
  const breaks: number[] = [];
  for (let y = usable1; y < contentH - 2; y += usableN) breaks.push(y);
  const pages = breaks.length + 1;

  // PDF final (gerado de verdade, igual ao arquivo exportado)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState<string | null>(null);
  const pdfFor = useRef(0);
  useEffect(() => {
    if (mode !== 'pdf' || !doc) return;
    const t = window.setTimeout(async () => {
      const ticket = ++pdfFor.current;
      setPdfBusy(true);
      setPdfErr(null);
      try {
        const bytes = await api.pdf.preview(doc);
        if (ticket !== pdfFor.current) return;
        const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
        setPdfUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
      } catch (e) {
        if (ticket === pdfFor.current) setPdfErr((e as Error).message);
      } finally {
        if (ticket === pdfFor.current) setPdfBusy(false);
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [mode, doc]);
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  /** Reduz fonte e espaçamento até caber em 1 página (ou no menor número possível). */
  const fitOnePage = useCallback(async () => {
    const r0 = docRef.current;
    if (!r0) return;
    const el = () => sheetRef.current?.querySelector('.cv') as HTMLElement | null;
    const steps: [number, number][] = [];
    for (const fs of [1, 0.96, 0.93, 0.9, 0.87, 0.85]) for (const sp of [1, 0.9, 0.8, 0.7]) steps.push([fs, sp]);
    steps.sort((a, b) => (b[0] + b[1] * 0.6) - (a[0] + a[1] * 0.6));
    let found: [number, number] | null = null;
    for (const [fs, sp] of steps) {
      if (fs > r0.style.fontScale + 1e-6 || sp > r0.style.spacing + 1e-6) continue;
      flushSync(() => setDoc((d) => (d ? { ...d, style: { ...d.style, fontScale: fs, spacing: sp } } : d)));
      await new Promise((res) => requestAnimationFrame(() => res(null)));
      const cur = el();
      if (cur && contentHeight(cur) <= usable1 - 2) { found = [fs, sp]; break; }
    }
    flushSync(() => setDoc(r0));
    docRef.current = r0;
    if (found) {
      update((d) => ({ ...d, style: { ...d.style, fontScale: found![0], spacing: found![1] } }));
      toast.show({ kind: 'success', title: 'Agora cabe em 1 página', text: `Fonte ${Math.round(found[0] * 100)}% · espaçamento ${Math.round(found[1] * 100)}%. Use Ctrl+Z para voltar.` });
    } else {
      toast.show({ kind: 'warn', title: 'Não coube em 1 página sem ficar pequeno demais', text: 'Tente resumir descrições, ocultar seções menos importantes ou escolher um modelo de uma coluna.' });
    }
  }, [update, toast, usable1]);

  if (!doc) return <div className="pv-loading"><span className="spinner" />Abrindo currículo…</div>;
  const tpl = getTemplate(doc.template);

  const exportMenu = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    menu.open({ clientX: r.right - 240, clientY: r.bottom + 6 }, [
      { label: 'Exportar PDF', icon: 'file-pdf', onClick: () => exportPdf(doc) },
      { label: 'Salvar PDF como…', icon: 'folder-open', onClick: () => exportPdf(doc, { saveAs: true }) },
      { label: 'Exportar versão ATS (uma coluna)', icon: 'ats', onClick: () => exportPdf(doc, { ats: true }) },
      { sep: true },
      { label: 'Exportar dados (.json)', icon: 'download', onClick: async () => { try { const res = await api.resumes.exportJson(doc); if (res.file) toast.show({ kind: 'success', title: 'Dados exportados', text: res.file, actions: [{ label: 'Mostrar na pasta', onClick: () => api.shell.reveal(res.file!) }] }); } catch (err) { toast.show({ kind: 'error', title: 'Não foi possível exportar', text: (err as Error).message }); } } },
      { label: 'Duplicar currículo', icon: 'copy', onClick: () => duplicate(doc) },
      { sep: true },
      { label: 'Excluir currículo', icon: 'trash', danger: true, onClick: () => remove(doc) },
    ]);
  };

  return (
    <>
      <TopBar left={<>
        <button className="iconbtn" title="Voltar aos currículos" onClick={() => nav({ name: 'home' })}><Icon name="arrow-left" /></button>
        <input className="doc-title" value={doc.docTitle} aria-label="Nome do currículo" size={Math.max(12, doc.docTitle.length)}
          onChange={(e) => update((r) => ({ ...r, docTitle: e.target.value }), { coalesce: 'docTitle' })}
          onBlur={(e) => { if (!e.target.value.trim()) update((r) => ({ ...r, docTitle: 'Meu currículo' })); }} />
        <span className={`save-state ${saveState}`} title={new Date(savedAt).toLocaleString('pt-BR')}>
          <span className="led" />{saveState === 'saving' ? 'Salvando…' : saveState === 'error' ? 'Erro ao salvar' : `Salvo ${timeAgo(savedAt)}`}
        </span>
      </>}>
        <button className="iconbtn" title="Desfazer (Ctrl+Z)" onClick={undo} disabled={!hist.current.past.length}><Icon name="undo" /></button>
        <button className="iconbtn" title="Refazer (Ctrl+Y)" onClick={redo} disabled={!hist.current.future.length}><Icon name="redo" /></button>
        <div style={{ display: 'flex' }}>
          <button className="btn primary" style={{ borderRadius: '11px 0 0 11px' }} onClick={() => exportPdf(doc)} title="Ctrl+E"><Icon name="file-pdf" size={17} />Exportar PDF</button>
          <button className="btn primary icon" style={{ borderRadius: '0 11px 11px 0', marginLeft: 1, width: 32 }} aria-label="Mais opções de exportação" onClick={exportMenu}><Icon name="chevron-down" size={16} /></button>
        </div>
      </TopBar>
      <div className={`ed ${panel ? '' : 'ed-full'}`} style={{ flex: 1, minHeight: 0 }}>
        <section className="ed-main">
          <div className="pv-bar">
            <Segmented size="sm" value={mode} onChange={setMode} label="Tipo de prévia" options={[
              { value: 'live', label: 'Ao vivo', title: 'Clique no currículo para editar ali mesmo' }, { value: 'pdf', label: 'PDF final', title: 'O arquivo exatamente como será exportado (Ctrl+P)' },
            ]} />
            <span className="badge">{tpl.name}</span>
            {mode === 'live' ? <span className={`badge ${pages > 2 ? 'warn' : ''} num`} title="Estimativa; confira em PDF final">≈ {pages} {pages === 1 ? 'página' : 'páginas'}</span> : null}
            {mode === 'live' ? <span className="pv-crumb-slot" ref={setCrumbSlot} /> : null}
            <div className="sp" />
            {mode === 'live' ? <>
              {pages > 1 ? <button className="btn ghost sm" onClick={fitOnePage} title="Diminui fonte e espaçamento até caber"><Icon name="wand" size={15} />Caber em 1 página</button> : null}
              <button className="iconbtn" title="Diminuir zoom" onClick={() => setZoom(Math.max(0.3, +(scale - 0.1).toFixed(2)))}><Icon name="zoom-out" size={17} /></button>
              <button className="btn ghost sm num" style={{ minWidth: 64 }} title="Ajustar à largura" onClick={() => setZoom('fit')}>{zoom === 'fit' ? 'Ajustar' : `${Math.round(scale * 100)}%`}</button>
              <button className="iconbtn" title="Aumentar zoom" onClick={() => setZoom(Math.min(2, +(scale + 0.1).toFixed(2)))}><Icon name="zoom-in" size={17} /></button>
            </> : <>
              {pdfBusy ? <span className="save-state saving"><span className="led" />Gerando PDF…</span> : null}
              {pdfUrl ? <button className="btn ghost sm" onClick={() => exportPdf(doc)}><Icon name="download" size={15} />Salvar este PDF</button> : null}
            </>}
            <button className={`iconbtn ${panel ? 'on' : ''}`} title={`${panel ? 'Ocultar' : 'Mostrar'} painel de modelo, estilo e análise (Ctrl+\\)`} aria-pressed={panel} onClick={() => setPanel((o) => !o)}>
              <Icon name="sidebar" size={17} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
          {mode === 'live' ? (
            <>
              <div className="pv-scroll" ref={scrollRef}>
                <div className="pv-stage pv-stage-dock" onMouseDown={onStageDown}>
                  <div className="pv-sheet" style={{ width: pw * scale, height: Math.max(ph, contentH + PDF_MARGIN_MM * MM) * scale }} ref={sheetRef}>
                    <div className="scaler" style={{ transform: `scale(${scale})`, width: pw }}><EditCtx.Provider value={editApi}><Sheet resume={doc} editable /></EditCtx.Provider></div>
                    {breaks.map((y, i) => <div key={i} className="pv-guide" style={{ top: y * scale }}><span>Página {i + 2}</span></div>)}
                    <AddChip sheet={sheetRef} sel={cur} doc={doc} onAdd={() => { const s = ops.sec; if (s) ops.addItem(s, ops.item?.id); }} />
                  </div>
                </div>
              </div>
              <style>{selCss(cur)}</style>
              <ContextDock crumbSlot={crumbSlot} doc={doc} update={update} sel={cur} select={select} pop={pop} setPop={setPop} ops={ops} pages={pages} onFit={fitOnePage}
                onPanel={openPanel} pickPhoto={() => photoInput.current?.click()} focusPath={focusPath} />
            </>
          ) : (
            <div className="pv-scroll" style={{ overflow: 'hidden' }}>
              {pdfUrl ? <iframe className="pv-pdf" src={`${pdfUrl}#view=FitH&toolbar=1`} title="PDF final" /> : null}
              {!pdfUrl && pdfBusy ? <div className="pv-loading"><span className="spinner" />Gerando o PDF final…</div> : null}
              {pdfErr ? <div className="pv-loading"><Icon name="alert-circle" size={28} />Não foi possível gerar a prévia: {pdfErr}<button className="btn sm" onClick={() => setMode('live')}>Voltar para ao vivo</button></div> : null}
            </div>
          )}
        </section>
        {panel ? (
          <aside className="ed-side">
            <div className="ed-tabs">
              <Segmented value={tab} onChange={setTab} label="Painel do editor" options={[
                { value: 'template', label: 'Modelo' }, { value: 'style', label: 'Estilo' }, { value: 'ats', label: 'Análise' },
              ]} />
              <button className="iconbtn" title="Ocultar painel (Ctrl+\)" onClick={() => setPanel(false)}><Icon name="x" size={17} /></button>
            </div>
            <div className="ed-scroll">
              {tab === 'template' && <TemplatePanel doc={doc} update={update} />}
              {tab === 'style' && <StylePanel doc={doc} update={update} pages={pages} onFit={fitOnePage} />}
              {tab === 'ats' && <AtsPanel doc={doc} onGo={goTarget} onExportAts={() => exportPdf(doc, { ats: true })} />}
            </div>
          </aside>
        ) : null}
      </div>
      {menu.node}
      <input ref={photoInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { usePhoto(e.target.files?.[0]); e.target.value = ''; }} />
    </>
  );
}
