// Confere o registro dos modelos sem precisar do navegador: cada imagem de modelos/ tem um modelo,
// ids únicos e campos obrigatórios presentes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '../src/renderer/templates');
const src = ['set-a', 'set-b', 'set-c', 'set-d', 'set-e'].map((f) => fs.readFileSync(path.join(dir, `${f}.tsx`), 'utf8').replace(/\r\n/g, '\n')).join('\n');
const ids = [...src.matchAll(/^ {4}id: '([a-z-]+)'/gm)].map((m) => m[1]);
const refs = [...src.matchAll(/refs: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/'(modelo-\d+)'/g)].map((x) => x[1]));

test('ids únicos e mais de 50 modelos', () => {
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length >= 50, `${ids.length} modelos`);
  assert.ok(ids.includes('ats'), 'existe a versão ATS');
});

test('todas as 66 imagens de referência têm um modelo', () => {
  const expected = Array.from({ length: 66 }, (_, i) => `modelo-${String(i + 1).padStart(2, '0')}`);
  assert.deepEqual(expected.filter((m) => !refs.includes(m)), []);
});

test('cada modelo declara nível ATS, foto, colunas e CSS escopado', () => {
  const blocks = src.split(/\n {2}\{\n {4}id: /).slice(1);
  assert.equal(blocks.length, ids.length);
  for (const b of blocks) {
    const id = b.match(/^'([a-z-]+)'/)[1];
    assert.match(b, /ats: '(alta|media|baixa)'/, id);
    assert.match(b, /photo: '(yes|no)'/, id);
    assert.match(b, /cols: [12]/, id);
    assert.match(b, /css: `\n\.T /, `${id}: o CSS deve começar com .T`);
  }
});
