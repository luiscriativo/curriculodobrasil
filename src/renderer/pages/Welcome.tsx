// Primeira execução: o que o app faz, nome do usuário e como começar.
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Logo } from '../App';
import { Icon } from '../components/Icon';
import { Thumb } from '../components/ui';
import { useStore } from '../store';
import { sampleResume } from '../../shared/sample.mjs';
import { normalizeResume } from '../../shared/model.mjs';
import type { Resume } from '../types';

export function Welcome() {
  const { setSettings, create, nav } = useStore();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const demo = useMemo(() => normalizeResume(sampleResume()) as Resume, []);
  const finish = async (how: 'blank' | 'sample' | 'templates') => {
    setBusy(true);
    await setSettings({ welcomed: true, userName: name.trim() });
    if (how === 'templates') { nav({ name: 'templates' }); return; }
    const r = await create({ sample: how === 'sample' });
    nav({ name: 'editor', id: r.id });
  };
  return createPortal(
    <div className="overlay">
      <div className="modal welcome" role="dialog" aria-modal="true" aria-label="Boas-vindas">
        <div className="wl">
          <div style={{ color: 'var(--text)' }}><Logo size={44} /></div>
          <h1>Currículos bonitos, <em>lidos por qualquer RH.</em></h1>
          <p>Escolha entre mais de 50 modelos, edite com prévia ao vivo e exporte um PDF com texto de verdade — que sistemas de RH e IAs conseguem ler.</p>
          <div className="feat"><Icon name="shapes" size={17} />Troque de modelo a qualquer momento sem perder nada.</div>
          <div className="feat"><Icon name="target" size={17} />Análise para ATS e comparação com o texto da vaga.</div>
          <div className="feat"><Icon name="lock" size={17} />Tudo fica no seu computador. Salva sozinho.</div>
          <div className="field" style={{ marginTop: 6 }}>
            <label>Como você se chama?</label>
            <input className="input" autoFocus placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) finish('blank'); }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <button className="btn primary" disabled={busy} onClick={() => finish('blank')}>Começar meu currículo<Icon name="arrow-right" size={16} /></button>
            <button className="btn" disabled={busy} onClick={() => finish('sample')}>Ver um exemplo pronto</button>
          </div>
          <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} disabled={busy} onClick={() => finish('templates')}>Prefiro escolher o modelo primeiro</button>
        </div>
        <div className="wr" aria-hidden>
          <div className="fan">
            <div style={{ left: 40, top: 70, transform: 'rotate(-8deg)' }}><Thumb resume={demo} templateId="pampulha" width={210} /></div>
            <div style={{ left: 170, top: 40, transform: 'rotate(5deg)' }}><Thumb resume={demo} templateId="leblon" width={210} /></div>
            <div style={{ left: 100, top: 170, transform: 'rotate(-1deg)' }}><Thumb resume={demo} templateId="olinda" width={220} /></div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
