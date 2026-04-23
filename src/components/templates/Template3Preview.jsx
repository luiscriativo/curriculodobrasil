import { PlatformIcon } from '../../data/platformIcons.jsx'
import { getFontFamily } from '../../data/fonts.js'

const DEFAULT = {
  mainBg:              '#F0F0F0',
  t3SidebarBg:         '#F5F5F5',
  t3SidebarTextColor:  '#3d3d3d',
  t3SidebarNameColor:  '#1a1a1a',
  t3SidebarSubColor:   '#6b6b6b',
  t3SectionTitleColor: '#1a1a1a',
  t3JobTitleColor:     '#1a1a1a',
  t3CompanyColor:      '#6b7280',
  t3BodyColor:         '#3d3d3d',
  t3DateColor:         '#6b7280',
  t3AccentBarColor:      '#858587',
  t3BottomBarLeftColor:  '#ACABB0',
  t3BottomBarRightColor: '#858587',
  // Fontes
  t3FontName:          'fjalla',
  t3FontSubtitle:      'poppins',
  t3FontSectionTitle:  'inter',
  t3FontBody:          'lato',
  t3FontCompany:       'lato',
  t3FontRole:          'lato',
  // Tamanhos
  t3Master:            9,
  t3AccentBarHeight:   8,
  t3PhotoHeight:       310,
  t3NameSize:          37,
  t3SubtitleSize:      11.5,
  t3SectionTitleSize:  17,
  t3JobTitleSize:      14.5,
  t3BodySize:          14,
  t3DateSize:          13.5,
  t3ContactSize:       11.5,
  t3SocialSize:        11.5,
}

