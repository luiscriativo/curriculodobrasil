// Armazenamento local: um arquivo JSON por currículo em <userData>/curriculos, lixeira para
// desfazer exclusões e configurações em <userData>/settings.json. Gravação atômica (tmp + rename)
// para não corromper o arquivo se o app fechar no meio.
const fs = require('fs');
const path = require('path');

const DEFAULT_SETTINGS = {
  theme: 'system', // system | light | dark
  userName: '',
  welcomed: false,
  exportDir: '', // vazio = Documentos
  askWhere: true,
  fileNamePattern: 'Currículo - {nome}',
  openAfterExport: false,
  embedData: true,
  verifyText: true,
  alsoAts: false,
  defaultLang: 'pt',
  defaultDateFormat: 'mm/yyyy',
  listView: 'grid', // grid | list
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** rename com novas tentativas: no Windows o antivírus/indexador às vezes segura o arquivo por instantes */
async function atomicWrite(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmp, data);
  for (let i = 0; ; i++) {
    try {
      await fs.promises.rename(tmp, file);
      return;
    } catch (e) {
      if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) {
        // Último recurso: copia por cima e apaga o temporário
        try { await fs.promises.copyFile(tmp, file); await fs.promises.rm(tmp, { force: true }); return; } catch { /* lança o erro original */ }
        await fs.promises.rm(tmp, { force: true }).catch(() => {});
        throw e;
      }
      await sleep(60 * (i + 1));
    }
  }
}

class Storage {
  constructor(baseDir, { normalize } = {}) {
    this.base = baseDir;
    this.dir = path.join(baseDir, 'curriculos');
    this.trash = path.join(baseDir, 'lixeira');
    this.settingsFile = path.join(baseDir, 'settings.json');
    this.normalize = normalize || ((x) => x);
    this.queue = new Map(); // id → Promise (gravações em série por currículo)
    this.settingsQueue = Promise.resolve(); // gravações das configurações em série (mesmo arquivo temporário)
    fs.mkdirSync(this.dir, { recursive: true });
    fs.mkdirSync(this.trash, { recursive: true });
    this.settings = this._readSettings();
  }

  _file(id) {
    if (!/^[a-z0-9]{4,40}$/i.test(String(id))) throw new Error('Identificador de currículo inválido.');
    return path.join(this.dir, `${id}.json`);
  }

  _readSettings() {
    try {
      const s = { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(this.settingsFile, 'utf8')) };
      if (!['grid', 'list'].includes(s.listView)) s.listView = 'grid';
      return s;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async setSettings(patch) {
    const allowed = Object.keys(DEFAULT_SETTINGS);
    for (const [k, v] of Object.entries(patch || {})) {
      if (!allowed.includes(k)) continue;
      if (typeof v !== typeof DEFAULT_SETTINGS[k]) throw new Error(`Valor inválido para ${k}.`);
      this.settings[k] = v;
    }
    if (!['system', 'light', 'dark'].includes(this.settings.theme)) this.settings.theme = 'system';
    if (!['grid', 'list'].includes(this.settings.listView)) this.settings.listView = 'grid';
    const snapshot = JSON.stringify(this.settings, null, 2);
    this.settingsQueue = this.settingsQueue.catch(() => {}).then(() => atomicWrite(this.settingsFile, snapshot));
    await this.settingsQueue;
    return this.settings;
  }

  /** Lista todos os currículos; arquivos corrompidos são separados (não somem nem travam a lista). */
  async list() {
    const out = [];
    const broken = [];
    for (const f of await fs.promises.readdir(this.dir)) {
      if (!f.endsWith('.json')) continue;
      const p = path.join(this.dir, f);
      try {
        out.push(this.normalize(JSON.parse(await fs.promises.readFile(p, 'utf8'))));
      } catch {
        broken.push(f);
      }
    }
    out.sort((a, b) => b.updatedAt - a.updatedAt);
    return { resumes: out, broken };
  }

  async get(id) {
    return this.normalize(JSON.parse(await fs.promises.readFile(this._file(id), 'utf8')));
  }

  save(resume) {
    const r = this.normalize(resume);
    const file = this._file(r.id);
    const prev = this.queue.get(r.id) || Promise.resolve();
    const next = prev.catch(() => {}).then(() => atomicWrite(file, JSON.stringify(r)));
    this.queue.set(r.id, next);
    next.finally(() => { if (this.queue.get(r.id) === next) this.queue.delete(r.id); }).catch(() => {});
    return next.then(() => r);
  }

  /** Exclusão em duas etapas: vai para a lixeira (dá para desfazer) e é apagada na próxima abertura. */
  async remove(id) {
    await (this.queue.get(id) || Promise.resolve()).catch(() => {});
    const from = this._file(id);
    await fs.promises.rename(from, path.join(this.trash, `${id}.json`));
    return true;
  }

  async restore(id) {
    const from = path.join(this.trash, `${path.basename(this._file(id))}`);
    await fs.promises.rename(from, this._file(id));
    return this.get(id);
  }

  emptyTrash() {
    fs.rmSync(this.trash, { recursive: true, force: true, maxRetries: 3 });
    fs.mkdirSync(this.trash, { recursive: true });
  }

  async flush() {
    await Promise.allSettled([...this.queue.values()]);
  }
}

module.exports = { Storage, DEFAULT_SETTINGS, atomicWrite };
