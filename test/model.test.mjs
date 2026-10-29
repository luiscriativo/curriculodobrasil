import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createResume, normalizeResume, duplicateResume, parseDescription, safeFileName, exportFileName, sectionTitle, newSection } from '../src/shared/model.mjs';
import { sampleResume } from '../src/shared/sample.mjs';

test('currículo novo tem as seções básicas e o nome', () => {
  const r = createResume({ name: 'Ana Souza' });
  assert.equal(r.profile.name, 'Ana Souza');
  assert.deepEqual(r.sections.map((s) => s.type), ['summary', 'experience', 'education', 'skills', 'languages']);
});

test('normalize completa campos faltando e descarta lixo', () => {
  const r = normalizeResume({
    profile: { name: 'Zé', photo: 'javascript:alert(1)', photoPos: { zoom: 9 } },
    sections: [{ type: 'experience', items: [{ role: 'Dev', current: 1 }, null] }, { type: 'invalido' }],
    style: { fontScale: 5, lang: 'xx', accent: 'red' },
  });
  assert.equal(r.profile.photo, null, 'só aceita imagem embutida');
  assert.equal(r.profile.photoPos.zoom, 3);
  assert.equal(r.sections.length, 1);
  assert.equal(r.sections[0].items.length, 1);
  assert.equal(r.sections[0].items[0].current, true);
  assert.equal(r.sections[0].items[0].org, '');
  assert.equal(r.style.fontScale, 1.25);
  assert.equal(r.style.lang, 'pt');
  assert.equal(r.style.accent, null);
  assert.throws(() => normalizeResume(null));
});

test('o exemplo é válido e normalizar de novo não muda nada', () => {
  const r = normalizeResume(sampleResume());
  assert.deepEqual(normalizeResume(JSON.parse(JSON.stringify(r))), r);
  assert.match(r.profile.photo, /^data:image\/svg\+xml;base64,/);
});

test('duplicar troca todos os ids', () => {
  const r = normalizeResume(sampleResume());
  const d = duplicateResume(r);
  assert.notEqual(d.id, r.id);
  assert.match(d.docTitle, /\(cópia\)$/);
  const ids = new Set(r.sections.flatMap((s) => [s.id, ...s.items.map((i) => i.id)]));
  for (const s of d.sections) {
    assert.ok(!ids.has(s.id));
    for (const i of s.items) assert.ok(!ids.has(i.id));
  }
});

test('descrição vira parágrafos e tópicos', () => {
  const b = parseDescription('Responsável pela área.\n- Fiz A\n• Fiz B\n\nOutro parágrafo\n* Fiz C');
  assert.deepEqual(b, [
    { type: 'p', text: 'Responsável pela área.' }, { type: 'ul', items: ['Fiz A', 'Fiz B'] },
    { type: 'p', text: 'Outro parágrafo' }, { type: 'ul', items: ['Fiz C'] },
  ]);
  assert.deepEqual(parseDescription(''), []);
});

test('nome de arquivo seguro e padrão de exportação', () => {
  assert.equal(safeFileName('Currículo: Ana/Souza?*'), 'Currículo Ana Souza');
  assert.equal(safeFileName('CON'), 'CON_');
  assert.equal(safeFileName('   ...  '), 'Curriculo');
  const r = { profile: { name: 'Ana Souza', title: 'Dev' }, docTitle: 'X' };
  assert.equal(exportFileName('Currículo - {nome}', r), 'Currículo - Ana Souza.pdf');
  assert.equal(exportFileName('{nome} - {cargo} - {data}', r, new Date(2026, 0, 5)), 'Ana Souza - Dev - 2026-01-05.pdf');
  assert.equal(exportFileName('Currículo - {nome}', { profile: { name: '' } }), 'Currículo.pdf');
});

test('títulos de seção por idioma e renomeados', () => {
  assert.equal(sectionTitle(newSection('experience'), 'pt'), 'Experiência');
  assert.equal(sectionTitle(newSection('experience'), 'en'), 'Experience');
  assert.equal(sectionTitle({ type: 'custom', title: 'Publicações' }, 'pt'), 'Publicações');
});
