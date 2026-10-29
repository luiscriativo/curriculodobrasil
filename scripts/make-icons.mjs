// Gera os ícones do app (assets/icon.png 1024 px e icon-256.png) a partir de um SVG: npm run icons
import sharp from 'sharp';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2725"/><stop offset="1" stop-color="#151413"/></linearGradient>
  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#efedea"/></linearGradient>
  <radialGradient id="dot" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ff5aa8"/><stop offset="1" stop-color="#e00a74"/></radialGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".45"/></filter>
</defs>
<rect x="64" y="64" width="896" height="896" rx="210" fill="url(#bg)"/>
<g filter="url(#sh)"><rect x="270" y="190" width="484" height="620" rx="64" fill="url(#pg)"/></g>
<circle cx="380" cy="320" r="54" fill="#d6d2cc"/>
<rect x="458" y="292" width="210" height="26" rx="13" fill="#3a3632"/>
<rect x="458" y="336" width="150" height="20" rx="10" fill="#b9b4ad"/>
<rect x="336" y="430" width="352" height="20" rx="10" fill="#cfcbc5"/>
<rect x="336" y="480" width="300" height="20" rx="10" fill="#cfcbc5"/>
<rect x="336" y="560" width="352" height="20" rx="10" fill="#cfcbc5"/>
<rect x="336" y="610" width="240" height="20" rx="10" fill="#cfcbc5"/>
<circle cx="742" cy="760" r="112" fill="url(#dot)"/>
<path d="M690 760l36 36 72-76" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
await sharp(Buffer.from(svg)).resize(1024, 1024).png().toFile(path.join(root, 'assets/icon.png'));
await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(root, 'assets/icon-256.png'));
console.log('✓ assets/icon.png e assets/icon-256.png');
