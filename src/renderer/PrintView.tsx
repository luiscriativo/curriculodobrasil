// Janela oculta de impressão: recebe o currículo, desenha a folha e avisa quando fontes e imagens carregaram.
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { api } from './api';
import type { Resume } from './types';
import { Sheet } from './templates/Sheet';

export function PrintView() {
  const [job, setJob] = useState<{ id: number; resume: Resume; templateOverride: string | null } | null>(null);
  useEffect(() => api.print.onRender(async (m) => {
    try {
      flushSync(() => setJob(m));
      const paper = m.resume.style.paper === 'Letter' ? 'Letter' : 'A4';
      let st = document.getElementById('page-css');
      if (!st) { st = document.createElement('style'); st.id = 'page-css'; document.head.appendChild(st); }
      // Margens reais de página em cima/embaixo (exceto o topo da 1ª): o respiro entre páginas fica
      // garantido e o Chromium não empurra blocos inteiros para a página seguinte por causa do
      // padding inferior da folha. Os fundos fixos (.bg) continuam cobrindo a página inteira.
      st.textContent = `@page { size: ${paper}; margin: 11mm 0 11mm 0; } @page :first { margin-top: 0; }`;
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const sheet = document.querySelector('.cv') as HTMLElement | null;
      const pageH = paper === 'Letter' ? 279.4 : 297;
      const mm = sheet ? sheet.getBoundingClientRect().height / (96 / 25.4) : 0;
      api.print.done({ id: m.id, pages: Math.max(1, Math.ceil((mm - 0.5) / pageH)) });
    } catch (e) {
      api.print.done({ id: m.id, error: String((e as Error)?.message || e) });
    }
  }), []);
  if (!job) return null;
  return <Sheet resume={job.resume} templateId={job.templateOverride || undefined} />;
}
