import { PlatformIcon } from '../../data/platformIcons.jsx'
import { getFontFamily } from '../../data/fonts.js'

const DEFAULT = {
  mainBg:              '#FFFFFF',
  mainNameColor:       '#2d2d2d',
  mainBodyColor:       '#374151',
  mainMutedColor:      '#9ca3af',
  t2Master:            9,
  t2NameSize:          30,
  t2SubtitleSize:      9,
  t2ContactSize:       9,
  t2SectionTitleSize:  8,
  t2SectionTitleColor: '#9ca3af',
  t2BodySize:          9,
  t2CompanySize:       10,
  t2RoleSize:          9,
  t2DividerColor:      '#d1d5db',
  t2AccentColor:       '#e5e7eb',
}

export default function Template2Preview({ data, id = 'resume-preview' }) {
  const st = { ...DEFAULT, ...data.style }

  const SectionTitle = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      <h3 style={{
        fontSize: `${st.t2SectionTitleSize}px`, fontWeight: '700',
        fontFamily: getFontFamily(st.t2FontSectionTitle ?? data.fontBody),
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: st.t2SectionTitleColor, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {children}
      </h3>
      <div style={{ flex: 1, height: '0.5px', backgroundColor: st.t2DividerColor }} />
    </div>
  )

  // Split name: first token on line 1, rest on line 2
  const nameParts = (data.name || '').split(' ')
  const nameLine1 = nameParts[0] || ''
  const nameLine2 = nameParts.slice(1).join(' ')

  return (
    <div id={id} style={{
      width: '210mm', minHeight: '297mm',
      fontFamily: getFontFamily(data.fontBody),
      backgroundColor: st.mainBg,
      boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
      padding: '36px 40px 46px',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* ── FOOTER — faixa colorida na base ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '18px', backgroundColor: st.t2AccentColor,
      }} />

      {/* ── ACCENT BLOCK — retângulo atrás da foto, sobe até o topo do card ── */}
      {!data.photoHidden && (() => {
        const sz = data.photoSize ?? 80
        return (
          <div style={{
            position: 'absolute',
            top: 0,                 // topo do card
            left: 40,               // alinhado com a borda esquerda da foto
            width: sz,              // mesma largura da foto
            height: 36 + sz / 2,    // desce até o centro da foto (foto oculta o resto)
            backgroundColor: st.t2AccentColor,
          }} />
        )
      })()}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>

        {/* Foto */}
        {!data.photoHidden && (() => {
          const sz = data.photoSize ?? 80
          return (
            <div style={{ flexShrink: 0 }}>
              {data.photo ? (
                <div style={{
                  width: sz, height: sz,
                  borderRadius: '50%', overflow: 'hidden',
                  border: data.photoBorderHidden ? 'none' : `1.5px solid ${data.photoBorderColor ?? st.t2DividerColor}`,
                }}>
                  <img src={data.photo} alt="Foto de perfil" draggable={false} style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    objectPosition: `${data.photoX ?? 50}% ${data.photoY ?? 50}%`,
                    transform: `scale(${(data.photoScale ?? 100) / 100})`,
                    transformOrigin: `${data.photoX ?? 50}% ${data.photoY ?? 50}%`,
                    display: 'block', pointerEvents: 'none',
                    filter: data.photoGrayscale ? 'grayscale(1)' : 'none',
                  }} />
                </div>
              ) : (
                <div style={{
                  width: sz, height: sz,
                  borderRadius: '50%', backgroundColor: '#f3f4f6',
                  border: `1.5px solid ${st.t2DividerColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: st.t2SectionTitleColor, fontSize: '9px',
                  textAlign: 'center', lineHeight: '1.3',
                }}>
                  Adicionar<br />Foto
                </div>
              )}
            </div>
          )
        })()}

        {/* Name + Title */}
        <div style={{ flex: 1, paddingTop: '2px' }}>
          <div style={{
            fontSize: `${st.t2NameSize}px`, fontWeight: '800',
            fontFamily: getFontFamily(st.t2FontName ?? data.fontDisplay),
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: st.mainNameColor, lineHeight: '1.0',
          }}>
            {nameLine1}
            {nameLine2 && <><br />{nameLine2}</>}
          </div>
          <div style={{
            fontSize: `${st.t2SubtitleSize}px`, color: st.t2SectionTitleColor,
            fontFamily: getFontFamily(st.t2FontSubtitle ?? data.fontBody),
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginTop: '7px',
          }}>
            {data.subtitle}
          </div>
        </div>

        {/* Contact info + redes sociais — right aligned */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', flexShrink: 0 }}>
          {[
            { value: data.phone,   iconId: data.phoneIcon },
            { value: data.email,   iconId: data.emailIcon },
            { value: data.address, iconId: data.addressIcon },
          ].map(({ value, iconId }, i) => value && (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: `${st.t2ContactSize}px`, fontFamily: getFontFamily(st.t2FontContact ?? data.fontBody), color: st.mainBodyColor }}>{value}</span>
              {iconId && <PlatformIcon iconId={iconId} size={9} color={st.mainMutedColor} />}
            </div>
          ))}
          {/* Redes sociais */}
          {data.social?.map((s) => s.handle && (
            <div key={s.id || s.platform} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: `${st.t2ContactSize}px`, fontFamily: getFontFamily(st.t2FontContact ?? data.fontBody), color: st.mainBodyColor }}>{s.handle}</span>
              {s.icon && <PlatformIcon iconId={s.icon} size={9} color={st.mainMutedColor} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── RESUMO (full width) ─────────────────────────────────────────────── */}
      {data.summary && (
        <div style={{ marginBottom: '26px' }}>
          <SectionTitle>RESUMO PROFISSIONAL</SectionTitle>
          <p style={{ fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody), color: st.mainBodyColor, lineHeight: '1.7' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* ── TWO-COLUMN BODY ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '32px' }}>

        {/* LEFT: Formação + Habilidades + Prêmios */}
        <div style={{ width: '38%', flexShrink: 0 }}>

          {/* Formação */}
          {data.education?.some(e => e.degree?.trim()) && (
            <div style={{ marginBottom: '24px' }}>
              <SectionTitle>FORMAÇÃO ACADÊMICA</SectionTitle>
              {data.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '14px' }}>
                  <p style={{
                    fontWeight: '700', fontSize: `${st.t2CompanySize}px`,
                    fontFamily: getFontFamily(st.t2FontCompany ?? data.fontBody),
                    color: st.mainBodyColor, textTransform: 'uppercase',
                    lineHeight: '1.3', marginBottom: '2px',
                  }}>
                    {edu.degree}
                  </p>
                  <p style={{ fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody), color: st.mainMutedColor, lineHeight: '1.5' }}>
                    {edu.institution}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Habilidades */}
          {data.skills?.some(s => s.name?.trim()) && (
            <div style={{ marginBottom: '24px' }}>
              <SectionTitle>HABILIDADES</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {data.skills.map((skill) => (
                  <p key={skill.id} style={{ fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody), color: st.mainBodyColor, lineHeight: '1.6' }}>
                    &bull; {skill.name}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Prêmios */}
          {data.awards?.some(a => a.title?.trim()) && (
            <div style={{ marginBottom: '24px' }}>
              <SectionTitle>PRÊMIOS E CONQUISTAS</SectionTitle>
              {data.awards.map((award) => (
                <div key={award.id} style={{ marginBottom: '14px' }}>
                  <p style={{
                    fontWeight: '700', fontSize: `${st.t2CompanySize}px`,
                    fontFamily: getFontFamily(st.t2FontCompany ?? data.fontBody),
                    color: st.mainBodyColor, textTransform: 'uppercase',
                    lineHeight: '1.3', marginBottom: '2px',
                  }}>
                    {award.title}
                  </p>
                  {award.organization && (
                    <p style={{ fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody), color: st.mainBodyColor, lineHeight: '1.4' }}>
                      {award.organization}
                    </p>
                  )}
                  {award.yearLocation && (
                    <p style={{ fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody), color: st.mainMutedColor, lineHeight: '1.4' }}>
                      {award.yearLocation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Experiências */}
        <div style={{ flex: 1 }}>
          {data.experiences?.some(e => e.company?.trim() || e.role?.trim()) && (
            <div>
              <SectionTitle>EXPERIÊNCIA PROFISSIONAL</SectionTitle>
              {data.experiences.map((exp) => (
                <div key={exp.id} style={{ marginBottom: '22px' }}>
                  {/* Role shown as primary heading (job title) */}
                  <p style={{
                    fontWeight: '700', fontSize: `${st.t2CompanySize}px`,
                    fontFamily: getFontFamily(st.t2FontCompany ?? data.fontBody),
                    color: st.mainBodyColor, textTransform: 'uppercase',
                    lineHeight: '1.3', marginBottom: '2px',
                  }}>
                    {exp.role}
                  </p>
                  {/* Company shown as secondary */}
                  <p style={{
                    fontSize: `${st.t2RoleSize}px`, fontStyle: 'italic',
                    fontFamily: getFontFamily(st.t2FontRole ?? data.fontBody),
                    color: st.mainMutedColor, marginBottom: '7px', lineHeight: '1.4',
                  }}>
                    {exp.company}
                  </p>
                  {/* Optional description paragraph */}
                  {exp.description && (
                    <p style={{
                      fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody),
                      color: st.mainBodyColor,
                      lineHeight: '1.6', marginBottom: '5px',
                    }}>
                      {exp.description}
                    </p>
                  )}
                  {/* Bullets */}
                  {exp.bullets?.map((bullet, i) => (
                    <p key={i} style={{
                      fontSize: `${st.t2BodySize}px`, fontFamily: getFontFamily(st.t2FontBody ?? data.fontBody),
                      color: st.mainBodyColor,
                      marginLeft: '6px', marginBottom: '4px', lineHeight: '1.7',
                    }}>
                      &bull; {bullet}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
