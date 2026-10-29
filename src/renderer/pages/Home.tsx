// Início: seus currículos em grade (miniaturas) ou em lista (com modelo, nota ATS e última edição).
import { useMemo, useState } from 'react';
import { TopBar } from '../App';
import { Icon } from '../components/Icon';
import { Empty, Segmented, SHEET_PX, Thumb, useMenu, useWidth } from '../components/ui';
import { useStore } from '../store';
import type { Resume } from '../types';
import { timeAgo } from '../../shared/dates.mjs';
import { analyzeResume } from '../../shared/ats.mjs';
import { getTemplate } from '../templates';

export function Home() {
  const { resumes, settings, setSettings, nav, setNewOpen, importFiles, broken } = useStore();
  const [q, setQ] = useState('');
  const viewMode = settings?.listView === 'list' ? 'list' : 'grid';
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return resumes;
    return resumes.filter((r) => `${r.docTitle} ${r.profile.name} ${r.profile.title}`.toLowerCase().includes(s));
  }, [q, resumes]);

  return (
    <>
      <TopBar title="Currículos">
        {resumes.length > 5 ? (
          <div style={{ position: 'relative', width: 220 }}>
            <Icon name="search" size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--muted)' }} />
            <input className="input" style={{ paddingLeft: 32, height: 36 }} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        ) : null}
        {resumes.length ? (
          <Segmented label="Modo de exibição" value={viewMode} onChange={(v) => setSettings({ listView: v })}
            options={[{ value: 'grid', label: 'Grade' }, { value: 'list', label: 'Lista' }]} />
        ) : null}
        <button className="btn ghost" onClick={() => importFiles()} title="Importar JSON ou PDF gerado pelo app (Ctrl+O)"><Icon name="upload" size={17} />Importar</button>
        <button className="btn primary" onClick={() => setNewOpen(true)} title="Ctrl+N"><Icon name="plus" size={17} />Novo currículo</button>
      </TopBar>
      <div className="ui-content">
        <div className="ui-page" style={{ maxWidth: 1400 }}>
          {broken.length ? (
            <div className="banner warn" style={{ margin: '0 0 16px' }}>
              <span className="bi"><Icon name="alert" /></span>
              <div className="bt"><b>{broken.length} arquivo(s) de currículo não puderam ser lidos</b><div>Eles foram ignorados e continuam na pasta de dados. Veja em Diagnóstico.</div></div>
              <button className="btn sm" onClick={() => nav({ name: 'diagnostics' })}>Abrir diagnóstico</button>
            </div>
          ) : null}
          {!resumes.length ? (
            <Empty icon="file" title="Seu primeiro currículo começa aqui" text="Escolha um dos 53 modelos, preencha com calma e exporte um PDF com texto de verdade — pronto para os sistemas de RH.">
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn primary" onClick={() => setNewOpen(true)}><Icon name="plus" size={17} />Criar currículo</button>
                <button className="btn" onClick={() => nav({ name: 'templates' })}><Icon name="shapes" size={17} />Ver modelos</button>
              </div>
            </Empty>
          ) : !filtered.length ? (
            <Empty icon="search" title="Nada encontrado" text={`Nenhum currículo com “${q}”.`} />
          ) : (
            <>
              <div className="home-head"><h2>{q ? 'Resultados' : 'Recentes primeiro'}</h2><span>{filtered.length} {filtered.length === 1 ? 'currículo' : 'currículos'}</span></div>
              {viewMode === 'list' ? <List list={filtered} /> : <Grid list={filtered} showNew={!q} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function useResumeMenu() {
  const { nav, duplicate, remove, exportPdf } = useStore();
  const menu = useMenu();
  const openFor = (e: React.MouseEvent, r: Resume) => menu.open(e, [
    { label: 'Abrir', icon: 'edit', onClick: () => nav({ name: 'editor', id: r.id }) },
    { label: 'Exportar PDF', icon: 'file-pdf', onClick: () => exportPdf(r) },
    { label: 'Exportar versão ATS', icon: 'ats', onClick: () => exportPdf(r, { ats: true }) },
    { label: 'Trocar modelo', icon: 'shapes', onClick: () => nav({ name: 'templates', applyTo: r.id }) },
    { label: 'Duplicar', icon: 'copy', onClick: () => duplicate(r) },
    { sep: true },
    { label: 'Excluir', icon: 'trash', danger: true, onClick: () => remove(r) },
  ]);
  return { ...menu, openFor };
}

function scoreColor(n: number) {
  return n >= 80 ? 'var(--ok)' : n >= 55 ? 'var(--warn)' : 'var(--bad)';
}

function List({ list }: { list: Resume[] }) {
  const { nav, exportPdf, duplicate } = useStore();
  const menu = useResumeMenu();
  return (
    <div className="rlist">
      <div className="rlist-head"><span /><span>Currículo</span><span>Modelo</span><span>Análise ATS</span><span>Editado</span><span /></div>
      {list.map((r) => {
        const tpl = getTemplate(r.template);
        const score = analyzeResume(r, tpl).score;
        const open = () => nav({ name: 'editor', id: r.id });
        return (
          <div key={r.id} className="rrow" tabIndex={0} role="button" onClick={open} onKeyDown={(e) => { if (e.key === 'Enter') open(); }} onContextMenu={(e) => menu.openFor(e, r)}>
            <div className="mini"><Thumb resume={r} width={40} /></div>
            <div className="t"><b>{r.docTitle}</b><small>{[r.profile.name, r.profile.title].filter(Boolean).join(' · ') || 'Sem nome ainda'}</small></div>
            <span className="c">{tpl.name}</span>
            <span className="score-pill" title="Nota da análise para sistemas de RH"><i style={{ background: scoreColor(score) }} />{score}/100</span>
            <span className="c muted" title={new Date(r.updatedAt).toLocaleString('pt-BR')}>{timeAgo(r.updatedAt)}</span>
            <span className="acts" onClick={(e) => e.stopPropagation()}>
              <button className="iconbtn" title="Exportar PDF" onClick={() => exportPdf(r)}><Icon name="file-pdf" size={17} /></button>
              <button className="iconbtn" title="Duplicar" onClick={() => duplicate(r)}><Icon name="copy" size={17} /></button>
              <button className="iconbtn" title="Mais ações" onClick={(e) => menu.openFor(e, r)}><Icon name="more" size={17} /></button>
            </span>
          </div>
        );
      })}
      {menu.node}
    </div>
  );
}

function Grid({ list, showNew }: { list: Resume[]; showNew: boolean }) {
  const { nav, setNewOpen } = useStore();
  const menu = useResumeMenu();
  const [ref, w] = useWidth<HTMLDivElement>();
  const cols = Math.max(1, Math.floor((w + 22) / (210 + 22)));
  const cardW = cols ? (w - 22 * (cols - 1)) / cols - 20 : 190;
  const [pw, ph] = SHEET_PX.A4;
  return (
    <div className="cards" ref={ref} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
      {showNew ? (
        <div className="rcard new" tabIndex={0} role="button" onClick={() => setNewOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter') setNewOpen(true); }}>
          <div className="newbox" style={{ height: Math.round(cardW * (ph / pw)) }}><div><Icon name="plus" size={28} />Novo currículo</div></div>
          <div className="t"><span>Começar outro</span></div>
          <div className="m">Em branco ou com exemplo</div>
        </div>
      ) : null}
      {list.map((r) => (
        <div key={r.id} className="rcard" tabIndex={0} onClick={() => nav({ name: 'editor', id: r.id })} onKeyDown={(e) => { if (e.key === 'Enter') nav({ name: 'editor', id: r.id }); }}
          onContextMenu={(e) => menu.openFor(e, r)}>
          <div className="thumbbox">{w ? <Thumb resume={r} width={cardW} /> : null}</div>
          <div className="t"><span>{r.docTitle}</span></div>
          <div className="m">{getTemplate(r.template).name} · editado {timeAgo(r.updatedAt)}</div>
          <div className="acts"><button className="iconbtn" title="Mais ações" onClick={(e) => { e.stopPropagation(); menu.openFor(e, r); }}><Icon name="more" size={16} /></button></div>
        </div>
      ))}
      {menu.node}
    </div>
  );
}