export default function Template3Preview({ data, id = 'resume-preview' }) {
  const st = { ...DEFAULT, ...data.style }

  return (
    <div id={id} style={{
      width: '210mm', minHeight: '297mm',
      fontFamily: getFontFamily(data.fontBody),
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    }}>

      {/* ── TOP ACCENT BAR ────────────────────────────────────────────────────── */}
      <div style={{
        width: '100%',
        height: `${st.t3AccentBarHeight ?? 7}px`,
        backgroundColor: st.t3AccentBarColor ?? st.t3TopBarColor ?? '#1a1a1a',
        flexShrink: 0,
      }} />

      {/* ── BODY (sidebar + main) ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
        <div style={{
          width: '35%', flexShrink: 0,
          backgroundColor: st.t3SidebarBg,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Tudo dentro de um único container com padding uniforme */}
          <div style={{
            padding: '56px 40px 22px',
            flex: 1, display: 'flex', flexDirection: 'column',
          }}>

          {/* Foto portrait (dentro do padding) */}
          {!data.photoHidden && (
            <div style={{
              width: '100%', height: `${st.t3PhotoHeight}px`,
              overflow: 'hidden', flexShrink: 0,
              marginBottom: '14px',
            }}>
              {data.photo ? (
                <img
                  src={data.photo}
                  alt="Foto de perfil"
                  draggable={false}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    objectPosition: `${data.photoX ?? 50}% ${data.photoY ?? 50}%`,
                    transform: `scale(${(data.photoScale ?? 100) / 100})`,
                    transformOrigin: `${data.photoX ?? 50}% ${data.photoY ?? 50}%`,
                    display: 'block',
                    filter: data.photoGrayscale ? 'grayscale(1)' : 'none',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  backgroundColor: '#b0b0b0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#888', fontSize: '9px', textAlign: 'center', lineHeight: '1.4',
                }}>
                  Adicionar<br />Foto
                </div>
              )}
            </div>
          )}

            {/* Nome */}
            <div style={{
              fontFamily: getFontFamily(st.t3FontName ?? data.fontDisplay),
              fontSize: `${st.t3NameSize}px`,
              fontWeight: '700',
              color: st.t3SidebarNameColor,
              lineHeight: '1.2',
              marginBottom: '6px',
            }}>
              {(data.name || '').split(' ').reduce((acc, word, i, arr) => {
                if (i === Math.ceil(arr.length / 2)) acc.push(<br key={`br-${i}`} />)
                acc.push(word + (i < arr.length - 1 && i !== Math.ceil(arr.length / 2) - 1 ? ' ' : ''))
                return acc
              }, [])}
            </div>

            {/* Subtítulo */}
            {data.subtitle && (
              <div style={{
                fontFamily: getFontFamily(st.t3FontSubtitle ?? st.t3FontName ?? data.fontDisplay),
                fontSize: `${st.t3SubtitleSize}px`,
                fontStyle: 'italic',
                fontWeight: '400',
                color: st.t3SidebarSubColor,
                lineHeight: '1.5',
                marginBottom: '14px',
              }}>
                {data.subtitle}
              </div>
            )}

            {/* Resumo */}
            {data.summary && (
              <p style={{
                fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                fontSize: `${st.t3BodySize}px`,
                color: st.t3SidebarTextColor,
                lineHeight: '1.7',
                marginBottom: '14px',
              }}>
                {data.summary}
              </p>
            )}

            <div style={{ flex: 1 }} />

            {/* Contato */}
            {(data.address || data.phone || data.email) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                {[
                  { value: data.address, iconId: data.addressIcon },
                  { value: data.phone,   iconId: data.phoneIcon },
                  { value: data.email,   iconId: data.emailIcon },
                ].map(({ value, iconId }, i) => value && (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {iconId && (
                      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <PlatformIcon iconId={iconId} size={st.t3ContactSize ?? 10} color={st.t3SidebarSubColor} />
                      </span>
                    )}
                    <span style={{
                      fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                      fontSize: `${st.t3ContactSize}px`,
                      color: st.t3SidebarTextColor,
                      lineHeight: '1.4',
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Redes sociais */}
            {data.social?.some(s => /[a-zA-Z0-9]/.test(s.handle ?? '')) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {data.social.filter(s => /[a-zA-Z0-9]/.test(s.handle ?? '')).map((s) => (
                  <div key={s.id || s.platform} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {s.icon && (
                      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <PlatformIcon iconId={s.icon} size={st.t3SocialSize ?? 10} color={st.t3SidebarSubColor} />
                      </span>
                    )}
                    <span style={{
                      fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                      fontSize: `${st.t3SocialSize}px`,
                      color: st.t3SidebarTextColor,
                      lineHeight: '1.4',
                    }}>
                      {s.platform ? `${s.platform}: ` : ''}{s.handle}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>{/* fim padding container */}
        </div>{/* fim sidebar */}

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          backgroundColor: st.mainBg,
          padding: '28px 28px 28px 28px',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Experiências */}
          {data.experiences?.some(e => e.company?.trim() || e.role?.trim()) && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontFamily: getFontFamily(st.t3FontSectionTitle ?? data.fontDisplay),
                fontSize: `${st.t3SectionTitleSize}px`,
                fontWeight: '700',
                color: st.t3SectionTitleColor,
                marginBottom: '12px',
                lineHeight: '1.1',
                letterSpacing: '-0.01em',
              }}>
                Experiências
              </h2>

              {data.experiences.map((exp, i) => (
                <div key={exp.id} style={{ marginBottom: i < data.experiences.length - 1 ? '14px' : 0 }}>
                  {/* Cargo + Empresa na mesma linha */}
                  <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      fontFamily: getFontFamily(st.t3FontCompany ?? data.fontBody),
                      fontSize: `${st.t3JobTitleSize}px`,
                      fontWeight: '700',
                      color: st.t3JobTitleColor,
                    }}>
                      {exp.role}
                    </span>
                    {exp.company && (
                      <span style={{
                        fontFamily: getFontFamily(st.t3FontCompany ?? data.fontBody),
                        fontSize: `${st.t3DateSize}px`,
                        color: st.t3CompanyColor,
                      }}>
                        {exp.company}
                      </span>
                    )}
                  </div>
                  {/* Período (description em itálico) */}
                  {exp.description && (
                    <p style={{
                      fontFamily: getFontFamily(st.t3FontRole ?? data.fontBody),
                      fontSize: `${st.t3DateSize}px`,
                      fontStyle: 'italic',
                      color: st.t3DateColor,
                      marginTop: '2px', marginBottom: '4px',
                      lineHeight: '1.4',
                    }}>
                      {exp.description}
                    </p>
                  )}
                  {/* Bullets como parágrafos */}
                  {exp.bullets?.filter(b => b).map((bullet, j) => (
                    <p key={j} style={{
                      fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                      fontSize: `${st.t3BodySize}px`,
                      color: st.t3BodyColor,
                      lineHeight: '1.65',
                      marginTop: j === 0 && !exp.description ? '3px' : '2px',
                    }}>
                      {bullet}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Formação */}
          {data.education?.some(e => e.degree?.trim()) && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontFamily: getFontFamily(st.t3FontSectionTitle ?? data.fontDisplay),
                fontSize: `${st.t3SectionTitleSize}px`,
                fontWeight: '700',
                color: st.t3SectionTitleColor,
                marginBottom: '12px',
                lineHeight: '1.1',
                letterSpacing: '-0.01em',
              }}>
                Formação
              </h2>
              {data.education.map((edu, i) => (
                <div key={edu.id} style={{ marginBottom: i < data.education.length - 1 ? '12px' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      fontFamily: getFontFamily(st.t3FontCompany ?? data.fontBody),
                      fontSize: `${st.t3JobTitleSize}px`,
                      fontWeight: '700',
                      color: st.t3JobTitleColor,
                    }}>
                      {edu.degree}
                    </span>
                    {edu.institution && (
                      <span style={{
                        fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                        fontSize: `${st.t3DateSize}px`,
                        color: st.t3CompanyColor,
                      }}>
                        {edu.institution}
                      </span>
                    )}
                  </div>
                  {edu.description && (
                    <p style={{
                      fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                      fontSize: `${st.t3DateSize}px`,
                      color: st.t3BodyColor,
                      lineHeight: '1.65',
                      marginTop: '4px',
                    }}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Habilidades + Referências — duas colunas no rodapé */}
          {(data.skills?.some(s => s.name?.trim()) || data.references?.some(r => r.name?.trim())) && (
            <div style={{ display: 'flex', gap: '24px', marginTop: 'auto', paddingTop: '8px' }}>

              {data.skills?.some(s => s.name?.trim()) && (
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: getFontFamily(st.t3FontSectionTitle ?? data.fontDisplay),
                    fontSize: `${st.t3SectionTitleSize}px`,
                    fontWeight: '700',
                    color: st.t3SectionTitleColor,
                    marginBottom: '10px',
                    lineHeight: '1.1',
                    letterSpacing: '-0.01em',
                  }}>
                    Habilidades
                  </h2>
                  {data.skills.map((skill) => (
                    <p key={skill.id} style={{
                      fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                      fontSize: `${st.t3BodySize}px`,
                      color: st.t3BodyColor,
                      lineHeight: '1.9',
                    }}>
                      {skill.name}
                    </p>
                  ))}
                </div>
              )}

              {data.references?.some(r => r.name?.trim()) && (
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: getFontFamily(st.t3FontSectionTitle ?? data.fontDisplay),
                    fontSize: `${st.t3SectionTitleSize}px`,
                    fontWeight: '700',
                    color: st.t3SectionTitleColor,
                    marginBottom: '10px',
                    lineHeight: '1.1',
                    letterSpacing: '-0.01em',
                  }}>
                    Referências
                  </h2>
                  {data.references.map((ref) => (
                    <div key={ref.id} style={{ marginBottom: '12px' }}>
                      <p style={{
                        fontFamily: getFontFamily(st.t3FontCompany ?? data.fontBody),
                        fontSize: `${st.t3BodySize}px`,
                        fontWeight: '700',
                        color: st.t3JobTitleColor,
                        lineHeight: '1.4',
                      }}>
                        {ref.name}
                      </p>
                      {ref.title && (
                        <p style={{
                          fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                          fontSize: `${st.t3BodySize}px`,
                          fontStyle: 'italic',
                          color: st.t3BodyColor,
                          lineHeight: '1.4',
                        }}>
                          {ref.title}
                        </p>
                      )}
                      {ref.location && (
                        <p style={{
                          fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                          fontSize: `${st.t3BodySize}px`,
                          color: st.t3CompanyColor,
                          lineHeight: '1.4',
                        }}>
                          {ref.location}
                        </p>
                      )}
                      {ref.email && (
                        <p style={{
                          fontFamily: getFontFamily(st.t3FontBody ?? data.fontBody),
                          fontSize: `${st.t3BodySize}px`,
                          color: st.t3CompanyColor,
                          lineHeight: '1.4',
                        }}>
                          {ref.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ACCENT BAR (duas cores) ────────────────────────────────────── */}
      <div style={{ width: '100%', height: `${st.t3AccentBarHeight ?? 7}px`, display: 'flex', flexShrink: 0 }}>
        <div style={{ width: '35%', height: '100%', backgroundColor: st.t3BottomBarLeftColor ?? '#e0e0e2' }} />
        <div style={{ width: '65%', height: '100%', backgroundColor: st.t3BottomBarRightColor ?? '#1a1a1a' }} />
      </div>
    </div>
  )
}
