import { useEffect, useState } from 'react';
import { api } from './api';
import { Icon } from './components/Icon';
import { ConfirmProvider, ToastProvider } from './components/ui';
import { StoreProvider, useStore, type View } from './store';
import { Home } from './pages/Home';
import { TemplatesPage } from './pages/Templates';
import { Editor } from './pages/Editor';
import { SettingsPage } from './pages/Settings';
import { Diagnostics } from './pages/Diagnostics';
import { Welcome } from './pages/Welcome';
import { NewResume } from './pages/NewResume';
import { UpdateBanner } from './components/UpdateBanner';

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="5" y="3" width="22" height="26" rx="5" fill="currentColor" opacity=".14" />
      <rect x="5" y="3" width="22" height="26" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 10.5h8M11 15h10M11 19.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="23.5" cy="23.5" r="4.2" fill="var(--accent)" />
    </svg>
  );
}

function Rail() {
  const { view, nav, info, update } = useStore();
  const items: { v: View['name']; icon: string; tip: string }[] = [
    { v: 'home', icon: 'file', tip: 'Currículos' },
    { v: 'templates', icon: 'shapes', tip: 'Modelos' },
  ];
  const active = view.name === 'editor' ? 'home' : view.name;
  const hasUpdate = update && ['available', 'downloading', 'downloaded'].includes(update.state);
  return (
    <nav className="rail" aria-label="Navegação">
      <div className="rail-logo"><Logo /></div>
      {items.map((it) => (
        <button key={it.v} className={`rail-btn tip ${active === it.v ? 'on' : ''}`} data-tip={it.tip} aria-label={it.tip} onClick={() => nav({ name: it.v } as View)}>
          <Icon name={it.icon} size={22} />
        </button>
      ))}
      <div className="rail-sp" />
      <button className={`rail-btn tip ${active === 'diagnostics' ? 'on' : ''}`} data-tip="Diagnóstico" aria-label="Diagnóstico" onClick={() => nav({ name: 'diagnostics' })}><Icon name="pulse" size={22} /></button>
      <button className={`rail-btn tip ${active === 'settings' ? 'on' : ''}`} data-tip="Configurações" aria-label="Configurações" onClick={() => nav({ name: 'settings' })}>
        <Icon name="settings" size={22} />{hasUpdate ? <span className="dot" /> : null}
      </button>
      {info ? <button className="rail-ver num" title={hasUpdate ? 'Atualização disponível' : 'Versão instalada'} onClick={() => nav({ name: 'settings' })}>{hasUpdate ? <span className="led" /> : null}v{info.version}</button> : null}
    </nav>
  );
}

function Shell() {
  const { view, settings, ready, importFiles, newOpen, setNewOpen, nav, info } = useStore();
  const [drag, setDrag] = useState(false);

  // Arrastar arquivos (.json ou PDF do app) para a janela importa
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files');
    const enter = (e: DragEvent) => { if (!hasFiles(e)) return; e.preventDefault(); depth++; setDrag(true); };
    const over = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault(); };
    const leave = (e: DragEvent) => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) setDrag(false); };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDrag(false);
      // A foto do editor trata o próprio drop
      if ((e.target as HTMLElement)?.closest?.('[data-own-drop]')) return;
      const paths = [...(e.dataTransfer?.files || [])].map((f) => api.pathForFile(f)).filter((p) => /\.(json|pdf)$/i.test(p));
      if (paths.length) importFiles(paths);
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    return () => { window.removeEventListener('dragenter', enter); window.removeEventListener('dragover', over); window.removeEventListener('dragleave', leave); window.removeEventListener('drop', drop); };
  }, [importFiles]);

  // Atalhos globais
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); setNewOpen(true); }
      if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); importFiles(); }
      if (mod && e.key === ',') { e.preventDefault(); nav({ name: 'settings' }); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [importFiles, nav, setNewOpen]);

  if (!ready) return <div className="app"><Rail /><main className="app-main"><div className="pv-loading"><span className="spinner" />Carregando seus currículos…</div></main></div>;
  return (
    <div className={`app platform-${info?.platform || ''}`}>
      <Rail />
      <main className="app-main">
        {view.name === 'home' && <Home />}
        {view.name === 'templates' && <TemplatesPage applyTo={view.applyTo} />}
        {view.name === 'editor' && <Editor key={view.id} id={view.id} initialTab={view.tab} />}
        {view.name === 'settings' && <SettingsPage section={view.section} />}
        {view.name === 'diagnostics' && <Diagnostics />}
      </main>
      {settings && !settings.welcomed ? <Welcome /> : null}
      {newOpen ? <NewResume onClose={() => setNewOpen(false)} /> : null}
      {drag ? <div className="drop-overlay"><div><Icon name="upload" />Solte para importar o currículo (JSON ou PDF gerado pelo app)</div></div> : null}
    </div>
  );
}

export function TopBar({ title, sub, children, left }: { title?: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode; left?: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        {left}
        {title ? <h1>{title}</h1> : null}
        {sub ? <span className="sub">{sub}</span> : null}
        <div className="drag" />
        {children}
      </header>
      <UpdateBanner />
    </>
  );
}

export function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
