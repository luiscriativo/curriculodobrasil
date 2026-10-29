// Folha do currículo: aplica o modelo aos dados. Usada na prévia, nas miniaturas e no PDF.
import { memo, useLayoutEffect, useRef } from 'react';
import type { Resume } from '../types';
import { Ctx, sheetVars } from './engine';
import { getTemplate } from './index';

/** Nomes longos em colunas estreitas: diminui a fonte até nenhuma palavra estourar a largura. */
function fitNames(root: HTMLElement) {
  for (const el of root.querySelectorAll<HTMLElement>('.nm, .fit, .ct li .ct-v')) {
    el.style.fontSize = '';
    const base = parseFloat(getComputedStyle(el).fontSize);
    for (let k = 1; k <= 12 && el.scrollWidth > el.clientWidth + 1; k++) el.style.fontSize = `${base * (1 - k * 0.05)}px`;
  }
}

export const Sheet = memo(function Sheet({ resume, templateId }: { resume: Resume; templateId?: string }) {
  const tpl = getTemplate(templateId || resume.template);
  const c = new Ctx(resume, tpl);
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    fitNames(el);
    // Fontes carregando depois do primeiro desenho mudam as medidas
    let alive = true;
    document.fonts.ready.then(() => { if (alive) fitNames(el); });
    return () => { alive = false; };
  });
  return (
    <article ref={ref} className={`cv tpl-${tpl.id} ${resume.style.decorativeSpacing ? 'ls-design' : ''}`} style={sheetVars(resume, tpl)}
      lang={{ pt: 'pt-BR', en: 'en', es: 'es' }[resume.style.lang]}>
      {tpl.render(c)}
    </article>
  );
});
