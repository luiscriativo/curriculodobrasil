// Aba "Análise": nota para sistemas de RH, checklist clicável e comparação com o texto de uma vaga.
import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import type { Resume } from '../../types';
import { analyzeResume, matchKeywords } from '../../../shared/ats.mjs';
import { getTemplate } from '../../templates';

const ICON = { ok: 'check-circle', warn: 'alert', bad: 'alert-circle', info: 'info' } as const;

export function AtsPanel({ doc, onGo, onExportAts }: { doc: Resume; onGo: (target: string) => void; onExportAts: () => void }) {
  const tpl = getTemplate(doc.template);
  const res = useMemo(() => analyzeResume(doc, tpl), [doc, tpl]);
  const [job, setJob] = useState('');
  const kw = useMemo(() => (job.trim().length > 40 ? matchKeywords(doc, job) : null), [doc, job]);
  const color = res.score >= 80 ? 'var(--ok)' : res.score >= 55 ? 'var(--warn)' : 'var(--bad)';
  const order = { bad: 0, warn: 1, info: 2, ok: 3 } as const;
  const checks = [...res.checks].sort((a, b) => order[a.status] - order[b.status]);
  const C = 2 * Math.PI * 36;
  return (
    <div>
      <div className="blk score">
        <div className="ring">
          <svg width="84" height="84"><circle cx="42" cy="42" r="36" fill="none" stroke="var(--hover)" strokeWidth="8" /><circle cx="42" cy="42" r="36" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(res.score / 100) * C} ${C}`} style={{ transition: 'stroke-dasharray .4s' }} /></svg>
          <b className="num">{res.score}</b>
        </div>
        <div>
          <b style={{ fontSize: 15 }}>{res.score >= 80 ? 'Ótimo para sistemas de RH' : res.score >= 55 ? 'Bom, dá para melhorar' : 'Precisa de atenção'}</b>
          <div className="hint" style={{ marginTop: 3 }}>{res.words} palavras · {res.checks.filter((c) => c.status === 'ok').length} de {res.checks.filter((c) => c.status !== 'info').length} itens ok. Clique num item para ir até ele.</div>
          {tpl.ats !== 'alta' ? <button className="btn sm" style={{ marginTop: 8 }} onClick={onExportAts}><Icon name="ats" size={15} />Exportar versão ATS</button> : null}
        </div>
      </div>
      <div className="blk" style={{ padding: 6 }}>
        {checks.map((c) => (
          <div key={c.id} className={`chk ${c.status}`} role="button" tabIndex={0} onClick={() => c.target && onGo(c.target)} onKeyDown={(e) => { if (e.key === 'Enter' && c.target) onGo(c.target); }}>
            <span className="ci"><Icon name={ICON[c.status]} size={18} /></span>
            <div><b>{c.title}</b>{c.status !== 'ok' || c.id === 'template' ? <small>{c.detail}</small> : null}</div>
          </div>
        ))}
      </div>
      <div className="blk" style={{ padding: 14 }}>
        <b style={{ fontWeight: 600 }}>Compare com uma vaga</b>
        <p className="hint" style={{ margin: '4px 0 10px' }}>Cole o texto do anúncio. Mostramos as palavras-chave da vaga que já estão no seu currículo e as que faltam — sistemas de RH e IAs costumam procurar exatamente esses termos.</p>
        <textarea className="textarea" rows={5} placeholder="Cole aqui a descrição da vaga…" value={job} onChange={(e) => setJob(e.target.value)} />
        {kw ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ fontWeight: 500 }}>Aderência: <span className="num">{kw.pct}%</span></b><span className="hint">{kw.found.length} de {kw.keys.length} termos</span></div>
            {kw.missing.length ? <><div className="lbl" style={{ margin: '10px 0 6px' }}>Faltam no currículo (inclua só o que for verdade)</div><div className="chips">{kw.missing.map((k) => <span key={k} className="kw miss">{k}</span>)}</div></> : null}
            {kw.found.length ? <><div className="lbl" style={{ margin: '10px 0 6px' }}>Já aparecem</div><div className="chips">{kw.found.map((k) => <span key={k} className="kw ok">{k}</span>)}</div></> : null}
          </div>
        ) : job.trim() ? <p className="hint" style={{ marginTop: 8 }}>Cole um trecho maior da vaga para analisar.</p> : null}
      </div>
    </div>
  );
}
