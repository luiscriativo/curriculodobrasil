// Peças de interface reutilizáveis: segmentado, modal, confirmação, menu, toasts, miniatura de currículo.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { Sheet } from '../templates/Sheet';
import type { Resume } from '../types';

export function Segmented<T extends string>({ value, options, onChange, size, label }: { value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; size?: 'sm'; label?: string }) {
  return (
    <div className={`seg ${size || ''}`} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className={o.value === value ? 'on' : ''} title={o.title} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <span className="switch"><input type="checkbox" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /></span>;
}

export function Modal({ title, sub, children, footer, onClose, wide, className = '' }: { title?: ReactNode; sub?: ReactNode; children: ReactNode; footer?: ReactNode; onClose: () => void; wide?: boolean; className?: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [onClose]);
  return createPortal(
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${wide ? 'wide' : ''} ${className}`} role="dialog" aria-modal="true">
        {title ? <div className="modal-h"><div style={{ flex: 1 }}><h2>{title}</h2>{sub ? <p>{sub}</p> : null}</div><button className="iconbtn" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button></div> : null}
        <div className="modal-b">{children}</div>
        {footer ? <div className="modal-f">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

// ── Confirmação (Promise) ─────────────────────────────────────────────────────
type ConfirmOpts = { title: string; text?: ReactNode; ok?: string; cancel?: string; danger?: boolean };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const ask = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), []);
  const close = (v: boolean) => { state?.resolve(v); setState(null); };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {state ? (
        <Modal title={state.title} onClose={() => close(false)} footer={<>
          <button className="btn ghost" onClick={() => close(false)}>{state.cancel || 'Cancelar'}</button>
          <button className={`btn ${state.danger ? 'accent' : 'primary'}`} autoFocus onClick={() => close(true)}>{state.ok || 'Confirmar'}</button>
        </>}>
          <div style={{ color: 'var(--text-2)' }}>{state.text}</div>
        </Modal>
      ) : null}
    </ConfirmCtx.Provider>
  );
}

// ── Toasts ────────────────────────────────────────────────────────────────────
export type ToastKind = 'success' | 'info' | 'warn' | 'error' | 'progress';
export interface ToastData { id?: string; kind: ToastKind; title: string; text?: ReactNode; actions?: { label: string; onClick: () => void }[]; progress?: number; timeout?: number }
type ToastApi = { show: (t: ToastData) => string; update: (id: string, t: Partial<ToastData>) => void; dismiss: (id: string) => void };
const ToastCtx = createContext<ToastApi>({ show: () => '', update: () => {}, dismiss: () => {} });
export const useToast = () => useContext(ToastCtx);
const TOAST_ICON: Record<ToastKind, string> = { success: 'check-circle', info: 'info', warn: 'alert', error: 'alert-circle', progress: 'refresh' };
const TOAST_MS: Record<ToastKind, number> = { success: 4500, info: 5000, warn: 7000, error: 10000, progress: 0 };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<(ToastData & { id: string })[]>([]);
  const timers = useRef(new Map<string, number>());
  const hover = useRef(new Set<string>());
  const dismiss = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setList((l) => l.filter((t) => t.id !== id));
  }, []);
  const arm = useCallback((id: string, kind: ToastKind, timeout?: number) => {
    window.clearTimeout(timers.current.get(id));
    const ms = timeout ?? TOAST_MS[kind];
    if (!ms) return;
    const tick = () => { if (hover.current.has(id)) timers.current.set(id, window.setTimeout(tick, 800)); else dismiss(id); };
    timers.current.set(id, window.setTimeout(tick, ms));
  }, [dismiss]);
  const show = useCallback((t: ToastData) => {
    const id = t.id || Math.random().toString(36).slice(2);
    setList((l) => [...l.filter((x) => x.id !== id), { ...t, id }].slice(-5));
    arm(id, t.kind, t.timeout);
    return id;
  }, [arm]);
  const update = useCallback((id: string, patch: Partial<ToastData>) => {
    setList((l) => l.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (patch.kind) arm(id, patch.kind, patch.timeout);
  }, [arm]);
  const api = useRef<ToastApi>({ show, update, dismiss });
  api.current = { show, update, dismiss };
  const stable = useRef<ToastApi>({ show: (t) => api.current.show(t), update: (i, t) => api.current.update(i, t), dismiss: (i) => api.current.dismiss(i) });
  return (
    <ToastCtx.Provider value={stable.current}>
      {children}
      <div className="toasts" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`} onMouseEnter={() => hover.current.add(t.id)} onMouseLeave={() => hover.current.delete(t.id)} role={t.kind === 'error' ? 'alert' : 'status'}>
            <span className="ti">{t.kind === 'progress' ? <span className="spinner" /> : <Icon name={TOAST_ICON[t.kind]} size={19} />}</span>
            <div className="tb">
              <b>{t.title}</b>
              {t.text ? <div className="d">{t.text}</div> : null}
              {t.actions?.length ? <div className="ta">{t.actions.map((a) => <button key={a.label} className="btn sm" onClick={() => { a.onClick(); dismiss(t.id); }}>{a.label}</button>)}</div> : null}
            </div>
            {t.kind !== 'progress' ? <button className="iconbtn" style={{ width: 24, height: 24 }} onClick={() => dismiss(t.id)} aria-label="Fechar"><Icon name="x" size={14} /></button> : null}
            {t.kind === 'progress' && t.progress != null ? <div className="tbar" style={{ width: `${t.progress}%` }} /> : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ── Menu contextual ───────────────────────────────────────────────────────────
export interface MenuItem { label?: string; icon?: string; onClick?: () => void; danger?: boolean; sep?: boolean; header?: string; disabled?: boolean }
export function useMenu() {
  const [m, setM] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const open = (e: React.MouseEvent | { clientX: number; clientY: number }, items: MenuItem[]) => {
    if ('preventDefault' in e) { e.preventDefault(); e.stopPropagation(); }
    setM({ x: e.clientX, y: e.clientY, items });
  };
  const node = m ? <MenuView {...m} onClose={() => setM(null)} /> : null;
  return { open, node, isOpen: !!m };
}

function MenuView({ x, y, items, onClose }: { x: number; y: number; items: MenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  useLayoutEffect(() => {
    const r = ref.current!.getBoundingClientRect();
    setPos({ x: Math.min(x, window.innerWidth - r.width - 8), y: Math.min(y, window.innerHeight - r.height - 8) });
  }, [x, y]);
  useEffect(() => {
    const close = (e: Event) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', close, true);
    window.addEventListener('keydown', key);
    window.addEventListener('blur', onClose);
    return () => { window.removeEventListener('mousedown', close, true); window.removeEventListener('keydown', key); window.removeEventListener('blur', onClose); };
  }, [onClose]);
  return createPortal(
    <div className="menu" ref={ref} style={{ left: pos.x, top: pos.y }} role="menu">
      {items.map((it, i) => it.sep ? <hr key={i} /> : it.header ? <div className="mh" key={i}>{it.header}</div> : (
        <button key={i} role="menuitem" className={it.danger ? 'danger' : ''} disabled={it.disabled} onClick={() => { onClose(); it.onClick?.(); }}>
          {it.icon ? <Icon name={it.icon} size={16} /> : null}{it.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

// ── Miniatura do currículo (desenhada só quando aparece na tela) ──────────────
export const SHEET_PX = { A4: [793.7, 1122.5], Letter: [816, 1056] } as const;

export function Thumb({ resume, templateId, width }: { resume: Resume; templateId?: string; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [pw, ph] = SHEET_PX[resume.style.paper] || SHEET_PX.A4;
  const scale = width / pw;
  return (
    <div ref={ref} className="thumb" style={{ width, height: Math.round(ph * scale) }}>
      {visible ? <div className="thumb-inner" style={{ transform: `scale(${scale})`, width: pw }}><Sheet resume={resume} templateId={templateId} /></div> : <div className="thumb-ph" />}
    </div>
  );
}

/** Largura do elemento (para miniaturas responsivas). */
export function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export function Empty({ icon, title, text, children }: { icon: string; title: string; text?: ReactNode; children?: ReactNode }) {
  return <div className="empty"><div className="ic"><Icon name={icon} size={28} /></div><h3>{title}</h3>{text ? <p>{text}</p> : null}{children}</div>;
}
