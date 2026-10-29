#!/usr/bin/env node
// Checagem rápida (local e no CI): sintaxe de todo o JavaScript — CommonJS e módulos ES —,
// dos JSON principais e dos scripts Python, se houver. Projetos em TypeScript devem usar
// "check": "tsc --noEmit" no lugar deste script.
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const DIRS = ['src', 'scripts', 'extension', 'electron', 'main', 'renderer'];
const SKIP = /node_modules|dist|out|\.git/;
let failed = 0;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

// Módulo ES: .mjs, ou .js com import/export no topo do arquivo
const isModule = (file, src) => file.endsWith('.mjs') || (file.endsWith('.js') && /^\s*(import\s.+from\s|import\s*['"{*]|export\s)/m.test(src));

function nodeCheck(file) {
  const src = fs.readFileSync(file, 'utf8');
  let target = file, tmp = null;
  if (isModule(file, src) && !file.endsWith('.mjs')) {
    tmp = path.join(os.tmpdir(), `check-${path.basename(file, '.js')}-${process.pid}.mjs`);
    fs.writeFileSync(tmp, src);
    target = tmp;
  }
  const r = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
  if (tmp) fs.rmSync(tmp, { force: true });
  if (r.status !== 0) { failed++; console.error(`✗ ${path.relative(root, file)}\n${r.stderr}`); }
}

const all = DIRS.flatMap((d) => walk(path.join(root, d)));
const js = all.filter((f) => /\.(c|m)?js$/.test(f));
js.forEach(nodeCheck);

for (const f of ['package.json', ...all.filter((x) => x.endsWith('manifest.json')).map((x) => path.relative(root, x))]) {
  try { JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')); } catch (e) { failed++; console.error(`✗ ${f}: ${e.message}`); }
}

const py = [...walk(path.join(root, 'python')), ...all].filter((f) => f.endsWith('.py'));
if (py.length) {
  const cmd = process.platform === 'win32' ? 'python' : 'python3';
  for (const f of py) {
    const r = spawnSync(cmd, ['-m', 'py_compile', f], { encoding: 'utf8', shell: process.platform === 'win32' });
    if (r.error || /not found|não é reconhecido/i.test(r.stderr || '')) { console.warn('! Python não encontrado — pulando os .py'); break; }
    if (r.status !== 0) { failed++; console.error(`✗ ${path.relative(root, f)}\n${r.stderr}`); }
  }
}

if (failed) { console.error(`\n${failed} arquivo(s) com erro.`); process.exit(1); }
console.log(`✓ ${js.length} arquivos JavaScript${py.length ? `, ${py.length} Python` : ''} e JSON sem erros de sintaxe.`);
