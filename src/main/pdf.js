// Geração do PDF: o currículo é desenhado numa janela oculta com o mesmo código da prévia e
// impresso pelo Chromium (printToPDF) — o texto sai como texto de verdade (selecionável e lido
// por ATS/IA), com fontes embutidas, links clicáveis e PDF marcado (tagged) para acessibilidade.
// Depois: metadados (título, autor, palavras-chave), cópia editável do currículo anexada ao PDF
// (o app reabre o PDF para continuar editando) e verificação do texto extraído.
const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PDFDocument, PDFName, PDFDict, PDFArray, PDFString, PDFHexString, PDFRawStream, decodePDFRawStream } = require('pdf-lib');

const ATTACHMENT = 'curriculo-do-brasil.json';
let seq = 0;

function rendererUrl() {
  return path.join(__dirname, '..', '..', 'out', 'renderer', 'index.html');
}

/** Desenha o currículo numa janela oculta e devolve os bytes do PDF. */
async function renderPdf(resume, { preload, templateOverride = null, timeoutMs = 25000 } = {}) {
  const id = ++seq;
  const win = new BrowserWindow({
    show: false,
    width: 1000,
    height: 1400,
    webPreferences: { preload, contextIsolation: true, sandbox: true, offscreen: false, backgroundThrottling: false },
  });
  try {
    const ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('O desenho do currículo demorou demais.')), timeoutMs);
      const onDone = (ev, msg) => {
        if (ev.sender !== win.webContents || msg?.id !== id) return;
        clearTimeout(timer);
        ipcMain.removeListener('print:rendered', onDone);
        msg.error ? reject(new Error(msg.error)) : resolve(msg);
      };
      ipcMain.on('print:rendered', onDone);
      win.on('closed', () => { clearTimeout(timer); ipcMain.removeListener('print:rendered', onDone); });
    });
    await win.loadFile(rendererUrl(), { hash: 'print' });
    win.webContents.send('print:render', { id, resume, templateOverride });
    const info = await ready;
    const paper = resume.style?.paper === 'Letter' ? 'Letter' : 'A4';
    const bytes = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      pageSize: paper,
      margins: { marginType: 'none' },
      generateTaggedPDF: true,
      generateDocumentOutline: false,
    });
    return { bytes: Buffer.from(bytes), info };
  } finally {
    if (!win.isDestroyed()) win.destroy();
  }
}

/** Metadados + (opcional) o currículo anexado, para reabrir e editar. */
async function finalizePdf(bytes, resume, { embedData = true, keywords = [], appName = 'Currículo do Brasil' } = {}) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const p = resume.profile || {};
  doc.setTitle(p.name ? `Currículo — ${p.name}${p.title ? ` · ${p.title}` : ''}` : resume.docTitle || 'Currículo', { showInWindowTitleBar: true });
  if (p.name) doc.setAuthor(p.name);
  if (p.title) doc.setSubject(p.title);
  if (keywords.length) doc.setKeywords(keywords.slice(0, 40));
  doc.setCreator(appName);
  doc.setProducer(`${appName} (Chromium)`);
  doc.setLanguage({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[resume.style?.lang] || 'pt-BR');
  const now = new Date();
  doc.setCreationDate(now);
  doc.setModificationDate(now);
  if (embedData) {
    await doc.attach(Buffer.from(JSON.stringify(resume), 'utf8'), ATTACHMENT, {
      mimeType: 'application/json',
      description: 'Dados editáveis do currículo (abra este PDF no Currículo do Brasil para continuar editando)',
      creationDate: now,
      modificationDate: now,
    });
  }
  return Buffer.from(await doc.save({ useObjectStreams: true }));
}

/** Procura o currículo anexado a um PDF gerado pelo app. Devolve o objeto ou null. */
async function readEmbeddedResume(bytes) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
  const names = doc.catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
  const ef = names?.lookupMaybe(PDFName.of('EmbeddedFiles'), PDFDict);
  if (!ef) return null;
  const stack = [ef];
  while (stack.length) {
    const node = stack.pop();
    const kids = node.lookupMaybe(PDFName.of('Kids'), PDFArray);
    if (kids) for (let i = 0; i < kids.size(); i++) stack.push(kids.lookup(i, PDFDict));
    const arr = node.lookupMaybe(PDFName.of('Names'), PDFArray);
    if (!arr) continue;
    for (let i = 0; i + 1 < arr.size(); i += 2) {
      const key = arr.lookup(i);
      const name = key instanceof PDFString || key instanceof PDFHexString ? key.decodeText() : '';
      if (name !== ATTACHMENT) continue;
      const spec = arr.lookup(i + 1, PDFDict);
      const efd = spec.lookupMaybe(PDFName.of('EF'), PDFDict);
      const stream = efd?.lookup(PDFName.of('F'));
      if (!(stream instanceof PDFRawStream)) continue;
      const data = decodePDFRawStream(stream).decode();
      return JSON.parse(Buffer.from(data).toString('utf8'));
    }
  }
  return null;
}

/** Extrai o texto do PDF como um ATS faria (pdf.js). */
async function extractText(bytes) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, useSystemFonts: false, verbosity: 0 });
  const doc = await task.promise;
  const pages = [];
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      let line = '';
      const lines = [];
      for (const it of tc.items) {
        if (!('str' in it)) continue;
        line += it.str;
        if (it.hasEOL) { lines.push(line); line = ''; }
      }
      if (line) lines.push(line);
      pages.push(lines.join('\n'));
    }
    return { pages: doc.numPages, text: pages.join('\n\f\n') };
  } finally {
    await task.destroy();
  }
}

const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Confere se os dados principais saíram como texto legível. */
function verifyText(text, resume) {
  const hay = fold(text);
  const p = resume.profile || {};
  const probes = [['nome', p.name], ['e-mail', p.email], ['telefone', p.phone], ['cargo', p.title]].filter(([, v]) => v && v.trim());
  const firstRole = (resume.sections || []).find((s) => s.type === 'experience' && !s.hidden)?.items?.find((i) => i.role)?.role;
  if (firstRole) probes.push(['experiência', firstRole]);
  const missing = probes.filter(([, v]) => !hay.includes(fold(v))).map(([k]) => k);
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || []).length;
  return { ok: missing.length === 0 && words > 5, missing, words, checked: probes.map(([k]) => k) };
}

module.exports = { renderPdf, finalizePdf, readEmbeddedResume, extractText, verifyText, ATTACHMENT };
