// Galeria de modelos com filtros e prévia ampliada.
import { useMemo, useState } from 'react';
import { TopBar } from '../App';
import { Icon } from '../components/Icon';
import { Empty, Modal, Segmented, Thumb, useToast, useWidth } from '../components/ui';
import { useStore } from '../store';
import { TEMPLATES, matchesTag, type TemplateDef } from '../templates';
import { fillWithSample, sampleResume } from '../../shared/sample.mjs';
import { normalizeResume } from '../../shared/model.mjs';
import type { Resume } from '../types';

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'com foto', label: 'Com foto' },
  { value: 'sem foto', label: 'Sem foto' },
  { value: 'ATS', label: 'ATS' },
  { value: 'criativo', label: 'Criativos' },
  { value: 'elegante', label: 'Elegantes' },
];

export const ATS_LABEL = { alta: 'ATS: ótimo', media: 'ATS: bom', baixa: 'ATS: criativo' } as const;
export const ATS_CLASS = { alta: 'ok', media: '', baixa: 'warn' } as const;

export function TemplatesPage({ applyTo }: { applyTo?: string }) {
  const { resumes, nav, create, save } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('todos');
  const [open, setOpen] = useState<TemplateDef | null>(null);
  const target = applyTo ? resumes.find((r) => r.id === applyTo) : undefined;
  // Prévia com os dados do currículo em edição (ou o exemplo)
  const demo = useMemo(() => (target ? fillWithSample(target) : normalizeResume(sampleResume())) as Resume, [target]);
  const list = TEMPLATES.filter((t) => filter === 'todos' || matchesTag(t, filter));
  const [ref, w] = useWidth<HTMLDivElement>();
  const cols = Math.max(1, Math.floor((w + 22) / (210 + 22)));
  const cardW = cols ? (w - 22 * (cols - 1)) / cols - 20 : 190;

  const use = async (t: TemplateDef) => {
    try {
      if (target) {
        await save({ ...target, template: t.id, updatedAt: Date.now() });
        nav({ name: 'editor', id: target.id });
        toast.show({ kind: 'success', title: `Modelo ${t.name} aplicado` });
      } else {
        const r = await create({ template: t.id });
        nav({ name: 'editor', id: r.id });
      }
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível usar o modelo', text: (e as Error).message });
    }
  };

  return (
    <>
      <TopBar title="Modelos" sub={`${TEMPLATES.length} modelos${target ? ` · aplicando em “${target.docTitle}”` : ''}`}
        left={target ? <button className="iconbtn" title="Voltar ao editor" onClick={() => nav({ name: 'editor', id: target.id })}><Icon name="arrow-left" /></button> : undefined}>
        <Segmented value={filter} onChange={setFilter} options={FILTERS} label="Filtrar modelos" />
      </TopBar>
      <div className="ui-content">
        <div className="ui-page" style={{ maxWidth: 1400 }}>
          {!list.length ? <Empty icon="shapes" title="Nenhum modelo neste filtro" /> : (
            <div className="cards" ref={ref} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
              {list.map((t) => (
                <div key={t.id} className={`rcard ${target?.template === t.id ? 'on' : ''}`} tabIndex={0} onClick={() => setOpen(t)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(t); }}>
                  <div className="thumbbox">{w ? <Thumb resume={demo} templateId={t.id} width={cardW} /> : null}</div>
                  <div className="t"><span>{t.name}</span>{target?.template === t.id ? <span className="badge accent">Em uso</span> : null}</div>
                  <div className="m" style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className={`badge ${ATS_CLASS[t.ats]}`}>{ATS_LABEL[t.ats]}</span>
                    <span className="badge">{t.photo === 'yes' ? 'Com foto' : 'Sem foto'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {open ? (
        <Modal wide title={open.name} sub={open.desc} onClose={() => setOpen(null)} footer={<>
          <button className="btn ghost" onClick={() => setOpen(null)}>Fechar</button>
          <button className="btn primary" onClick={() => use(open)}><Icon name={target ? 'check' : 'plus'} size={17} />{target ? 'Aplicar neste currículo' : 'Criar currículo com este modelo'}</button>
        </>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 26, alignItems: 'start' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--sheet-shadow)', justifySelf: 'center' }}><Thumb resume={demo} templateId={open.id} width={560} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5, color: 'var(--text-2)' }}>
              <div><div className="lbl">Leitura por sistemas de RH</div><span className={`badge ${ATS_CLASS[open.ats]}`} style={{ marginTop: 6 }}>{ATS_LABEL[open.ats]}</span>
                <p style={{ margin: '8px 0 0' }}>{open.ats === 'alta' ? 'Uma coluna, ordem de leitura perfeita.' : open.ats === 'media' ? 'Duas colunas. O PDF tem texto real; para sites de vagas você também pode exportar a versão ATS.' : 'Visual criativo, ideal para enviar direto a pessoas. Para sites de vagas, exporte também a versão ATS.'}</p></div>
              <div><div className="lbl">Foto</div>{open.photo === 'yes' ? 'Tem espaço para foto (opcional: sem foto o layout se ajusta).' : 'Sem foto.'}</div>
              <div><div className="lbl">Cores sugeridas</div><div className="swatches" style={{ marginTop: 6 }}>{(open.palette || [open.accent]).map((c) => <span key={c} className="sw" style={{ background: c, width: 22, height: 22 }} />)}</div></div>
              {open.refs.length ? <div><div className="lbl">Inspirado em</div>{open.refs.join(', ')} (pasta modelos)</div> : null}
              <div className="hint">A prévia usa {target ? 'os dados do seu currículo (o que falta vem de um exemplo)' : 'um currículo de exemplo'}. Cores, fontes e espaçamentos podem ser ajustados no editor.</div>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
