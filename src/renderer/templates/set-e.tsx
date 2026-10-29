// Modelos 64–66.
import { Bg, ContactSec, Contacts, JobTitle, Name, Photo, Sec, Secs, SummaryText, type TemplateDef } from './engine';

export const setE: TemplateDef[] = [
  {
    id: 'maresias', name: 'Maresias', refs: ['modelo-64'], desc: 'Fundo off-white, foto retangular e títulos em caixinhas contornadas.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno', 'elegante'], accent: '#2b2b2b', palette: ['#2b2b2b', '#3d5a80', '#7f5539', '#52796f'],
    fonts: { head: 'poppins', body: 'poppins' }, aside: ['education', 'skills', 'languages', 'references'],
    css: `
.T { padding: 14mm 14mm 12mm; display: grid; grid-template-columns: 56mm 1fr; font-size: calc(8.6pt * var(--fs)); }
.T .bg { width: 100%; background: linear-gradient(#5c5c5c, #5c5c5c) calc(14mm + 56mm) 14mm / .25mm calc(100% - 26mm) no-repeat, #f6f6f1; }
.T .side { padding-right: 8mm; }
.T .main { padding-left: 9mm; min-width: 0; }
.T .side .ph { width: 100%; height: 56mm; margin-bottom: 7mm; border-bottom: 0; }
.T .side .ph + * { border-top: .25mm solid #5c5c5c; padding-top: 7mm; }
.T .jt { display: inline-block; border: .3mm solid var(--accent); padding: .35em .9em; font-size: .78em; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4mm; }
.T .nm { font-size: 2.9em; font-weight: 500; color: var(--accent); margin-bottom: 4mm; }
.T .sum { line-height: 1.75; color: #3a3a3a; font-size: 1.05em; padding-bottom: 7mm; margin-bottom: 7mm; border-bottom: .25mm solid #5c5c5c; }
.T .sec-t { text-transform: uppercase; letter-spacing: .03em; font-weight: 500; font-size: 1em; margin-bottom: calc(1em * var(--sp)); }
.T .sec-tx { border: .3mm solid var(--accent); padding: .3em .85em; }
.T .sec { margin-bottom: calc(1.7em * var(--sp)); }
.T .ct { font-size: .88em; color: #444; }
.T .ct li { margin: .7em 0; }
.T .en-d { color: #222; font-weight: 500; font-size: .92em; }
.T .en-t { font-size: .95em; font-weight: 600; }
.T .en-s { color: #555; font-size: .92em; }
.T .en-desc { color: #444; line-height: 1.7; margin-top: .6em; }
.T .main .en { margin-bottom: calc(1.4em * var(--sp)); }
.T .lv-segments li { margin: .65em 0; font-size: .92em; }
.T .lv-segpips { gap: .18em; }
.T .lv-segpips i { width: .95em; height: .3em; background: #c9c9c4; }
.T .lv-segpips i.on { background: var(--accent); }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="side pad">
            <Photo c={c} shape="square" />
            <div><ContactSec c={c} variant="plain" /><Secs c={c} list={aside} o={{ entry: 'top', skills: 'segments', langs: 'segments' }} /></div>
          </div>
          <div className="main pad">
            <JobTitle c={c} />
            <Name c={c} />
            <SummaryText c={c} s={sum} />
            <Secs c={c} list={main} o={{ entry: 'top', skills: 'segments', langs: 'segments' }} />
          </div>
        </>
      );
    },
  },

  {
    id: 'penedo', name: 'Penedo', refs: ['modelo-65'], desc: 'Fundo bege, nome em bloco e seções em faixas com o título à esquerda.',
    photo: 'yes', ats: 'media', cols: 1, tags: ['com foto', 'elegante', 'moderno'], accent: '#1f1f1f', palette: ['#1f1f1f', '#3f4e4f', '#6b4f3a', '#344966'],
    fonts: { head: 'montserrat', body: 'montserrat' }, aside: [],
    css: `
.T { padding: 14mm 14mm 12mm; font-size: calc(8.6pt * var(--fs)); color: #2a2a2a; }
.T .bg { width: 100%; background: #e7e4de; }
.T .hd { display: grid; grid-template-columns: 62mm 46mm 1fr; gap: 0 6mm; align-items: start; margin-bottom: 8mm; }
.T .hd.nophoto { grid-template-columns: 62mm 1fr; }
.T .nm { font-size: 2.7em; font-weight: 800; text-transform: uppercase; line-height: .95; color: var(--accent); }
.T .jt { font-weight: 700; text-transform: uppercase; font-size: .95em; margin: 2mm 0 5mm; color: var(--accent); }
.T .ct { font-size: .95em; }
.T .ct li { margin: .15em 0; }
.T .hd .ph { width: 46mm; height: 60mm; }
.T .hd .sec { margin: 0; }
.T .hd .sec-t { margin-bottom: .4em; }
.T .sum p + p { margin-top: .8em; }
.T .sec-t { font-size: 1.05em; letter-spacing: 0; color: var(--accent); }
.T .rows > .sec { display: grid; grid-template-columns: 62mm 1fr; gap: 0 6mm; border-top: .25mm solid #b7b2aa; padding-top: calc(6mm * var(--sp)); margin-bottom: calc(6mm * var(--sp)); }
.T .rows > .sec > .sec-t { margin: 0; align-self: start; }
.T .rows .en-sub { display: grid; grid-template-columns: 46mm 1fr; grid-template-rows: auto 1fr; align-items: start; gap: 0 6mm; margin-bottom: calc(1.6em * var(--sp)); }
.T .rows .en-sub > .en-t, .T .rows .en-sub > .en-meta { grid-column: 1; }
.T .rows .en-sub > :last-child:not(.en-meta):not(.en-t) { grid-column: 2; grid-row: 1 / span 2; margin-top: 0; }
.T .rows .en-sub > :last-child > .en-desc, .T .rows .en-desc { margin-top: 0; }
.T .en-meta { display: block; }
.T .en-t { text-transform: uppercase; font-weight: 800; font-size: 1.02em; line-height: 1.15; color: var(--accent); }
.T .en-s, .T .en-d { color: #3a3a3a; font-size: 1em; margin-top: .25em; display: block; }
.T .en-d { white-space: normal; }
.T .en-sep { display: none; }
.T .en-l { display: block; }
.T .en-desc p + p { margin-top: .8em; }
.T .lv-columns { columns: 3; column-gap: 6mm; }
.T .lv-list { max-width: 95mm; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main } = c.split([]);
      return (
        <>
          <Bg />
          <header className={`hd ${c.hasPhoto ? '' : 'nophoto'}`}>
            <div><Name c={c} split /><JobTitle c={c} /><Contacts c={c} variant="plain" /></div>
            <Photo c={c} shape="square" />
            {sum ? <Sec c={c} s={sum} /> : <div />}
          </header>
          <div className="rows"><Secs c={c} list={main} o={{ entry: 'sub', skills: 'columns', langs: 'list', interests: 'bullets' }} /></div>
        </>
      );
    },
  },

  {
    id: 'guaruja', name: 'Guarujá', refs: ['modelo-66'], desc: 'Faixa amarela na lateral, foto redonda e nome dentro de uma moldura.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno', 'criativo'], accent: '#f2b90f', palette: ['#f2b90f', '#e76f51', '#2a9d8f', '#3a86ff'],
    fonts: { head: 'lato', body: 'lato' }, aside: ['skills', 'languages', 'references', 'interests'],
    css: `
.T { padding: 14mm 14mm 16mm 19mm; font-size: calc(8.6pt * var(--fs)); color: #3a3a3a; }
.T .bg { width: 100%; background: linear-gradient(var(--accent), var(--accent)) 0 0 / 8mm 118mm no-repeat, linear-gradient(var(--accent), var(--accent)) 0 100% / 100% 4mm no-repeat; }
.T .hd { display: grid; grid-template-columns: 58mm 1fr; gap: 0 10mm; align-items: center; margin-bottom: 11mm; }
.T .hd .ph { width: 34mm; height: 34mm; margin: 0 auto; }
.T .nmbox { position: relative; border: .5mm solid #333; padding: 6mm 6mm 7mm; text-align: center; }
.T .nm { font-size: 2.1em; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #333; }
.T .jt { position: absolute; left: 50%; bottom: 0; transform: translate(-50%, 50%); background: #fff; padding: 0 3mm; white-space: nowrap; font-weight: 700; font-size: .95em; color: #555; }
.T .cols { display: grid; grid-template-columns: 58mm 1fr; gap: 0 10mm; }
.T .sec-t { font-weight: 700; letter-spacing: .14em; font-size: 1.2em; color: #333; margin-bottom: calc(.9em * var(--sp)); }
.T .sec { padding-bottom: calc(5mm * var(--sp)); margin-bottom: calc(5mm * var(--sp)); border-bottom: .3mm solid #555; }
.T .sec:last-child { border-bottom: 0; }
.T .ct li { margin: 0 0 1.1em; align-items: flex-start; gap: 1em; }
.T .ct-ic { font-size: 1.2em; color: #333; }
.T .ct-v { color: #333; }
.T .side-ct { margin-bottom: 9mm; }
.T .en-t { text-transform: uppercase; font-size: 1em; color: #333; }
.T .en-s { text-transform: uppercase; font-size: .85em; color: #999; }
.T .en-d { color: #333; font-weight: 700; }
.T .en-desc { text-align: justify; }
.T .main .sum { text-align: justify; }
.T .lv-bars li { margin: .75em 0; }
.T .lv-bar { flex-basis: 50%; height: .45em; border-radius: 0; background: #ddd; }
.T .lv-bar i { border-radius: 0; background: #333; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}>
            <Photo c={c} />
            <div className="nmbox"><Name c={c} /><JobTitle c={c} /></div>
          </header>
          <div className="cols">
            <div className="side"><Contacts c={c} variant="icons" className="side-ct" /><Secs c={c} list={aside} o={{ skills: 'bars', langs: 'bars', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'stack' }} /></div>
          </div>
        </>
      );
    },
  },
];
