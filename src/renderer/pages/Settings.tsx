// Configurações: atualizações, aparência, exportação, padrões de currículo, dados e sobre.
import { useEffect, useState } from 'react';
import { TopBar } from '../App';
import { api } from '../api';
import { Icon } from '../components/Icon';
import { Segmented, Switch, useToast } from '../components/ui';
import { useStore } from '../store';
import { exportFileName } from '../../shared/model.mjs';
import { formatDate } from '../../shared/dates.mjs';

const SECTIONS = [
  { id: 'geral', label: 'Geral', icon: 'settings' },
  { id: 'exportacao', label: 'Exportação', icon: 'file-pdf' },
  { id: 'curriculo', label: 'Novos currículos', icon: 'file' },
  { id: 'dados', label: 'Seus dados', icon: 'folder' },
  { id: 'atalhos', label: 'Atalhos', icon: 'bolt' },
];

export function SettingsPage({ section }: { section?: string }) {
  const { settings, setSettings, info, update, resumes } = useStore();
  const toast = useToast();
  const [sec, setSecState] = useState(section || 'geral');
  const [checking, setChecking] = useState(false);
  const setSec = (id: string) => { setSecState(id); document.getElementById(`set-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  useEffect(() => { if (section) document.getElementById(`set-${section}`)?.scrollIntoView({ block: 'start' }); }, [section]);
  if (!settings || !info) return null;
  const s = settings;
  const example = exportFileName(s.fileNamePattern, resumes[0] || { profile: { name: 'Maria Silva', title: 'Analista' }, docTitle: 'Meu currículo' });

  const upText = () => {
    if (!update) return '';
    switch (update.state) {
      case 'dev': return 'Modo de desenvolvimento: as atualizações ficam desligadas.';
      case 'checking': return 'Procurando atualizações…';
      case 'available': return `Versão ${update.version} disponível.`;
      case 'downloading': return `Baixando a versão ${update.version}… ${update.percent}%`;
      case 'downloaded': return `A versão ${update.version} está pronta para instalar.`;
      case 'error': return update.error || 'Erro ao verificar.';
      default: return update.checkedAt ? `Você está na versão mais recente · verificado às ${new Date(update.checkedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'O app verifica sozinho ao abrir e a cada 6 horas.';
    }
  };
  const upButton = () => {
    if (update?.state === 'available') return <button className="btn primary" onClick={() => api.update.download()}>{update.manual ? 'Baixar no site' : 'Baixar atualização'}</button>;
    if (update?.state === 'downloaded') return <button className="btn primary" onClick={() => api.update.install()}>Reiniciar e instalar</button>;
    if (update?.state === 'downloading') return <span className="badge num">{update.percent}%</span>;
    return <button className="btn" disabled={checking || update?.state === 'dev'} onClick={async () => { setChecking(true); try { await api.update.check(); } finally { setChecking(false); } }}>{checking ? <span className="spinner" /> : <Icon name="refresh" size={16} />}Verificar agora</button>;
  };

  return (
    <>
      <TopBar title="Configurações" />
      <div className="ui-content">
        <div className="ui-page set-layout">
          <nav className="set-nav">{SECTIONS.map((x) => <button key={x.id} className={sec === x.id ? 'on' : ''} onClick={() => setSec(x.id)}><Icon name={x.icon} size={17} />{x.label}</button>)}</nav>
          <div>
            <div className="ui-card set-card" id="set-geral">
              <h3>Atualizações</h3>
              <div className="opt-row"><div className="ot"><b>Currículo do Brasil v{info.version}</b><small>{upText()}</small></div>{upButton()}</div>
              <h3>Aparência</h3>
              <div className="opt-row"><div className="ot"><b>Tema</b><small>Automático acompanha o sistema.</small></div>
                <Segmented size="sm" value={s.theme} onChange={(v) => setSettings({ theme: v })} options={[{ value: 'system', label: <><Icon name="monitor" size={15} />Automático</> }, { value: 'light', label: <><Icon name="sun" size={15} />Claro</> }, { value: 'dark', label: <><Icon name="moon" size={15} />Escuro</> }]} /></div>
              <div className="opt-row"><div className="ot"><b>Seu nome</b><small>Usado ao criar currículos novos.</small></div>
                <input className="input" style={{ width: 260 }} value={s.userName} placeholder="Seu nome completo" onChange={(e) => setSettings({ userName: e.target.value })} /></div>
            </div>

            <div className="ui-card set-card" id="set-exportacao">
              <h3>Exportação de PDF</h3>
              <p>O PDF sai com texto de verdade (selecionável e lido por sistemas de RH e IAs), fontes embutidas e links clicáveis.</p>
              <div className="opt-row"><div className="ot"><b>Perguntar onde salvar</b><small>Desligado, salva direto na pasta abaixo.</small></div><Switch checked={s.askWhere} onChange={(v) => setSettings({ askWhere: v })} label="Perguntar onde salvar" /></div>
              <div className="opt-row"><div className="ot"><b>Pasta padrão</b><small style={{ userSelect: 'text' }}>{s.exportDir || 'Documentos'}</small></div>
                <span style={{ display: 'flex', gap: 6 }}>
                  {s.exportDir ? <button className="btn ghost sm" onClick={() => setSettings({ exportDir: '' })}>Usar Documentos</button> : null}
                  <button className="btn sm" onClick={async () => { const d = await api.shell.pickFolder(); if (d) { await setSettings({ exportDir: d }); toast.show({ kind: 'success', title: 'Pasta dos PDFs alterada', text: d }); } }}><Icon name="folder-open" size={15} />Escolher…</button>
                </span></div>
              <div className="opt-row" style={{ alignItems: 'flex-start' }}><div className="ot"><b>Nome do arquivo</b><small>Use {'{nome}'}, {'{cargo}'}, {'{titulo}'} e {'{data}'}. Exemplo: <b style={{ display: 'inline', fontWeight: 500 }}>{example}</b></small></div>
                <input className="input" style={{ width: 260 }} value={s.fileNamePattern} onChange={(e) => setSettings({ fileNamePattern: e.target.value })} onBlur={(e) => { if (!e.target.value.trim()) setSettings({ fileNamePattern: 'Currículo - {nome}' }); }} /></div>
              <div className="opt-row"><div className="ot"><b>Dados editáveis dentro do PDF</b><small>Anexa uma cópia do currículo ao PDF: arraste o PDF de volta para o app e continue editando. Não aparece na impressão.</small></div><Switch checked={s.embedData} onChange={(v) => setSettings({ embedData: v })} label="Dados editáveis" /></div>
              <div className="opt-row"><div className="ot"><b>Conferir o texto depois de exportar</b><small>Lê o PDF como um sistema de RH faria e avisa se nome, e-mail ou telefone não forem encontrados.</small></div><Switch checked={s.verifyText} onChange={(v) => setSettings({ verifyText: v })} label="Conferir texto" /></div>
              <div className="opt-row"><div className="ot"><b>Gerar também a versão ATS</b><small>Ao exportar um modelo de duas colunas ou criativo, salva junto uma versão de uma coluna, ideal para sites de vagas.</small></div><Switch checked={s.alsoAts} onChange={(v) => setSettings({ alsoAts: v })} label="Versão ATS junto" /></div>
              <div className="opt-row"><div className="ot"><b>Abrir o PDF depois de salvar</b></div><Switch checked={s.openAfterExport} onChange={(v) => setSettings({ openAfterExport: v })} label="Abrir PDF" /></div>
            </div>

            <div className="ui-card set-card" id="set-curriculo">
              <h3>Padrões para novos currículos</h3>
              <div className="opt-row"><div className="ot"><b>Idioma dos títulos</b><small>“Experiência” / “Experience” / “Experiencia”.</small></div>
                <select className="select" style={{ width: 200 }} value={s.defaultLang} onChange={(e) => setSettings({ defaultLang: e.target.value as 'pt' })}><option value="pt">Português</option><option value="en">English</option><option value="es">Español</option></select></div>
              <div className="opt-row"><div className="ot"><b>Formato das datas</b></div>
                <select className="select" style={{ width: 200 }} value={s.defaultDateFormat} onChange={(e) => setSettings({ defaultDateFormat: e.target.value as 'mm/yyyy' })}>
                  {(['mm/yyyy', 'mon yyyy', 'month yyyy', 'yyyy'] as const).map((f) => <option key={f} value={f}>{formatDate('03/2021', f, 'pt')}</option>)}
                </select></div>
            </div>

            <div className="ui-card set-card" id="set-dados">
              <h3>Seus dados</h3>
              <p>Tudo fica só no seu computador. Nada é enviado para a internet (só a verificação de atualizações consulta o GitHub).</p>
              <div className="opt-row"><div className="ot"><b>Pasta dos currículos</b><small style={{ userSelect: 'text' }}>{info.dataDir}</small></div><button className="btn sm" onClick={() => api.shell.open(info.dataDir)}><Icon name="folder-open" size={15} />Abrir</button></div>
              <div className="opt-row"><div className="ot"><b>Backup</b><small>Salva todos os currículos ({resumes.length}) num único arquivo .json.</small></div>
                <button className="btn sm" onClick={async () => { try { const r = await api.resumes.backup(); if (r.file) toast.show({ kind: 'success', title: `Backup salvo (${r.count} currículos)`, text: r.file, actions: [{ label: 'Mostrar na pasta', onClick: () => api.shell.reveal(r.file!) }] }); } catch (e) { toast.show({ kind: 'error', title: 'Não foi possível fazer o backup', text: (e as Error).message }); } }}><Icon name="download" size={15} />Fazer backup</button></div>
              <div className="opt-row"><div className="ot"><b>Restaurar ou importar</b><small>Aceita backups, arquivos .json de currículo e PDFs gerados pelo app.</small></div><ImportBtn /></div>
            </div>

            <div className="ui-card set-card" id="set-atalhos">
              <h3>Atalhos de teclado</h3>
              {[['Ctrl+N', 'Novo currículo'], ['Ctrl+O', 'Importar'], ['Ctrl+E', 'Exportar PDF (no editor)'], ['Ctrl+Shift+E', 'Exportar versão ATS'], ['Ctrl+P', 'Ver o PDF final'], ['Ctrl+Z / Ctrl+Y', 'Desfazer / refazer'], ['Ctrl+,', 'Configurações']].map(([k, d]) => (
                <div className="opt-row" key={k}><div className="ot"><b>{d}</b></div><span className="kbd" style={{ fontSize: 12, padding: '2px 8px' }}>{k}</span></div>
              ))}
            </div>
            <p className="hint" style={{ textAlign: 'center' }}>Currículo do Brasil v{info.version} · Electron {info.versions.electron} · <a href="#" onClick={(e) => { e.preventDefault(); api.shell.external('https://github.com/luiscriativo/curriculodobrasil'); }} style={{ color: 'inherit' }}>github.com/luiscriativo/curriculodobrasil</a></p>
          </div>
        </div>
      </div>
    </>
  );
}

function ImportBtn() {
  const { importFiles } = useStore();
  return <button className="btn sm" onClick={() => importFiles()}><Icon name="upload" size={15} />Importar…</button>;
}
