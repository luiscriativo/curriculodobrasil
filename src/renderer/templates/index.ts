// Registro dos modelos. O CSS de cada um é escopado com .tpl-<id> e injetado uma única vez.
import type { TemplateDef } from './engine';
import { setA } from './set-a';
import { setB } from './set-b';
import { setC } from './set-c';
import { setD } from './set-d';
import { setE } from './set-e';

export const TEMPLATES: TemplateDef[] = [...setA, ...setB, ...setC, ...setD, ...setE];
const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: string | null | undefined): TemplateDef {
  return (id && BY_ID.get(id)) || TEMPLATES[0];
}

export const TEMPLATE_TAGS = ['com foto', 'sem foto', 'ATS', 'uma coluna', 'duas colunas', 'criativo', 'elegante', 'moderno'];

export function matchesTag(t: TemplateDef, tag: string) {
  if (tag === 'ATS') return t.ats === 'alta';
  if (tag === 'uma coluna') return t.cols === 1;
  if (tag === 'duas colunas') return t.cols === 2;
  if (tag === 'com foto') return t.photo === 'yes';
  if (tag === 'sem foto') return t.photo === 'no';
  return t.tags.includes(tag);
}

let injected = false;
export function injectTemplateCss() {
  if (injected) return;
  injected = true;
  // letter-spacing passa por min(…, --ls-max): no modo padrão (leitura por ATS) o espaçamento entre
  // letras fica limitado, porque letras muito afastadas viram "A N A L I S T A" no texto do PDF
  const css = TEMPLATES.map((t) => t.css
    .replace(/\.T\b/g, `.tpl-${t.id}`)
    .replace(/letter-spacing:\s*([^;}\n]+)/g, 'letter-spacing: min($1, var(--ls-max))')).join('\n');
  const el = document.createElement('style');
  el.id = 'template-css';
  el.textContent = css;
  document.head.appendChild(el);
}

export type { TemplateDef };
