// Aba "Modelo": troca o visual sem perder nada do conteúdo.
import { useState } from 'react';
import { Segmented, Thumb, useWidth } from '../../components/ui';
import type { Resume } from '../../types';
import type { Update } from '../Editor';
import { TEMPLATES, matchesTag } from '../../templates';
import { ATS_CLASS, ATS_LABEL } from '../Templates';

export function TemplatePanel({ doc, update }: { doc: Resume; update: Update }) {
  const [filter, setFilter] = useState('todos');
  const [ref, w] = useWidth<HTMLDivElement>();
  const cols = Math.max(1, Math.floor((w + 12) / (120 + 12)));
  const cardW = cols ? (w - 12 * (cols - 1)) / cols - 12 : 110;
  const list = TEMPLATES.filter((t) => filter === 'todos' || matchesTag(t, filter));
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Segmented size="sm" value={filter} onChange={setFilter} label="Filtrar" options={[
          { value: 'todos', label: 'Todos' }, { value: 'com foto', label: 'Com foto' }, { value: 'sem foto', label: 'Sem foto' }, { value: 'ATS', label: 'ATS' }, { value: 'criativo', label: 'Criativos' },
        ]} />
      </div>
      <p className="hint" style={{ margin: '0 0 12px' }}>A prévia usa os seus dados. Trocar de modelo mantém todo o conteúdo; cores e fontes personalizadas continuam valendo.</p>
      <div className="tpl-grid" ref={ref}>
        {list.map((t) => (
          <div key={t.id} className={`tpl-mini ${doc.template === t.id ? 'on' : ''}`} role="button" tabIndex={0} title={t.desc}
            onClick={() => update((r) => ({ ...r, template: t.id }))} onKeyDown={(e) => { if (e.key === 'Enter') update((r) => ({ ...r, template: t.id })); }}>
            <div className="thumbbox">{w ? <Thumb resume={doc} templateId={t.id} width={cardW} /> : null}</div>
            <div className="n"><span>{t.name}</span><span className={`badge ${ATS_CLASS[t.ats]}`} style={{ fontSize: 10, padding: '1px 6px' }}>{ATS_LABEL[t.ats].replace('ATS: ', '')}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
