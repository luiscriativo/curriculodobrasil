// Teste rápido do pipeline de PDF (desenvolvimento): electron scripts/pdf-smoke.cjs <saida-dir> [ids...]
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const out = path.resolve(process.argv[2] || 'demo-data/pdf');
const ids = process.argv.slice(3);
const logFile = path.join(out, 'smoke.log');
const log = (...a) => { fs.appendFileSync(logFile, a.join(' ') + String.fromCharCode(10)); console.log(...a); };
process.on('unhandledRejection', (e) => { log('ERRO', e && e.stack || e); app.exit(1); });
fs.mkdirSync(out, { recursive: true });
app.on('window-all-closed', () => {}); // as janelas ocultas não encerram o teste
app.whenReady().then(async () => {
  const pdf = require('../src/main/pdf');
  const { sampleResume } = await import('../src/shared/sample.mjs');
  const model = await import('../src/shared/model.mjs');
  fs.mkdirSync(out, { recursive: true });
  fs.rmSync(logFile, { force: true });
  for (const id of ids) {
    const r = model.normalizeResume(sampleResume({ template: id }));
    const t0 = Date.now();
    const { bytes, info } = await pdf.renderPdf(r, { preload: path.join(__dirname, '../src/main/preload.js') });
    const fin = await pdf.finalizePdf(bytes, r, {});
    fs.writeFileSync(path.join(out, `${id}.pdf`), fin);
    const { text, pages } = await pdf.extractText(fin);
    const v = pdf.verifyText(text, r);
    const back = await pdf.readEmbeddedResume(fin);
    log(JSON.stringify({ id, ms: Date.now() - t0, pages, est: info.pages, ok: v.ok, missing: v.missing, words: v.words, roundTrip: back?.profile?.name === r.profile.name, head: text.slice(0, 160).replace(/\n/g, ' | ') }));
  }
  app.quit();
});
