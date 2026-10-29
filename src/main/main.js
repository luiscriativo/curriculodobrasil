// Processo principal do Currículo do Brasil.
const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, Menu, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const { Storage } = require('./storage');
const { Updater } = require('./updater');
const pdf = require('./pdf');

const APP_NAME = 'Currículo do Brasil';
const isDev = !app.isPackaged;
const PRELOAD = path.join(__dirname, 'preload.js');

// ── Ganchos de desenvolvimento: perfil separado (testes, prints) ─────────────
if (isDev) {
  const ud = process.argv.find((a) => a.startsWith('--user-data='));
  if (ud) app.setPath('userData', path.resolve(ud.slice('--user-data='.length)));
}
app.setName(APP_NAME);
if (process.platform === 'win32') app.setAppUserModelId('io.github.luiscriativo.curriculodobrasil');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => showMain());
}

let win = null;
let storage = null;
let model = null; // src/shared/model.mjs (ES module)
let updater = null;
let exporting = 0;

const THEME = {
  light: { bg: '#efeeec', symbol: '#55524e' },
  dark: { bg: '#1b1a19', symbol: '#d7d4cf' },
};

function effectiveTheme() {
  const t = storage?.settings.theme || 'system';
  return t === 'system' ? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light') : t;
}

function applyTitleBar() {
  if (!win || win.isDestroyed() || process.platform === 'darwin') return;
  const t = THEME[effectiveTheme()];
  try { win.setTitleBarOverlay({ color: t.bg, symbolColor: t.symbol, height: 44 }); } catch { /* Linux sem suporte */ }
  win.setBackgroundColor(t.bg);
}

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}
const toast = (kind, text, extra = {}) => send('toast', { kind, text, ...extra });

function showMain() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const t = THEME[effectiveTheme()];
  win = new BrowserWindow({
    width: Math.min(1480, Math.round(width * 0.9)),
    height: Math.min(940, Math.round(height * 0.92)),
    minWidth: 1040,
    minHeight: 660,
    show: false,
    title: APP_NAME,
    backgroundColor: t.bg,
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    titleBarStyle: 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 18, y: 16 } }
      : { titleBarOverlay: { color: t.bg, symbolColor: t.symbol, height: 44 } }),
    webPreferences: { preload: PRELOAD, contextIsolation: true, sandbox: true, plugins: true, spellcheck: true },
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '..', '..', 'out', 'renderer', 'index.html'));

  // Nada de navegar para fora do app (ex.: soltar um arquivo na janela); links abrem no navegador
  win.webContents.on('will-navigate', (e, url) => {
    e.preventDefault();
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  // Corretor ortográfico em português no editor
  try { win.webContents.session.setSpellCheckerLanguages(['pt-BR']); } catch { /* idioma indisponível */ }
  win.webContents.on('context-menu', (_e, params) => {
    const items = [];
    for (const s of params.dictionarySuggestions.slice(0, 5)) items.push({ label: s, click: () => win.webContents.replaceMisspelling(s) });
    if (params.misspelledWord) {
      if (!items.length) items.push({ label: 'Sem sugestões', enabled: false });
      items.push({ label: 'Adicionar ao dicionário', click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord) });
      items.push({ type: 'separator' });
    }
    if (params.isEditable) items.push({ role: 'cut', label: 'Recortar' }, { role: 'copy', label: 'Copiar' }, { role: 'paste', label: 'Colar' }, { type: 'separator' }, { role: 'selectAll', label: 'Selecionar tudo' });
    else if (params.selectionText) items.push({ role: 'copy', label: 'Copiar' });
    if (items.length) Menu.buildFromTemplate(items).popup({ window: win });
  });
  win.on('close', (e) => {
    if (exporting > 0 && !quitting) {
      const r = dialog.showMessageBoxSync(win, {
        type: 'question', buttons: ['Esperar', 'Fechar mesmo assim'], defaultId: 0, cancelId: 0,
        title: APP_NAME, message: 'Um PDF ainda está sendo gerado.', detail: 'Se fechar agora, o arquivo não será salvo.',
      });
      if (r === 0) e.preventDefault();
    }
  });
  win.on('closed', () => { win = null; });
}

let quitting = false;

