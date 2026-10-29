// Modelos 14–26.
import { Bg, Contacts, ContactSec, JobTitle, Name, Photo, Sec, Secs, SummaryText, type TemplateDef } from './engine';

export const setB: TemplateDef[] = [
  {
    id: 'moinhos', name: 'Moinhos', refs: ['modelo-14'], desc: 'Barra preta no cabeçalho, nome em dois pesos e foto recortada.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#111111', palette: ['#111111', '#1d4e89', '#7c2d12', '#14532d'],
    fonts: { head: 'roboto', body: 'roboto' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 14mm 14mm 13mm 0; }
.T .hd { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: center; border-left: 5mm solid var(--accent); padding-left: 10mm; margin-bottom: 7mm; }
.T .nm { font-weight: 300; font-size: 2.3em; text-transform: uppercase; line-height: 1.1; }
.T .nm-last { display: block; font-weight: 800; }
.T .jt { letter-spacing: .4em; text-transform: uppercase; font-size: .82em; margin-top: .7em; font-weight: 500; }
.T .ct { font-size: .85em; }
.T .ct .ct-v { border-bottom: 1px solid #999; padding-bottom: .1em; }
.T .ct-ic { color: var(--accent); }
.T .body { padding-left: 15mm; }
.T .top { display: grid; grid-template-columns: 1fr 40mm; gap: 6mm; align-items: end; margin-bottom: 6mm; }
.T .ph { width: 40mm; height: 46mm; }
.T .cols { display: grid; grid-template-columns: 1fr 58mm; gap: 9mm; }
.T .sec-t { font-weight: 800; font-size: 1.05em; letter-spacing: .06em; border-bottom: 1.5px solid #222; padding-bottom: .3em; }
.T .en-t { font-size: .98em; }
.T .en-o { font-weight: 600; color: #333; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Contacts c={c} variant="icons" /></header>
          <div className="body">
            <div className="top">{sum ? <Sec c={c} s={sum} /> : <div />}<Photo c={c} shape="square" /></div>
            <div className="cols">
              <div className="main"><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
              <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            </div>
          </div>
        </>
      );
    },
  },

  {
    id: 'canela', name: 'Canela', refs: ['modelo-15'], desc: 'Serifa delicada, tons de areia e linha do tempo.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#a08a77', palette: ['#a08a77', '#7d8b7a', '#8c7aa0', '#b0876b'],
    fonts: { head: 'cormorant', body: 'lato' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 14mm 14mm 13mm; display: grid; grid-template-columns: 60mm 1fr; gap: 0 9mm; }
.T .ph { width: 52mm; height: 52mm; margin-bottom: 8mm; }
.T .hd { grid-column: 2; align-self: center; text-align: center; padding-bottom: 4mm; }
.T .nm { font-weight: 500; font-size: 2.6em; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }
.T .jt { display: flex; align-items: center; gap: .8em; justify-content: center; letter-spacing: .25em; text-transform: uppercase; font-size: .78em; color: #777; margin-top: .6em; font-family: var(--f-body); }
.T .jt::before, .T .jt::after { content: ''; height: 1px; width: 10mm; background: #bbb; }
.T .sec-t { font-family: var(--f-body); font-weight: 400; letter-spacing: .3em; font-size: .85em; color: #777; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .88em; }
.T .main { border-left: 1px solid #ddd; padding-left: 7mm; }
.T .en-timeline { margin-left: -7mm; padding-left: 7mm; }
.T .en-timeline::before { display: none; }
.T .en-timeline::after { left: -1.1mm; width: 2.2mm; height: 2.2mm; background: var(--accent); border: 0; }
.T .en-t { text-transform: uppercase; font-size: .86em; letter-spacing: .06em; color: var(--accent); font-weight: 700; }
.T .lv-bar { flex-basis: 40%; height: .3em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <div>{c.hasPhoto ? <Photo c={c} /> : null}</div>
          <header className="hd"><Name c={c} /><JobTitle c={c} /></header>
          <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list' }} /></div>
          <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'timeline' }} /></div>
        </>
      );
    },
  },

  {
    id: 'barra', name: 'Barra', refs: ['modelo-16'], desc: 'Bloco escuro com o cargo, foto alta e títulos em faixa.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'impacto'], accent: '#3a3a3a', palette: ['#3a3a3a', '#1f3b57', '#5b2333', '#24423a'],
    fonts: { head: 'oswald', body: 'roboto' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 14mm 14mm 13mm 0; display: grid; grid-template-columns: 70mm 1fr; gap: 0 8mm; }
.T .tag { background: var(--accent); color: #fff; padding: 5mm 6mm 5mm 14mm; font-family: var(--f-head); text-transform: uppercase; font-size: 1.35em; line-height: 1.15; letter-spacing: .04em; align-self: start; margin-top: 4mm; }
.T .hd .nm { font-size: 3em; text-transform: uppercase; font-weight: 500; color: #333; letter-spacing: .02em; }
.T .hd .ct { font-size: .8em; margin-bottom: 3mm; }
.T .hd .ct-inline { justify-content: flex-end; }
.T .side { padding-left: 14mm; padding-top: 6mm; }
.T .side .ph { width: 56mm; height: 80mm; margin-bottom: 7mm; }
.T .main { padding-top: 6mm; }
.T .sec-t { background: #e6e6e6; padding: .4em .8em; font-family: var(--f-head); font-weight: 500; letter-spacing: .1em; }
.T .side .sec-t { background: none; padding: 0; border-bottom: 1.5px solid #333; }
.T .en-t { font-size: .95em; }
.T .en-o { font-weight: 600; color: #333; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <div className="tag">{c.p.title || c.label('summary')}</div>
          <header className="hd"><Contacts c={c} variant="inline" /><Name c={c} split /></header>
          <div className="side"><Photo c={c} shape="square" /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list' }} /></div>
          <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
        </>
      );
    },
  },

  {
    id: 'jardins', name: 'Jardins', refs: ['modelo-17', 'modelo-61'], desc: '"Olá, eu sou", formação em linha do tempo horizontal.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#444444', palette: ['#444444', '#2563eb', '#be185d', '#047857'],
    fonts: { head: 'poppins', body: 'poppins' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 36mm 1fr; gap: 9mm; align-items: center; margin-bottom: 9mm; }
.T .ph { width: 36mm; height: 36mm; }
.T .jt { font-size: .85em; color: #777; font-family: var(--f-body); }
.T .hello { font-size: 1.6em; font-weight: 300; line-height: 1.1; margin-top: .2em; }
.T .nm { font-size: 1.9em; font-weight: 600; }
.T .sum { margin-top: .7em; font-size: .92em; color: #555; }
.T .sec-t { text-transform: none; letter-spacing: 0; font-size: 1.3em; font-weight: 500; }
.T .sec-education .ens { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 5mm; border-top: 1px solid #999; padding-top: 4mm; margin-top: 2mm; }
.T .sec-education .en { position: relative; }
.T .sec-education .en::before { content: ''; position: absolute; top: calc(-4mm - .35em); left: 0; width: .65em; height: .65em; border-radius: 50%; background: #fff; border: 1.5px solid var(--accent); }
.T .cols { display: grid; grid-template-columns: 55mm 1fr; gap: 9mm; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .85em; }
.T .en-t { font-size: .95em; font-weight: 600; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const edu = c.take('education');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd">
            <Photo c={c} />
            <div>
              <JobTitle c={c} />
              <div className="hello" aria-hidden>{{ pt: 'Olá, eu sou', en: "Hello I'm", es: 'Hola, soy' }[c.lang]}</div>
              <Name c={c} /><SummaryText c={c} s={sum} />
            </div>
          </header>
          {edu ? <Sec c={c} s={edu} o={{ entry: 'sub' }} /> : null}
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'timeline' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'ouro-preto', name: 'Ouro Preto', refs: ['modelo-18'], desc: 'Centralizado, com moldura rosada e colunas espelhadas.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#b4918e', palette: ['#b4918e', '#8e9aaf', '#a3b18a', '#c8a27a'],
    fonts: { head: 'montserrat', body: 'lato' }, aside: ['education', 'skills', 'languages', 'courses', 'interests'],
    css: `
.T { padding: 17mm 17mm 16mm; }
.T .bg { width: 100%; border: 7mm solid var(--accent); }
.T .hd { text-align: center; margin-bottom: 7mm; }
.T .nm { font-size: 1.9em; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.T .nm-last { display: block; }
.T .jt { font-size: .8em; letter-spacing: .1em; text-transform: uppercase; margin-top: .4em; color: #555; font-family: var(--f-body); }
.T .ph { width: 30mm; height: 30mm; margin: 5mm auto 0; }
.T .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 9mm; }
.T .left { text-align: right; }
.T .left .sec-t { justify-content: flex-end; }
.T .sec-t { font-size: .95em; letter-spacing: .12em; font-weight: 700; }
.T .left .ct li { justify-content: flex-end; }
.T .left .en-left { grid-template-columns: 1fr; }
.T .en-left { grid-template-columns: 17mm 1fr; gap: 0 4mm; }
.T .en-d { color: #333; font-weight: 600; }
.T .en-t { font-size: .92em; }
.T .left .en-desc ul { list-style: none; padding: 0; }
.T .sum { color: #555; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd"><Name c={c} split /><JobTitle c={c} /><Photo c={c} /></header>
          <div className="cols">
            <div className="left">{sum ? <Sec c={c} s={sum} /> : null}<ContactSec c={c} variant="plain" /><Secs c={c} list={main} o={{ entry: 'top' }} /></div>
            <div className="right"><Secs c={c} list={aside} o={{ entry: 'left', skills: 'bullets', langs: 'list' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'batel', name: 'Batel', refs: ['modelo-19'], desc: 'Foto quadrada, nome grande e conteúdo em duas colunas limpas.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#3d3d3d', palette: ['#3d3d3d', '#0b5394', '#7f1d1d', '#166534'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['skills', 'languages', 'awards', 'interests'],
    css: `
.T { padding: 16mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 40mm 1fr; gap: 10mm; align-items: center; margin-bottom: 9mm; }
.T .ph { width: 40mm; height: 40mm; }
.T .nm { font-size: 2.7em; text-transform: uppercase; color: var(--accent); }
.T .jt { letter-spacing: .25em; text-transform: uppercase; font-size: .95em; color: #666; margin: .5em 0 1em; }
.T .ct { font-size: .9em; }
.T .cols { display: grid; grid-template-columns: 54mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1.5px solid #aaa; }
.T .main { padding-left: 8mm; }
.T .sec-t { font-size: 1.15em; letter-spacing: .02em; border-bottom: 1.5px solid #aaa; padding-bottom: .3em; color: #333; }
.T .side .sum { font-style: italic; }
.T .en-o { font-style: italic; }
.T .en-t { font-size: 1em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}><Photo c={c} shape="square" /><div><Name c={c} /><JobTitle c={c} /><Contacts c={c} /></div></header>
          <div className="cols">
            <div className="side">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'sub' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'floripa', name: 'Floripa', refs: ['modelo-20', 'modelo-48'], desc: 'Detalhes em amarelo vibrante e foto com recorte.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'moderno'], accent: '#f2b705', palette: ['#f2b705', '#ef476f', '#06d6a0', '#118ab2'],
    fonts: { head: 'montserrat', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 16mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 1fr auto; gap: 8mm; align-items: end; margin-bottom: 9mm; }
.T .nm { font-weight: 300; font-size: 2.4em; text-transform: uppercase; position: relative; padding-top: 4mm; }
.T .nm::before { content: ''; position: absolute; top: 0; left: 0; width: 8mm; height: 2mm; background: var(--accent); transform: skewX(-25deg); }
.T .nm-last { display: block; font-weight: 800; }
.T .jt { font-size: .78em; letter-spacing: .2em; text-transform: uppercase; color: #777; margin-top: .6em; }
.T .ct { font-size: .85em; }
.T .ct-ic { color: var(--accent); }
.T .cols { display: grid; grid-template-columns: 55mm 1fr; gap: 9mm; }
.T .pw { position: relative; width: 45mm; height: 52mm; margin-bottom: 8mm; }
.T .pw::after { content: ''; position: absolute; right: -3mm; bottom: -3mm; width: 22mm; height: 22mm; background: linear-gradient(135deg, transparent 50%, var(--accent) 50%); }
.T .pw .ph { width: 100%; height: 100%; }
.T .sec-t { font-size: .95em; letter-spacing: .1em; font-weight: 800; }
.T .lv-bullets li::marker { color: var(--accent); }
.T .en-t { font-size: .9em; text-transform: uppercase; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd"><div><Name c={c} split /><JobTitle c={c} /></div><Contacts c={c} variant="icons" /></header>
          <div className="cols">
            <div className="side">{c.hasPhoto ? <div className="pw"><Photo c={c} shape="square" /></div> : null}<Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'top' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'cumbuco', name: 'Cumbuco', refs: ['modelo-21'], desc: 'Nome forte, barras laranjas nas bordas e ícones de interesses.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'impacto'], accent: '#e8743b', palette: ['#e8743b', '#d62828', '#3a86ff', '#2a9d8f'],
    fonts: { head: 'poppins', body: 'opensans' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { padding: 15mm 15mm 13mm; }
.T .bg { width: 100%; background: linear-gradient(var(--accent) 0 0) left 0 top 15mm / 3mm 16mm no-repeat, linear-gradient(var(--accent) 0 0) right 0 bottom 30mm / 3mm 24mm no-repeat; }
.T .hd { display: grid; grid-template-columns: 1fr 40mm; gap: 8mm; padding-bottom: 7mm; border-bottom: 1px solid #ccc; margin-bottom: 7mm; }
.T .nm { font-size: 2.6em; text-transform: uppercase; font-weight: 700; }
.T .nm-last { display: block; }
.T .jt { color: var(--accent); letter-spacing: .3em; text-transform: uppercase; font-size: .8em; margin: .5em 0 .8em; }
.T .sum { color: #555; font-size: .92em; }
.T .ph { width: 40mm; height: 46mm; }
.T .cols { display: grid; grid-template-columns: 54mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #ccc; }
.T .main { padding-left: 8mm; }
.T .sec-t { text-transform: uppercase; font-weight: 500; letter-spacing: 0; font-size: 1.3em; }
.T .ct-ic { color: var(--accent); }
.T .ct { font-size: .88em; }
.T .lv-bars li { display: block; }
.T .lv-bars .lv-bar { display: block; margin-top: .25em; height: .25em; border-radius: 0; background: #e5e5e5; }
.T .lv-bars .lv-bar i { border-radius: 0; }
.T .en-t { color: var(--accent); font-weight: 600; font-size: .95em; }
.T .lv-icons svg { color: #444; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}><div><Name c={c} split /><JobTitle c={c} /><SummaryText c={c} s={sum} /></div><Photo c={c} shape="square" /></header>
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bars', langs: 'list', interests: 'icons' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'sub', orgFirst: true }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'petropolis', name: 'Petrópolis', refs: ['modelo-22'], desc: 'Coluna clara com foto sangrando e sobrenome dourado.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#c49a45', palette: ['#c49a45', '#9a7b6b', '#6d8a96', '#8a6f9e'],
    fonts: { head: 'cormorant', body: 'opensans' }, aside: ['skills', 'languages', 'interests'],
    css: `
.T { display: grid; grid-template-columns: 68mm 1fr; }
.T .bg { width: 68mm; background: #f1f1f0; }
.T .side { padding: 0 8mm 12mm 10mm; }
.T .side .ph { width: 68mm; height: 82mm; margin: 0 -8mm 8mm -10mm; border-radius: 0; }
.T .side.nophoto { padding-top: 16mm; }
.T .main { padding: 16mm 14mm 12mm 10mm; }
.T .nm { font-size: 3em; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; line-height: 1.1; }
.T .nm-last { display: block; color: var(--accent); }
.T .jt { border-top: 1.5px solid var(--accent); padding-top: 4mm; margin: 5mm 0 8mm; letter-spacing: .3em; text-transform: uppercase; font-size: .82em; font-family: var(--f-body); }
.T .sec-t { font-family: var(--f-body); font-weight: 600; letter-spacing: .3em; font-size: .9em; }
.T .ct-ic { width: 1.8em; height: 1.8em; border-radius: 50%; background: #333; color: #fff; justify-content: center; align-items: center; font-size: .8em; }
.T .ct { font-size: .88em; }
.T .en-t { font-weight: 700; font-size: .92em; }
.T .lv-pips i.on { background: #333; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}><Name c={c} split /><JobTitle c={c} />{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          <div className={`side pad ${c.hasPhoto ? '' : 'nophoto'}`} style={{ gridColumn: 1, gridRow: 1 }}><Photo c={c} shape="square" /><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'dots' }} /></div>
        </>
      );
    },
  },

  {
    id: 'liberdade', name: 'Liberdade', refs: ['modelo-23'], desc: 'Coluna cinza com foto no topo e nome serifado espaçado.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#5a5a5a', palette: ['#5a5a5a', '#3f5e6b', '#6b4e3f', '#4a5a3f'],
    fonts: { head: 'garamond', body: 'opensans' }, aside: ['skills', 'education', 'languages', 'interests', 'courses'],
    css: `
.T { display: grid; grid-template-columns: 64mm 1fr; }
.T .bg { width: 64mm; background: #e9e9e8; }
.T .side { padding: 0 7mm 12mm 9mm; }
.T .side .ph { width: 64mm; height: 76mm; margin: 0 -7mm 7mm -9mm; }
.T .side.nophoto { padding-top: 16mm; }
.T .main { padding: 18mm 14mm 12mm 10mm; }
.T .nm { font-weight: 400; font-size: 2.5em; letter-spacing: .2em; text-transform: uppercase; line-height: 1.2; color: #333; }
.T .nm-last { display: block; padding-left: 12mm; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .85em; color: #777; margin: 5mm 0 9mm; display: flex; align-items: center; gap: 1em; }
.T .jt::after { content: ''; flex: 1; height: 1px; background: #bbb; }
.T .sec-t { font-weight: 500; letter-spacing: .25em; font-size: 1.05em; color: #444; border-bottom: 1px solid #bbb; padding-bottom: .35em; }
.T .ct { font-size: .86em; }
.T .en-t { font-size: .9em; text-transform: uppercase; letter-spacing: .03em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Bg />
          <div className="main pad" style={{ gridColumn: 2, gridRow: 1 }}><Name c={c} split /><JobTitle c={c} />{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'stack' }} /></div>
          <div className={`side pad ${c.hasPhoto ? '' : 'nophoto'}`} style={{ gridColumn: 1, gridRow: 1 }}><Photo c={c} shape="square" /><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
        </>
      );
    },
  },

  {
    id: 'higienopolis', name: 'Higienópolis', refs: ['modelo-26', 'modelo-40'], desc: 'Foto redonda ao lado do nome e linhas finas separando tudo.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#333333', palette: ['#333333', '#28536b', '#6b2737', '#355e3b'],
    fonts: { head: 'raleway', body: 'opensans' }, aside: ['education', 'awards', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 16mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 36mm 1fr; gap: 9mm; align-items: center; padding-bottom: 7mm; border-bottom: 1px solid #bbb; }
.T .ph { width: 36mm; height: 36mm; }
.T .nm { font-weight: 300; font-size: 2.5em; text-transform: uppercase; letter-spacing: .04em; }
.T .nm-last { font-weight: 800; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .82em; margin: .4em 0 .8em; color: #555; }
.T .sum { font-size: .92em; color: #444; }
.T .cols { display: grid; grid-template-columns: 56mm 1fr; }
.T .side { padding: 7mm 7mm 0 0; border-right: 1px solid #bbb; }
.T .main { padding: 7mm 0 0 8mm; }
.T .side .sec { border-bottom: 1px solid #bbb; padding-bottom: 5mm; }
.T .side .sec:last-child { border: 0; }
.T .sec-t { letter-spacing: .25em; font-weight: 600; font-size: .95em; }
.T .ct { font-size: .86em; }
.T .en-t { text-transform: uppercase; font-size: .86em; letter-spacing: .03em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}><Photo c={c} /><div><Name c={c} split /><JobTitle c={c} /><SummaryText c={c} s={sum} /></div></header>
          <div className="cols">
            <div className="side"><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'urca', name: 'Urca', refs: ['modelo-46'], desc: 'Nome serifado largo no topo e foto em retrato na coluna lateral.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'elegante'], accent: '#333333', palette: ['#333333', '#2e4a62', '#5e3a2e', '#3e5641'],
    fonts: { head: 'baskerville', body: 'opensans' }, aside: ['education', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 17mm 15mm 13mm; }
.T .nm { font-weight: 400; font-size: 2.5em; text-transform: uppercase; letter-spacing: .14em; }
.T .jt { letter-spacing: .4em; text-transform: uppercase; font-size: .8em; color: #666; margin: 4mm 0 9mm; padding-bottom: 4mm; border-bottom: 1px solid #bbb; font-family: var(--f-body); }
.T .cols { display: grid; grid-template-columns: 56mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #bbb; }
.T .main { padding-left: 8mm; }
.T .side .ph { width: 49mm; height: 60mm; margin-bottom: 7mm; }
.T .sec-t { font-weight: 400; letter-spacing: .25em; font-size: 1em; }
.T .ct { font-size: .86em; }
.T .en-t { text-transform: uppercase; font-size: .86em; letter-spacing: .03em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <Name c={c} /><JobTitle c={c} />
          <div className="cols">
            <div className="side"><Photo c={c} shape="square" /><ContactSec c={c} /><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main">{sum ? <Sec c={c} s={sum} /> : null}<Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },

  {
    id: 'arpoador', name: 'Arpoador', refs: ['modelo-39', 'modelo-42'], desc: 'Foto redonda, contatos numa linha e duas colunas.',
    photo: 'yes', ats: 'media', cols: 2, tags: ['com foto', 'clássico'], accent: '#3b3b3b', palette: ['#3b3b3b', '#264653', '#7b2d26', '#4f6d3a'],
    fonts: { head: 'garamond', body: 'opensans' }, aside: ['education', 'awards', 'skills', 'languages', 'interests', 'courses'],
    css: `
.T { padding: 16mm 15mm 13mm; }
.T .hd { display: grid; grid-template-columns: 38mm 1fr; gap: 10mm; align-items: center; }
.T .ph { width: 38mm; height: 38mm; }
.T .nm { font-weight: 500; font-size: 2.6em; text-transform: uppercase; letter-spacing: .05em; }
.T .jt { letter-spacing: .3em; text-transform: uppercase; font-size: .85em; margin: .3em 0 .8em; color: #555; }
.T .sum { font-size: .9em; color: #444; }
.T .ctrow { border-top: 1px solid #aaa; border-bottom: 1px solid #aaa; padding: 2.5mm 0; margin: 7mm 0 7mm; font-size: .84em; }
.T .ctrow .ct { justify-content: space-between; }
.T .cols { display: grid; grid-template-columns: 56mm 1fr; }
.T .side { padding-right: 7mm; border-right: 1px solid #aaa; }
.T .side .sec { border-bottom: 1px solid #ccc; padding-bottom: 4mm; }
.T .main { padding-left: 8mm; }
.T .sec-t { font-weight: 500; letter-spacing: .25em; font-size: 1.05em; }
.T .en-t { text-transform: uppercase; font-size: .86em; }
`,
    render: (c) => {
      const sum = c.take('summary');
      const { main, aside } = c.split();
      return (
        <>
          <header className="hd" style={c.hasPhoto ? undefined : { gridTemplateColumns: '1fr' }}><Photo c={c} /><div><Name c={c} /><JobTitle c={c} /><SummaryText c={c} s={sum} /></div></header>
          <div className="ctrow"><Contacts c={c} variant="iconsInline" /></div>
          <div className="cols">
            <div className="side"><Secs c={c} list={aside} o={{ skills: 'bullets', langs: 'list', entry: 'top' }} /></div>
            <div className="main"><Secs c={c} list={main} o={{ entry: 'sub' }} /></div>
          </div>
        </>
      );
    },
  },
];
