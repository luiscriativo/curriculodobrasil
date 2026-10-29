// Ponte segura entre a interface e o processo principal.
const { contextBridge, ipcRenderer, webUtils } = require('electron');

const call = async (channel, ...args) => {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (!res?.ok) throw new Error(res?.error || 'Erro desconhecido.');
  return res.data;
};
const on = (channel) => (cb) => {
  const fn = (_e, payload) => cb(payload);
  ipcRenderer.on(channel, fn);
  return () => ipcRenderer.removeListener(channel, fn);
};

contextBridge.exposeInMainWorld('api', {
  info: () => call('app:info'),
  settings: { get: () => call('settings:get'), set: (patch) => call('settings:set', patch) },
  titleBar: (mode) => call('theme:titlebar', mode),
  resumes: {
    list: () => call('resumes:list'),
    get: (id) => call('resumes:get', id),
    save: (r) => call('resumes:save', r),
    remove: (id) => call('resumes:remove', id),
    restore: (id) => call('resumes:restore', id),
    import: (paths) => call('resumes:import', paths),
    exportJson: (r) => call('resumes:exportJson', r),
    backup: () => call('data:backup'),
  },
  pdf: {
    export: (r, opts) => call('pdf:export', r, opts),
    preview: (r) => call('pdf:preview', r),
    onProgress: on('pdf:progress'),
  },
  shell: {
    open: (p) => call('shell:open', p),
    reveal: (p) => call('shell:reveal', p),
    external: (url) => call('shell:external', url),
    pickFolder: () => call('dialog:pickFolder'),
  },
  diag: { run: () => call('diag:run'), pdfTest: () => call('diag:pdfTest') },
  update: {
    status: () => call('update:status'),
    check: () => call('update:check'),
    download: () => call('update:download'),
    install: () => call('update:install'),
    onStatus: on('update'),
  },
  onToast: on('toast'),
  // Caminho de um arquivo solto na janela (arrastar e soltar para importar)
  pathForFile: (file) => { try { return webUtils.getPathForFile(file); } catch { return ''; } },
  // Janela oculta de impressão
  print: {
    onRender: on('print:render'),
    done: (msg) => ipcRenderer.send('print:rendered', msg),
  },
  dev: {
    capture: (file) => call('dev:capture', file),
    emit: (channel, payload) => call('dev:emit', channel, payload),
    exportTo: (r, file, opts) => call('dev:exportTo', r, file, opts),
    extract: (file) => call('dev:extract', file),
    readEmbedded: (file) => call('dev:readEmbedded', file),
  },
});
