import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { normalizeResume, createResume } from '../src/shared/model.mjs';

const require = createRequire(import.meta.url);
const { Storage } = require('../src/main/storage.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cdb-test-'));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

test('salva, lista, exclui (lixeira) e restaura', async () => {
  const st = new Storage(path.join(tmp, 'a'), { normalize: normalizeResume });
  const r = createResume({ name: 'Ana' });
  await st.save(r);
  assert.equal((await st.list()).resumes.length, 1);
  await st.remove(r.id);
  assert.equal((await st.list()).resumes.length, 0);
  const back = await st.restore(r.id);
  assert.equal(back.profile.name, 'Ana');
  st.emptyTrash();
  assert.deepEqual(fs.readdirSync(st.trash), []);
});

test('gravações rápidas seguidas terminam com a última versão', async () => {
  const st = new Storage(path.join(tmp, 'b'), { normalize: normalizeResume });
  const r = createResume();
  await Promise.all(Array.from({ length: 25 }, (_, i) => st.save({ ...r, docTitle: `v${i}` })));
  assert.equal((await st.get(r.id)).docTitle, 'v24');
  assert.deepEqual(fs.readdirSync(st.dir).filter((f) => f.endsWith('.tmp')), [], 'sem temporários largados');
});

test('arquivo corrompido é ignorado, não derruba a lista', async () => {
  const st = new Storage(path.join(tmp, 'c'), { normalize: normalizeResume });
  await st.save(createResume());
  fs.writeFileSync(path.join(st.dir, 'quebrado.json'), '{ isto não é json');
  const { resumes, broken } = await st.list();
  assert.equal(resumes.length, 1);
  assert.deepEqual(broken, ['quebrado.json']);
});

test('id malicioso não sai da pasta', async () => {
  const st = new Storage(path.join(tmp, 'd'), { normalize: normalizeResume });
  await assert.rejects(() => st.get('../../settings'));
  assert.throws(() => st._file('..\\x'));
});

test('configurações validam tipos e valores', async () => {
  const st = new Storage(path.join(tmp, 'e'));
  await st.setSettings({ theme: 'roxo', askWhere: false, desconhecida: 1 });
  assert.equal(st.settings.theme, 'system');
  assert.equal(st.settings.askWhere, false);
  assert.ok(!('desconhecida' in st.settings));
  await assert.rejects(() => st.setSettings({ askWhere: 'sim' }));
  const again = new Storage(path.join(tmp, 'e'));
  assert.equal(again.settings.askWhere, false, 'persistiu no disco');
});

test('digitar rápido nas configurações não corrompe o arquivo', async () => {
  const st = new Storage(path.join(tmp, 'f'));
  const name = 'Mariana Albuquerque';
  await Promise.all([...name].map((_, i) => st.setSettings({ userName: name.slice(0, i + 1) })));
  assert.equal(new Storage(path.join(tmp, 'f')).settings.userName, name);
});
