// Edição direto no currículo: na prévia do editor cada texto vira um campo clicável, com indicações
// ("Seu nome", "Empresa"…) quando está vazio. Fora do editor (miniaturas, PDF) nada disso aparece.
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Resume } from '../types';
import { sectionTitle } from '../../shared/model.mjs';

export interface EditApi {
  /** Grava o texto digitado no caminho (ex.: "profile.name", "item.<seção>.<item>.role"). */
  edit: (path: string, value: string) => void;
  /** Seleciona o que contém o campo (a barra de contexto mostra as ações); soft = só seleciona, sem abrir ajustes. */
  focus: (path: string, soft?: boolean) => void;
  /** Escolher (ou usar a imagem solta) como foto do currículo */
  pickPhoto: (file?: File) => void;
  /** Enter num campo de uma linha: segue para o próximo campo (ou cria o próximo item da lista). */
  next: (path: string) => void;
}
export const EditCtx = createContext<EditApi | null>(null);

/** Aplica uma edição feita no currículo aos dados. */
export function applyEdit(r: Resume, path: string, value: string): Resume {
  const [kind, a, b, c] = path.split('.');
  if (kind === 'profile') return { ...r, profile: { ...r.profile, [a]: value } };
  if (kind === 'sec') {
    return {
      ...r,
      sections: r.sections.map((s) => {
        if (s.id !== a) return s;
        if (b === 'title') return { ...s, title: value.trim() === sectionTitle({ ...s, title: '' }, r.style.lang) ? '' : value };
        return { ...s, text: value };
      }),
    };
  }
  if (kind === 'item') {
    return { ...r, sections: r.sections.map((s) => (s.id !== a ? s : { ...s, items: s.items.map((it) => (it.id === b ? { ...it, [c]: value } : it)) })) };
  }
  return r;
}

// innerText preserva as quebras de linha; o campo em edição usa text-transform: none (cv-base.css),
// senão o texto viria já em MAIÚSCULAS pelo CSS do modelo e iria assim para os dados
const readText = (el: HTMLElement) => {
  const t = (el.innerText || '').replace(/\r/g, '');
  return t === '\n' || !t.trim() ? '' : t.replace(/\n$/, '');
};

/**
 * Texto editável no lugar. Parado, mostra `display` (o visual do modelo); ao clicar vira um campo
 * de texto simples com o valor bruto (ex.: tópicos com "- "), e volta ao visual ao sair.
 */
export function E({ editing, path, value, ph, multiline, block, display }: {
  editing: boolean; path: string; value: string; ph: string; multiline?: boolean; block?: boolean; display?: ReactNode;
}) {
  const api = useContext(EditCtx);
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const sent = useRef(value);
  const Tag = block ? 'div' : 'span';

  useLayoutEffect(() => {
    if (!on || !ref.current) return;
    const el = ref.current;
    el.textContent = value;
    sent.current = value;
    el.focus();
    const sel = window.getSelection();
    sel?.selectAllChildren(el);
    sel?.collapseToEnd();
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mudança vinda de fora enquanto edita (painel, desfazer): atualiza o campo
  useEffect(() => {
    if (on && ref.current && value !== sent.current) { ref.current.textContent = value; sent.current = value; }
  }, [value, on]);

  if (!editing || !api) return <>{value ? (display ?? value) : null}</>;
  if (!on) {
    return (
      <Tag key="show" className={`ie ${value ? '' : 'ie-empty'}`} data-ph={ph} data-path={path} tabIndex={0} role="button" title="Clique para editar"
        onMouseDown={(e) => { e.preventDefault(); setOn(true); api.focus(path, true); }}
        onFocus={() => { setOn(true); api.focus(path, true); }}>
        {value ? (display ?? value) : null}
      </Tag>
    );
  }
  return (
    // key diferente: o campo editável (texto mexido à mão) não é reaproveitado para o visual
    <Tag key="edit" ref={ref as never} className="ie ie-on" contentEditable="plaintext-only" suppressContentEditableWarning spellCheck data-ph={ph} data-path={path}
      onInput={(e) => { const v = readText(e.currentTarget); sent.current = v; api.edit(path, v); e.currentTarget.classList.toggle('ie-blank', !v); }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && !multiline)) { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Enter' && !multiline) api.next(path);
        // Atalhos do app (Ctrl+Z, Ctrl+E…) continuam valendo; o resto fica só no campo
        if (!e.ctrlKey && !e.metaKey) e.stopPropagation();
      }}
      onBlur={() => setOn(false)} />
  );
}

/** Espaço da foto no editor quando ainda não há foto: clicar ou soltar uma imagem adiciona. */
export function PhotoSlot({ className }: { className: string }) {
  const api = useContext(EditCtx);
  const [over, setOver] = useState(false);
  if (!api) return null;
  return (
    <div className={`${className} ph-slot ${over ? 'ph-over' : ''}`} role="button" tabIndex={0} title="Adicionar foto" data-own-drop data-ctx="photo"
      onMouseDown={(e) => { e.preventDefault(); api.pickPhoto(); }} onKeyDown={(e) => { if (e.key === 'Enter') api.pickPhoto(); }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) api.pickPhoto(f); }}>
      <span className="ph-slot-in">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
        <span>Adicionar foto</span>
      </span>
    </div>
  );
}

/** Algo que não dá para editar no lugar (período): clique abre o ajuste na barra de contexto. */
export function PanelLink({ editing, path, children, className = '', ph }: { editing: boolean; path: string; children: ReactNode; className?: string; ph?: string }) {
  const api = useContext(EditCtx);
  if (!editing || !api) return <>{children}</>;
  return (
    <span className={`ie-link ${className} ${children ? '' : 'ie-empty'}`} data-ph={ph} data-path={path} role="button" tabIndex={0} title="Clique para editar"
      onMouseDown={(e) => { e.preventDefault(); api.focus(path); }} onKeyDown={(e) => { if (e.key === 'Enter') api.focus(path); }}>
      {children}
    </span>
  );
}