// ── Utilidades ───────────────────────────────────────────────────────────────
function friendlyFsError(e, file) {
  const name = file ? path.basename(file) : 'o arquivo';
  if (e?.code === 'EBUSY' || e?.code === 'EPERM') return `${name} está aberto em outro programa (talvez o leitor de PDF). Feche-o e tente de novo.`;
  if (e?.code === 'EACCES') return `Sem permissão para gravar ${name}. Escolha outra pasta.`;
  if (e?.code === 'ENOSPC') return 'Não há espaço livre no disco.';
  if (e?.code === 'ENOENT') return `A pasta de ${name} não existe mais. Escolha outra pasta.`;
  return e?.message || String(e);
}

const handle = (channel, fn) => ipcMain.handle(channel, async (_e, ...args) => {
  try {
    return { ok: true, data: await fn(...args) };
  } catch (err) {
    return { ok: false, error: err?.friendly || friendlyFsError(err) };
  }
});

function defaultExportDir() {
  const d = storage.settings.exportDir;
  if (d && fs.existsSync(d)) return d;
  return app.getPath('documents');
}

function keywordsOf(resume) {
  const skills = (resume.sections || []).filter((s) => s.type === 'skills' && !s.hidden).flatMap((s) => s.items.map((i) => i.name)).filter(Boolean);
  return [resume.profile?.title, ...skills].filter(Boolean);
}

