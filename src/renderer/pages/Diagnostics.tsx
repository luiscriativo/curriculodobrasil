// Diagnóstico: armazenamento, pasta dos PDFs, fontes e um teste real do motor de PDF.
import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '../App';
import { api } from '../api';
import { Icon } from '../components/Icon';
import { useStore } from '../store';
import { FONTS } from '../templates/engine';

type Row = { id: string; status: 'ok' | 'warn' | 'bad' | 'run'; title: string; detail: string; path?: string; fix?: string };

export function Diagnostics() {
  const { info, setSettings, update, nav } = useStore();
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [pdf, setPdf] = useState<null | { state: 'run' } | { state: 'done'; r: Awaited<ReturnType<typeof api.diag.pdfTest>> } | { state: 'err'; e: string }>(null);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const base = await api.diag.run();
      // Fontes embutidas: confere se cada família carrega
      const fams = Object.values(FONTS).map((f) => f.split(',')[0]);
      await Promise.all(fams.map((f) => document.fonts.load(`16px ${f}`).catch(() => [])));
      const missing = fams.filter((f) => !document.fonts.check(`16px ${f}`));
      setRows([...base, { id: 'fonts', status: missing.length ? 'warn' : 'ok', title: 'Fontes dos modelos', detail: missing.length ? `Não carregaram: ${missing.join(', ')}` : `${fams.length} famílias embutidas no app (o PDF não depende das fontes do computador).` }]);
    } catch (e) {
      setRows([{ id: 'err', status: 'bad', title: 'Não foi possível rodar o diagnóstico', detail: (e as Error).message }]);
    } finally {
      setRunning(false);
    }
  }, []);
  useEffect(() => { run(); }, [run]);

  const testPdf = async () => {
    setPdf({ state: 'run' });
    try { setPdf({ state: 'done', r: await api.diag.pdfTest() }); } catch (e) { setPdf({ state: 'err', e: (e as Error).message }); }
  };

  return (
    <>
      <TopBar title="Diagnóstico"><button className="btn" onClick={run} disabled={running}>{running ? <span className="spinner" /> : <Icon name="refresh" size={16} />}Verificar de novo</button></TopBar>
      <div className="ui-content">
        <div className="ui-page" style={{ maxWidth: 900 }}>
          <div className="ui-card set-card">
            <h3>Verificações</h3>
            {rows.map((r) => (
              <div className="diag-row" key={r.id}>
                <span className={`led-big ${r.status}`} />
                <div className="dt"><b>{r.title}</b><small>{r.detail}</small></div>
                {r.path ? <button className="btn sm" onClick={() => api.shell.open(r.path!)}><Icon name="folder-open" size={15} />Abrir</button> : null}
                {r.fix === 'pickFolder' ? <button className="btn sm primary" onClick={async () => { const d = await api.shell.pickFolder(); if (d) { await setSettings({ exportDir: d }); run(); } }}>Escolher outra pasta</button> : null}
              </div>
            ))}
            <div className="diag-row">
              <span className={`led-big ${update?.state === 'error' ? 'warn' : 'ok'}`} />
              <div className="dt"><b>Atualizações</b><small>{update?.state === 'dev' ? 'Desligadas no modo de desenvolvimento.' : update?.state === 'error' ? update.error : 'Funcionando. O app consulta as versões publicadas no GitHub.'}</small></div>
              <button className="btn sm" onClick={() => nav({ name: 'settings' })}>Abrir</button>
            </div>
          </div>

          <div className="ui-card set-card">
            <h3>Motor de PDF</h3>
            <p>Gera um currículo de exemplo de verdade, lê o texto do PDF como um sistema de RH faria e reabre os dados editáveis embutidos.</p>
            <div className="diag-row">
              <span className={`led-big ${!pdf ? 'warn' : pdf.state === 'run' ? 'run' : pdf.state === 'err' ? 'bad' : pdf.r.ok && pdf.r.roundTrip ? 'ok' : 'warn'}`} />
              <div className="dt">
                <b>{!pdf ? 'Ainda não testado' : pdf.state === 'run' ? 'Gerando e conferindo…' : pdf.state === 'err' ? 'Falhou' : pdf.r.ok && pdf.r.roundTrip ? 'Tudo certo' : 'Atenção'}</b>
                <small>{pdf?.state === 'done' ? `${pdf.r.pages} página(s) · ${Math.round(pdf.r.size / 1024)} KB · ${pdf.r.words} palavras lidas · ${pdf.r.ms} ms · dados editáveis ${pdf.r.roundTrip ? 'reabertos ✓' : 'não encontrados'}${pdf.r.missing.length ? ` · não encontrado: ${pdf.r.missing.join(', ')}` : ''}` : pdf?.state === 'err' ? pdf.e : 'Leva cerca de 2 segundos.'}</small>
              </div>
              <button className="btn sm primary" onClick={testPdf} disabled={pdf?.state === 'run'}><Icon name="file-pdf" size={15} />Testar agora</button>
            </div>
            {pdf?.state === 'done' ? <><div className="lbl" style={{ margin: '6px 0' }}>Início do texto extraído do PDF</div><div className="mono">{pdf.r.sample}</div><div style={{ height: 14 }} /></> : null}
          </div>

          <div className="ui-card set-card">
            <h3>Como funciona</h3>
            <p style={{ color: 'var(--text-2)' }}>
              Os currículos ficam em arquivos no seu computador e são salvos automaticamente a cada alteração. Para gerar o PDF, o app desenha o currículo com o mesmo
              motor do Chrome e imprime em PDF: o texto continua sendo texto (dá para selecionar, copiar e ser lido por sistemas de RH e IAs), as fontes vão embutidas e os links
              de e-mail e LinkedIn ficam clicáveis. Depois, o app grava título, autor e palavras-chave no PDF e, se você quiser, uma cópia editável do currículo dentro dele.
            </p>
            <p className="hint">{info ? `v${info.version} · Electron ${info.versions.electron} · Chromium ${info.versions.chrome} · ${info.platform}` : ''}</p>
          </div>
        </div>
      </div>
    </>
  );
}
