// Edição direto no currículo: na prévia do editor cada texto vira um campo clicável, com indicações
// ("Seu nome", "Empresa"…) quando está vazio. Fora do editor (miniaturas, PDF) nada disso aparece.
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Resume } from '../types';
import { sectionTitle } from '../../shared/model.mjs';

export interface EditApi {
  /** Grava o texto digitado no caminho (ex.: "profile.name", "item.<seção>.<item>.role"). */
  edit: (path: string, value: string) => void;
  /** Leva o painel da esquerda até o campo; soft = sem tirar o foco do currículo. */
  focus: (path: string, soft?: boolean) => void;
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
      <Tag key="show" className={`ie ${value ? '' : 'ie-empty'}`} data-ph={ph} tabIndex={0} role="button" title="Clique para editar"
        onMouseDown={(e) => { e.preventDefault(); setOn(true); api.focus(path, true); }}
        onFocus={() => { setOn(true); api.focus(path, true); }}>
        {value ? (display ?? value) : null}
      </Tag>
    );
  }
  return (
    // key diferente: o campo editável (texto mexido à mão) não é reaproveitado para o visual
    <Tag key="edit" ref={ref as never} className="ie ie-on" contentEditable="plaintext-only" suppressContentEditableWarning spellCheck data-ph={ph}
      onInput={(e) => { const v = readText(e.currentTarget); sent.current = v; api.edit(path, v); e.currentTarget.classList.toggle('ie-blank', !v); }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && !multiline)) { e.preventDefault(); e.currentTarget.blur(); }
        // Atalhos do app (Ctrl+Z, Ctrl+E…) continuam valendo; o resto fica só no campo
        if (!e.ctrlKey && !e.metaKey) e.stopPropagation();
      }}
      onBlur={() => setOn(false)} />
  );
}

/** Algo que não dá para editar no lugar (período, nível): clique leva ao campo no painel. */
export function PanelLink({ editing, path, children, className = '', ph }: { editing: boolean; path: string; children: ReactNode; className?: string; ph?: string }) {
  const api = useContext(EditCtx);
  if (!editing || !api) return <>{children}</>;
  return (
    <span className={`ie-link ${className} ${children ? '' : 'ie-empty'}`} data-ph={ph} role="button" tabIndex={0} title="Editar no painel"
      onMouseDown={(e) => { e.preventDefault(); api.focus(path); }} onKeyDown={(e) => { if (e.key === 'Enter') api.focus(path); }}>
      {children}
    </span>
  );
}