/** Pipeline completo de exportação com progresso para a interface. */
async function exportPdf(resume, opts = {}) {
  const r = model.normalizeResume(resume);
  const s = storage.settings;
  const job = opts.jobId || String(Date.now());
  const progress = (step, pct, text) => send('pdf:progress', { job, step, pct, text });
  let file = opts.filePath;
  if (!file) {
    const suggested = model.exportFileName(s.fileNamePattern, r).replace(/\.pdf$/, opts.ats ? ' (ATS).pdf' : '.pdf');
    if (s.askWhere || opts.saveAs) {
      const res = await dialog.showSaveDialog(win, {
        title: opts.ats ? 'Salvar versão ATS do currículo' : 'Salvar currículo em PDF',
        defaultPath: path.join(defaultExportDir(), suggested),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (res.canceled || !res.filePath) return { canceled: true };
      file = res.filePath.toLowerCase().endsWith('.pdf') ? res.filePath : `${res.filePath}.pdf`;
    } else {
      file = path.join(defaultExportDir(), suggested);
    }
  }
  exporting++;
  try {
    progress('render', 10, 'Desenhando as páginas…');
    const { bytes, info } = await pdf.renderPdf(r, { preload: PRELOAD, templateOverride: opts.ats ? 'ats' : null });
    progress('meta', 55, s.embedData ? 'Gravando metadados e dados editáveis…' : 'Gravando metadados…');
    const final = await pdf.finalizePdf(bytes, r, { embedData: s.embedData, keywords: keywordsOf(r) });
    progress('save', 70, 'Salvando o arquivo…');
    try {
      await fs.promises.writeFile(file, final);
    } catch (e) {
      const err = new Error(friendlyFsError(e, file));
      err.friendly = err.message;
      throw err;
    }
    let check = null;
    if (s.verifyText) {
      progress('verify', 85, 'Conferindo se o texto pode ser lido por sistemas de RH…');
      try {
        const { text, pages } = await pdf.extractText(final);
        check = { ...pdf.verifyText(text, r), pages };
      } catch (e) {
        check = { ok: false, error: e.message };
      }
    }
    progress('done', 100, 'Pronto');
    if (s.openAfterExport) shell.openPath(file);
    return { file, size: final.length, pages: check?.pages || info?.pages || null, check };
  } finally {
    exporting--;
  }
}

// ── IPC ──────────────────────────────────────────────────────────────────────
function registerIpc() {
  handle('app:info', () => ({
    name: APP_NAME, version: app.getVersion(), isDev, platform: process.platform,
    versions: { electron: process.versions.electron, chrome: process.versions.chrome, node: process.versions.node },
    userData: app.getPath('userData'), dataDir: storage.dir,
  }));
  handle('settings:get', () => storage.settings);
  handle('settings:set', async (patch) => {
    const out = await storage.setSettings(patch);
    if ('theme' in (patch || {})) { nativeTheme.themeSource = out.theme; applyTitleBar(); }
    return out;
  });
  handle('theme:titlebar', (mode) => {
    if (!win || process.platform === 'darwin') return true;
    const t = THEME[mode === 'dark' ? 'dark' : 'light'];
    try { win.setTitleBarOverlay({ color: t.bg, symbolColor: t.symbol, height: 44 }); } catch { /* sem suporte */ }
    return true;
  });

  handle('resumes:list', () => storage.list());
  handle('resumes:get', (id) => storage.get(id));
  handle('resumes:save', (r) => storage.save(r));
  handle('resumes:remove', (id) => storage.remove(id));
  handle('resumes:restore', (id) => storage.restore(id));

  handle('resumes:import', async (filePaths) => {
    let files = filePaths;
    if (!files || !files.length) {
      const res = await dialog.showOpenDialog(win, {
        title: 'Importar currículo',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Currículos (PDF do app ou JSON)', extensions: ['pdf', 'json'] }],
      });
      if (res.canceled) return { canceled: true, imported: [] };
      files = res.filePaths;
    }
    const imported = [];
    const errors = [];
    const { resumes: existing } = await storage.list();
    const ids = new Set(existing.map((x) => x.id));
    for (const f of files) {
      try {
        const buf = await fs.promises.readFile(f);
        let list;
        if (f.toLowerCase().endsWith('.pdf')) {
          const data = await pdf.readEmbeddedResume(buf).catch(() => null);
          if (!data) throw new Error('Este PDF não tem os dados editáveis (ele precisa ter sido gerado pelo Currículo do Brasil com "Dados editáveis no PDF" ligado).');
          list = [data];
        } else {
          const json = JSON.parse(buf.toString('utf8').replace(/^﻿/, ''));
          list = Array.isArray(json?.resumes) ? json.resumes : Array.isArray(json) ? json : [json];
        }
        for (const raw of list) {
          let r = model.normalizeResume(raw);
          if (ids.has(r.id)) r = { ...model.duplicateResume(r, ''), docTitle: r.docTitle };
          r.updatedAt = Date.now();
          ids.add(r.id);
          imported.push(await storage.save(r));
        }
      } catch (e) {
        const why = e instanceof SyntaxError ? 'o arquivo não é um JSON válido.'
          : e.code === 'ENOENT' ? 'o arquivo não foi encontrado (foi movido ou apagado?).'
            : ['EACCES', 'EPERM', 'EBUSY'].includes(e.code) ? 'sem permissão para ler o arquivo, ou ele está aberto em outro programa.'
              : e.message;
        errors.push(`${path.basename(f)}: ${why}`);
      }
    }
    return { imported, errors };
  });

  handle('resumes:exportJson', async (resume) => {
    const r = model.normalizeResume(resume);
    const res = await dialog.showSaveDialog(win, {
      title: 'Exportar dados do currículo',
      defaultPath: path.join(defaultExportDir(), `${model.safeFileName(r.docTitle)}.json`),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (res.canceled || !res.filePath) return { canceled: true };
    await fs.promises.writeFile(res.filePath, JSON.stringify(r, null, 2));
    return { file: res.filePath };
  });

  handle('data:backup', async () => {
    const { resumes } = await storage.list();
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const res = await dialog.showSaveDialog(win, {
      title: 'Fazer backup de todos os currículos',
      defaultPath: path.join(defaultExportDir(), `Backup Currículo do Brasil ${stamp}.json`),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (res.canceled || !res.filePath) return { canceled: true };
    await fs.promises.writeFile(res.filePath, JSON.stringify({ app: APP_NAME, version: app.getVersion(), exportedAt: d.toISOString(), resumes }, null, 2));
    return { file: res.filePath, count: resumes.length };
  });

  handle('pdf:export', (resume, opts) => exportPdf(resume, opts));
  handle('pdf:preview', async (resume) => {
    const { bytes } = await pdf.renderPdf(model.normalizeResume(resume), { preload: PRELOAD });
    return new Uint8Array(bytes);
  });

  handle('shell:open', (p) => shell.openPath(p));
  handle('shell:reveal', (p) => { shell.showItemInFolder(p); return true; });
  handle('shell:external', (url) => { if (/^https?:\/\//i.test(url)) shell.openExternal(url); return true; });
  handle('dialog:pickFolder', async () => {
    const res = await dialog.showOpenDialog(win, { title: 'Escolher pasta para salvar os PDFs', properties: ['openDirectory', 'createDirectory'], defaultPath: defaultExportDir() });
    return res.canceled ? null : res.filePaths[0];
  });

  handle('diag:run', async () => {
    const checks = [];
    // Pasta de dados
    try {
      const probe = path.join(storage.base, `.teste-${process.pid}`);
      await fs.promises.writeFile(probe, 'ok');
      await fs.promises.rm(probe, { force: true });
      const { resumes, broken } = await storage.list();
      checks.push({ id: 'storage', status: broken.length ? 'warn' : 'ok', title: 'Pasta de dados', detail: broken.length ? `${broken.length} arquivo(s) danificado(s) foram ignorados.` : `${resumes.length} currículo(s) salvos com segurança.`, path: storage.dir });
    } catch (e) {
      checks.push({ id: 'storage', status: 'bad', title: 'Pasta de dados', detail: `Não foi possível gravar: ${friendlyFsError(e)}`, path: storage.dir });
    }
    // Espaço livre
    try {
      const st = await fs.promises.statfs(storage.base);
      const free = st.bavail * st.bsize;
      checks.push({ id: 'disk', status: free < 200e6 ? 'warn' : 'ok', title: 'Espaço em disco', detail: `${(free / 1e9).toFixed(1).replace('.', ',')} GB livres.` });
    } catch { /* statfs indisponível */ }
    // Pasta de exportação
    const dir = defaultExportDir();
    try {
      fs.accessSync(dir, fs.constants.W_OK);
      checks.push({ id: 'exportDir', status: 'ok', title: 'Pasta dos PDFs', detail: dir, path: dir });
    } catch {
      checks.push({ id: 'exportDir', status: 'bad', title: 'Pasta dos PDFs', detail: `Sem permissão para gravar em ${dir}.`, path: dir, fix: 'pickFolder' });
    }
    return checks;
  });

  handle('diag:pdfTest', async () => {
    const { sampleResume } = await import('../shared/sample.mjs');
    const r = model.normalizeResume(sampleResume({ withPhoto: true, template: 'ipanema' }));
    const t0 = Date.now();
    const { bytes } = await pdf.renderPdf(r, { preload: PRELOAD });
    const final = await pdf.finalizePdf(bytes, r, { embedData: true });
    const { text, pages } = await pdf.extractText(final);
    const v = pdf.verifyText(text, r);
    const back = await pdf.readEmbeddedResume(final);
    return { ms: Date.now() - t0, pages, size: final.length, ...v, roundTrip: back?.profile?.name === r.profile.name, sample: text.slice(0, 600) };
  });

  // Atualização
  handle('update:status', () => updater.status);
  handle('update:check', () => updater.check(true));
  handle('update:download', () => updater.download());
  handle('update:install', () => {
    if (exporting > 0) {
      toast('warn', 'Espere o PDF terminar de ser gerado para instalar a atualização.');
      return { ok: false, error: 'busy' };
    }
    quitting = true;
    if (!updater.install()) { quitting = false; return { ok: false, error: 'not-ready' }; }
    return { ok: true };
  });

  // Ganchos de desenvolvimento (testes e prints do README)
  if (isDev) {
    handle('dev:capture', async (file) => {
      const img = await win.webContents.capturePage();
      const out = path.resolve(file || path.join(app.getPath('userData'), 'capture.png'));
      await fs.promises.writeFile(out, img.toPNG());
      return out;
    });
    handle('dev:emit', (channel, payload) => { send(channel, payload); return true; });
    handle('dev:exportTo', (resume, filePath, opts) => exportPdf(resume, { ...opts, filePath }));
    handle('dev:extract', async (file) => pdf.extractText(await fs.promises.readFile(file)));
    handle('dev:readEmbedded', async (file) => pdf.readEmbeddedResume(await fs.promises.readFile(file)));
  }
}

// ── Ciclo de vida ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  model = await import('../shared/model.mjs');
  storage = new Storage(app.getPath('userData'), { normalize: model.normalizeResume });
  try { storage.emptyTrash(); } catch { /* arquivos presos: tenta na próxima */ }
  nativeTheme.themeSource = storage.settings.theme;
  nativeTheme.on('updated', applyTitleBar);
  Menu.setApplicationMenu(process.platform === 'darwin' ? Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }]) : null);
  registerIpc();
  createWindow();

  updater = new Updater();
  updater.on('status', (st) => send('update', st));
  updater.on('up-to-date', (st) => toast('success', `Você está na versão mais recente (v${st.current}).`));
  updater.on('failed', (st) => toast('error', st.error));
  updater.start();

  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); else showMain(); });
});

app.on('before-quit', async (e) => {
  if (storage && storage.queue.size && !quitting) {
    e.preventDefault();
    quitting = true;
    await storage.flush();
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
