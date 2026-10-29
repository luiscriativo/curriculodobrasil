// Novo currículo: nome e modelo. Sempre começa com o exemplo preenchido, para trocar pelo seu conteúdo.
import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal, Thumb, useToast } from '../components/ui';
import { useStore } from '../store';
import { TEMPLATES } from '../templates';
import { sampleResume } from '../../shared/sample.mjs';
import { normalizeResume } from '../../shared/model.mjs';
import type { Resume } from '../types';

export function NewResume({ onClose }: { onClose: () => void }) {
  const { create, nav, settings, importFiles } = useStore();
  const toast = useToast();
  const [title, setTitle] = useState(settings?.userName ? `Currículo — ${settings.userName}` : '');
  const [tpl, setTpl] = useState('ipanema');
  const [busy, setBusy] = useState(false);
  const demo = useMemo(() => normalizeResume(sampleResume()) as Resume, []);
  const go = async () => {
    setBusy(true);
    try {
      const r = await create({ template: tpl, sample: true, title: title.trim() || undefined });
      onClose();
      nav({ name: 'editor', id: r.id });
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível criar', text: (e as Error).message });
      setBusy(false);
    }
  };
  return (
    <Modal wide title="Novo currículo" sub="Dá para trocar de modelo depois, sem perder nada." onClose={onClose} footer={<>
      <button className="btn ghost" style={{ marginRight: 'auto' }} onClick={() => { onClose(); importFiles(); }}><Icon name="upload" size={16} />Importar arquivo</button>
      <button className="btn ghost" onClick={onClose}>Cancelar</button>
      <button className="btn primary" disabled={busy} onClick={go}>{busy ? <span className="spinner" /> : <Icon name="plus" size={16} />}Criar e editar</button>
    </>}>
      <div className="field" style={{ marginBottom: 16, maxWidth: 520 }}><label>Nome do currículo (só para você)</label><input className="input" autoFocus placeholder="Ex.: Currículo — Vaga de Analista" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') go(); }} /></div>
      <div className="lbl" style={{ marginBottom: 8 }}>Modelo</div>
      <div className="tpl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', maxHeight: 420, overflow: 'auto', padding: 4 }}>
        {TEMPLATES.map((t) => (
          <div key={t.id} className={`tpl-mini ${tpl === t.id ? 'on' : ''}`} role="button" tabIndex={0} onClick={() => setTpl(t.id)} onDoubleClick={go} title={t.desc}>
            <div className="thumbbox"><Thumb resume={demo} templateId={t.id} width={110} /></div>
            <div className="n"><span>{t.name}</span></div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
