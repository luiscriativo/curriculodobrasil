// Dados fictícios para prints e testes: node scripts/make-demo-data.mjs [pasta-do-perfil]
// Depois: npx electron . --user-data=demo-data/profile
import fs from 'node:fs';
import path from 'node:path';
import { normalizeResume } from '../src/shared/model.mjs';
import { sampleResume } from '../src/shared/sample.mjs';

const dir = path.resolve(process.argv[2] || 'demo-data/profile');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(path.join(dir, 'curriculos'), { recursive: true });
const H = 3600e3, D = 24 * H, now = Date.now();
const people = [
  ['Currículo — Vaga Analista de Marketing', 'ipanema', 0.3 * H, {}],
  ['Versão criativa para agências', 'olinda', 2 * H, {}],
  ['Candidatura Banco Horizonte', 'pampulha', 5 * H, { style: { accent: '#1f3a5f' } }],
  ['Currículo em inglês — remote jobs', 'carioca', D + 2 * H, { style: { lang: 'en' }, title: 'Digital Marketing Analyst' }],
  ['Processo seletivo Grupo Serra', 'leblon', D + 6 * H, {}],
  ['Estágio — versão 2023 (arquivo)', 'tijuca', 9 * D, {}],
  ['Freelancer — portfólio', 'pantanal', 9 * D + 3 * H, {}],
];
for (const [title, template, ago, extra] of people) {
  const r = normalizeResume(sampleResume({ template }));
  r.docTitle = title;
  r.updatedAt = now - ago;
  r.createdAt = r.updatedAt - 3 * D;
  Object.assign(r.style, extra.style || {});
  if (extra.title) r.profile.title = extra.title;
  fs.writeFileSync(path.join(dir, 'curriculos', `${r.id}.json`), JSON.stringify(r));
}
fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify({ welcomed: true, userName: 'Mariana Albuquerque Costa', theme: 'dark', listView: 'grid' }, null, 2));
console.log(`✓ ${people.length} currículos de demonstração em ${dir}`);
