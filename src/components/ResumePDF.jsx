import { Document, Page, View, Text, Image, Font, Svg, Path, Circle, Rect } from '@react-pdf/renderer'

// Arial — métrica compatível com Helvetica, com Black (900) para o nome
Font.register({
  family: 'Arial',
  fonts: [
    { src: '/src/fonts/Arial-Regular.ttf',    fontWeight: 400 },
    { src: '/src/fonts/Arial-Bold.ttf',        fontWeight: 700 },
    { src: '/src/fonts/Arial-Italic.ttf',      fontWeight: 400, fontStyle: 'italic' },
    { src: '/src/fonts/Arial-BoldItalic.ttf',  fontWeight: 700, fontStyle: 'italic' },
    { src: '/src/fonts/ArialBlack.ttf',        fontWeight: 900 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

const FONT       = 'Arial'          // regular (400)
const FONT_BOLD  = 'Arial'          // bold (700) — especificado via fontWeight
const FONT_OBL   = 'Arial'          // italic — via fontStyle
const FONT_HEAVY = 'Arial'          // black (900) — para o nome

// CSS px → PDF pt  (96dpi screen → 72dpi PDF = 72/96 = 0.75)
const PX_TO_PT = 0.75
const pt  = (px) => px * PX_TO_PT
// em-based letter-spacing: emValue * fontSizePx * PX_TO_PT
const emPt = (em, sizePx) => em * sizePx * PX_TO_PT
// Converte hex (#rrggbb) + alpha separado → rgba() que react-pdf entende
const hexToRgba = (hex, alpha) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const DEFAULT = {
  sidebarBg:              '#E8E4DC',
  sidebarTitleColor:      '#2d2d2d',
  sidebarItemTitleColor:  '#2d2d2d',
  sidebarItemSubColor:    '#6b7280',
  sidebarSectionTitleSize: 7,
  sidebarItemTitleSize:    9,
  sidebarItemSubSize:      8,
  mainBg:               '#FFFFFF',
  mainNameColor:        '#2d2d2d',
  mainSectionTitleColor:'#2d2d2d',
  mainBodyColor:        '#374151',
  mainMutedColor:       '#6b7280',
  mainNameSize:         26,
  mainSubtitleSize:     10,
  mainContactSize:      10,
  mainSectionTitleSize:  9,
  mainBodySize:         10,
  mainCompanySize:      11,
  mainRoleSize:         10,
}

const IconPin = ({ color }) => (
  <Svg width={pt(10)} height={pt(10)} viewBox="0 0 24 24">
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
)
const IconMail = ({ color }) => (
  <Svg width={pt(10)} height={pt(10)} viewBox="0 0 24 24">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={2} fill="none" />
    <Path d="M22 7L13.03 12.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
)
const IconPhone = ({ color }) => (
  <Svg width={pt(10)} height={pt(10)} viewBox="0 0 24 24">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.4A16 16 0 0 0 14 16.45l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 14h3a2 2 0 0 1 2.27 1.92z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
)

export default function ResumePDF({ data }) {
  const raw = { ...DEFAULT, ...(data.style || {}) }

  // Converte px → pt em todas as fontes para fidelidade com a prévia
  const st = {
    ...raw,
    sidebarSectionTitleSize: raw.sidebarSectionTitleSize * PX_TO_PT,
    sidebarItemTitleSize:    raw.sidebarItemTitleSize    * PX_TO_PT,
    sidebarItemSubSize:      raw.sidebarItemSubSize      * PX_TO_PT,
    mainNameSize:            raw.mainNameSize            * PX_TO_PT,
    mainSubtitleSize:        raw.mainSubtitleSize        * PX_TO_PT,
    mainContactSize:         raw.mainContactSize         * PX_TO_PT,
    mainSectionTitleSize:    raw.mainSectionTitleSize    * PX_TO_PT,
    mainBodySize:            raw.mainBodySize            * PX_TO_PT,
    mainCompanySize:         raw.mainCompanySize         * PX_TO_PT,
    mainRoleSize:            raw.mainRoleSize            * PX_TO_PT,
    // letter-spacings em pt, calculados via em (fiel à prévia)
    nameLetterSpacing:       emPt(0.10, raw.mainNameSize),
    sectionLetterSpacing:    emPt(0.12, raw.mainSectionTitleSize),
    sidebarLetterSpacing:    emPt(0.15, raw.sidebarSectionTitleSize),
  }

  const SidebarSection = ({ title, children }) => (
    <View style={{ width: '100%', marginBottom: pt(14) }}>
      <Text style={{
        fontFamily: FONT_BOLD,
        fontWeight: 700,
        fontSize: st.sidebarSectionTitleSize,
        color: st.sidebarTitleColor,
        letterSpacing: st.sidebarLetterSpacing,
        lineHeight: 1.5,
        textTransform: 'uppercase',
        marginBottom: pt(4),
      }}>
        {title}
      </Text>
      <View style={{
        borderBottomWidth: pt(1),
        borderBottomColor: '#c4c7cc',
        marginBottom: pt(10),
      }} />
      {children}
    </View>
  )

  const MainSection = ({ title, children }) => (
    <View style={{ marginBottom: st.mainBodySize * 3 }}>
      <Text style={{
        fontFamily: FONT_BOLD,
        fontWeight: 700,
        fontSize: st.mainSectionTitleSize,
        color: st.mainSectionTitleColor,
        letterSpacing: st.sectionLetterSpacing,
        lineHeight: 1.5,
        textTransform: 'uppercase',
        borderBottomWidth: pt(0.5),
        borderBottomColor: '#d7d9dd',
        paddingBottom: pt(6),
        marginBottom: pt(12),
      }}>
        {title}
      </Text>
      {children}
    </View>
  )

  return (
    <Document
      title={data.name}
      author={data.name}
      subject="Currículo Profissional"
      creator="CV App"
      producer="CV App"
      language="pt-BR"
    >
      <Page size="A4" style={{ flexDirection: 'row', backgroundColor: st.mainBg, fontFamily: FONT }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <View style={{
          width: '35%',
          backgroundColor: st.sidebarBg,
          paddingTop:        pt(32),
          paddingBottom:     pt(32),
          paddingHorizontal: pt(20),
          flexDirection: 'column',
          alignItems: 'center',
        }}>

          {/* Foto */}
          {!data.photoHidden && (
            <View style={{ marginBottom: pt(24) }}>
              {(data.photoCropped || data.photo) ? (
                <Image
                  src={data.photoCropped || data.photo}
                  style={{ width: pt(100), height: pt(100), borderRadius: pt(50), objectFit: 'cover' }}
                />
              ) : (
                <View style={{
                  width: pt(100), height: pt(100), borderRadius: pt(50),
                  backgroundColor: st.sidebarItemSubColor + '22',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontFamily: FONT, fontWeight: 400, fontSize: pt(10), color: st.sidebarItemSubColor }}>Foto</Text>
                </View>
              )}
            </View>
          )}

          {/* Social */}
          {data.social.length > 0 && (
            <SidebarSection title="SOCIAL">
              {data.social.map((item, i) => (
                <View key={i} style={{ marginBottom: pt(8) }}>
                  <Text style={{
                    fontFamily: FONT_BOLD, fontWeight: 700,
                    fontSize: st.sidebarItemTitleSize,
                    color: st.sidebarItemTitleColor,
                    marginBottom: pt(1),
                  }}>
                    {item.platform}
                  </Text>
                  <Text style={{
                    fontFamily: FONT_OBL, fontWeight: 400, fontStyle: 'italic',
                    fontSize: st.sidebarItemSubSize,
                    color: st.sidebarItemSubColor,
                  }}>
                    {item.handle}
                  </Text>
                </View>
              ))}
            </SidebarSection>
          )}

          {/* Formação */}
          {data.education.length > 0 && (
            <SidebarSection title="FORMAÇÃO">
              {data.education.map((item, i) => (
                <View key={i} style={{ marginBottom: pt(8) }}>
                  <Text style={{
                    fontFamily: FONT_BOLD, fontWeight: 700,
                    fontSize: st.sidebarItemTitleSize,
                    color: st.sidebarItemTitleColor,
                    marginBottom: pt(2),
                    lineHeight: 1.4,
                  }}>
                    {item.degree}
                  </Text>
                  <Text style={{
                    fontFamily: FONT_OBL, fontWeight: 400, fontStyle: 'italic',
                    fontSize: st.sidebarItemSubSize,
                    color: st.sidebarItemSubColor,
                  }}>
                    {item.institution}
                  </Text>
                </View>
              ))}
            </SidebarSection>
          )}

          {/* Especializações */}
          {data.specializations.length > 0 && (
            <SidebarSection title="ESPECIALIZAÇÕES">
              {data.specializations.map((item, i) => (
                <View key={i} style={{ marginBottom: pt(8) }}>
                  <Text style={{
                    fontFamily: FONT_BOLD, fontWeight: 700,
                    fontSize: st.sidebarItemTitleSize,
                    color: st.sidebarItemTitleColor,
                    marginBottom: pt(1),
                    lineHeight: 1.4,
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{
                    fontFamily: FONT_OBL, fontWeight: 400, fontStyle: 'italic',
                    fontSize: st.sidebarItemSubSize,
                    color: st.sidebarItemSubColor,
                  }}>
                    {item.institution}
                  </Text>
                </View>
              ))}
            </SidebarSection>
          )}
        </View>

        {/* ── MAIN ─────────────────────────────────────────────────── */}
        <View style={{
          width: '65%',
          backgroundColor: st.mainBg,
          paddingTop:        pt(36),
          paddingBottom:     pt(32),
          paddingHorizontal: pt(32),
          flexDirection: 'column',
        }}>

          {/* Nome — Arial Black (900) para paridade visual com font-weight:800 do CSS */}
          <Text style={{
            fontFamily: FONT_HEAVY,
            fontWeight: 900,
            fontSize: st.mainNameSize,
            color: st.mainNameColor,
            letterSpacing: st.nameLetterSpacing,
            textTransform: 'uppercase',
            marginBottom: pt(10),
            lineHeight: 1.15,
          }}>
            {data.name}
          </Text>

          {/* Subtítulo */}
          <Text style={{
            fontFamily: FONT, fontWeight: 400,
            fontSize: st.mainSubtitleSize,
            color: st.mainMutedColor,
            marginBottom: pt(22),
            lineHeight: 1.5,
          }}>
            {data.subtitle}
          </Text>

          {/* Contato */}
          <View style={{ marginBottom: pt(30) }}>
            {data.address ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: pt(7) }}>
                <View style={{ marginRight: pt(6) }}><IconPin color={st.mainMutedColor} /></View>
                <Text style={{ fontFamily: FONT, fontWeight: 400, fontSize: st.mainContactSize, color: st.mainBodyColor }}>{data.address}</Text>
              </View>
            ) : null}
            {data.email ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: pt(7) }}>
                <View style={{ marginRight: pt(6) }}><IconMail color={st.mainMutedColor} /></View>
                <Text style={{ fontFamily: FONT, fontWeight: 400, fontSize: st.mainContactSize, color: st.mainBodyColor }}>{data.email}</Text>
              </View>
            ) : null}
            {data.phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: pt(6) }}><IconPhone color={st.mainMutedColor} /></View>
                <Text style={{ fontFamily: FONT, fontWeight: 400, fontSize: st.mainContactSize, color: st.mainBodyColor }}>{data.phone}</Text>
              </View>
            ) : null}
          </View>

          {/* Resumo */}
          {data.summary ? (
            <MainSection title="RESUMO PROFISSIONAL">
              <Text style={{
                fontFamily: FONT, fontWeight: 400,
                fontSize: st.mainBodySize,
                color: st.mainBodyColor,
                lineHeight: 1.7,
              }}>
                {data.summary}
              </Text>
            </MainSection>
          ) : null}

          {/* Experiências */}
          {data.experiences.length > 0 && (
            <MainSection title="EXPERIÊNCIAS DE TRABALHO">
              {data.experiences.map((exp, i) => (
                <View key={i} style={{ marginBottom: pt(20) }}>
                  <Text style={{
                    fontFamily: FONT_BOLD, fontWeight: 700,
                    fontSize: st.mainCompanySize,
                    color: st.mainBodyColor,
                    marginBottom: pt(3),
                  }}>
                    {exp.company}
                  </Text>
                  <Text style={{
                    fontFamily: FONT_OBL, fontWeight: 400, fontStyle: 'italic',
                    fontSize: st.mainRoleSize,
                    color: st.mainMutedColor,
                    marginBottom: pt(8),
                  }}>
                    {exp.role}
                  </Text>
                  {exp.bullets.map((b, j) => (
                    <Text key={j} style={{
                      fontFamily: FONT, fontWeight: 400,
                      fontSize: st.mainBodySize,
                      color: st.mainBodyColor,
                      marginLeft: pt(8),
                      marginBottom: pt(4),
                      lineHeight: 1.6,
                    }}>
                      {'• '}{b}
                    </Text>
                  ))}
                </View>
              ))}
            </MainSection>
          )}

        </View>
      </Page>
    </Document>
  )
}
