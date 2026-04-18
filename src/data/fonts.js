// ── Catálogo de fontes ────────────────────────────────────────────────────────
// Adicione novos objetos aqui para expandir — o restante do sistema pega automaticamente.

export const FONTS = [
  // ── Display / Títulos ────────────────────────────────────────────────────────
  { id: 'bebas',       label: 'Bebas Neue',         family: "'Bebas Neue', cursive",                  googleFont: 'Bebas+Neue',                                            group: 'display' },
  { id: 'oswald',      label: 'Oswald',              family: "'Oswald', sans-serif",                   googleFont: 'Oswald:wght@300;400;500;600;700',                        group: 'display' },
  { id: 'raleway',     label: 'Raleway',             family: "'Raleway', sans-serif",                  googleFont: 'Raleway:ital,wght@0,300;0,400;0,500;0,700;0,800;0,900;1,400', group: 'display' },
  { id: 'montserrat',  label: 'Montserrat',          family: "'Montserrat', sans-serif",               googleFont: 'Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400', group: 'display' },
  { id: 'josefin',     label: 'Josefin Sans',        family: "'Josefin Sans', sans-serif",             googleFont: 'Josefin+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400',  group: 'display' },
  { id: 'archivo',     label: 'Archivo Black',       family: "'Archivo Black', sans-serif",            googleFont: 'Archivo+Black',                                         group: 'display' },
  { id: 'fjalla',      label: 'Fjalla One',          family: "'Fjalla One', sans-serif",               googleFont: 'Fjalla+One',                                            group: 'display' },
  { id: 'barlow',      label: 'Barlow Condensed',    family: "'Barlow Condensed', sans-serif",         googleFont: 'Barlow+Condensed:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400', group: 'display' },
  { id: 'cormorant',   label: 'Cormorant Garamond',  family: "'Cormorant Garamond', serif",            googleFont: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600', group: 'display' },
  { id: 'playfair',    label: 'Playfair Display',    family: "'Playfair Display', serif",              googleFont: 'Playfair+Display:ital,wght@0,400;0,500;0,700;1,400',    group: 'display' },
  { id: 'crimsonpro',  label: 'Crimson Pro',         family: "'Crimson Pro', serif",                   googleFont: 'Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700', group: 'display' },
  { id: 'spectral',    label: 'Spectral',            family: "'Spectral', serif",                      googleFont: 'Spectral:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600', group: 'display' },
  // ── Corpo / Texto ─────────────────────────────────────────────────────────────
  { id: 'lato',        label: 'Lato',                family: "'Lato', sans-serif",                     googleFont: 'Lato:ital,wght@0,300;0,400;0,700;1,400',                group: 'body' },
  { id: 'opensans',    label: 'Open Sans',           family: "'Open Sans', sans-serif",                googleFont: 'Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400',     group: 'body' },
  { id: 'sourcesans',  label: 'Source Sans 3',       family: "'Source Sans 3', sans-serif",            googleFont: 'Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400', group: 'body' },
  { id: 'inter',       label: 'Inter',               family: "'Inter', sans-serif",                    googleFont: 'Inter:wght@300;400;500;600;700',                         group: 'body' },
  { id: 'poppins',     label: 'Poppins',             family: "'Poppins', sans-serif",                  googleFont: 'Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400', group: 'body' },
  { id: 'nunito',      label: 'Nunito',              family: "'Nunito', sans-serif",                   googleFont: 'Nunito:ital,wght@0,300;0,400;0,600;0,700;1,400',         group: 'body' },
  { id: 'dmsans',      label: 'DM Sans',             family: "'DM Sans', sans-serif",                  googleFont: 'DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400',        group: 'body' },
  { id: 'roboto',      label: 'Roboto',              family: "'Roboto', sans-serif",                   googleFont: 'Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400',         group: 'body' },
  { id: 'merriweather',label: 'Merriweather',        family: "'Merriweather', serif",                  googleFont: 'Merriweather:ital,wght@0,300;0,400;0,700;1,400',         group: 'body' },
  { id: 'ebgaramond',  label: 'EB Garamond',         family: "'EB Garamond', serif",                   googleFont: 'EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500',   group: 'body' },
  { id: 'librebask',   label: 'Libre Baskerville',   family: "'Libre Baskerville', serif",             googleFont: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400',          group: 'body' },
  { id: 'lora',        label: 'Lora',                family: "'Lora', serif",                          googleFont: 'Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700', group: 'body' },
  { id: 'system',      label: 'Helvetica / Arial',   family: "'Helvetica Neue', Helvetica, Arial, sans-serif", googleFont: null,                                            group: 'body' },
]

export const FONT_MAP = Object.fromEntries(FONTS.map((f) => [f.id, f]))

export const FONT_GROUPS = {
  display: FONTS.filter((f) => f.group === 'display'),
  body:    FONTS.filter((f) => f.group === 'body'),
}

// Padrões por template
export const TEMPLATE_FONT_DEFAULTS = {
  template1: { fontDisplay: 'montserrat', fontBody: 'opensans'  },
  template2: { fontDisplay: 'raleway',    fontBody: 'lato'      },
  template3: { fontDisplay: 'crimsonpro', fontBody: 'lato'      },
}

export function getFontFamily(fontId) {
  return FONT_MAP[fontId]?.family ?? "'Helvetica Neue', Helvetica, Arial, sans-serif"
}
