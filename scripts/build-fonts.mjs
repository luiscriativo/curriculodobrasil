// Gera src/renderer/styles/fonts.css só com os subconjuntos latin e latin-ext das fontes
// usadas pelos modelos (o pacote completo traria cirílico, grego, vietnamita…).
// Rode de novo ao adicionar uma fonte: node scripts/build-fonts.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'src/renderer/styles/fonts.css');
const VARIABLE = ['inter', 'montserrat', 'raleway', 'open-sans', 'roboto', 'oswald', 'archivo', 'playfair-display',
  'cormorant-garamond', 'lora', 'josefin-sans', 'dm-sans', 'league-spartan', 'work-sans', 'eb-garamond',
  'space-grotesk', 'caveat', 'bodoni-moda'];
const STATIC = {
  poppins: ['300', '400', '500', '600', '700', '400-italic'], lato: ['300', '400', '700', '900', '400-italic'],
  'bebas-neue': ['400'], anton: ['400'], 'libre-baskerville': ['400', '700', '400-italic'], 'great-vibes': ['400'],
  'barlow-condensed': ['300', '400', '500', '600', '700'], 'archivo-black': ['400'], 'dm-serif-display': ['400', '400-italic'],
};

const blocks = [];
function take(pkgDir, file) {
  const p = path.join(root, 'node_modules', pkgDir, file);
  if (!fs.existsSync(p)) return;
  const css = fs.readFileSync(p, 'utf8');
  for (const m of css.matchAll(/\/\* ([^*]+) \*\/\s*(@font-face\s*{[^}]+})/g)) {
    if (!/-(latin|latin-ext)-/.test(m[1])) continue;
    blocks.push(`/* ${m[1]} */\n` + m[2].replace(/url\(\.\/files\//g, `url(../../../node_modules/${pkgDir}/files/`));
  }
}
for (const f of VARIABLE) { take(`@fontsource-variable/${f}`, 'index.css'); take(`@fontsource-variable/${f}`, 'wght-italic.css'); }
for (const [f, ws] of Object.entries(STATIC)) for (const w of ws) take(`@fontsource/${f}`, `${w}.css`);
fs.writeFileSync(out, `/* Gerado por scripts/build-fonts.mjs — não edite à mão */\n${blocks.join('\n')}\n`);
console.log(`✓ ${blocks.length} @font-face em ${path.relative(root, out)}`);
