import { MapPin, Mail, Phone } from 'lucide-react'

const DEFAULT = {
  sidebarBg: '#E8E4DC', sidebarTitleColor: '#2d2d2d',
  sidebarItemTitleColor: '#2d2d2d', sidebarItemSubColor: '#6b7280',
  sidebarSectionTitleSize: 7, sidebarItemTitleSize: 9, sidebarItemSubSize: 8,
  mainBg: '#FFFFFF', mainNameColor: '#2d2d2d',
  mainSectionTitleColor: '#2d2d2d', mainBodyColor: '#374151', mainMutedColor: '#6b7280',
  mainNameSize: 26, mainSubtitleSize: 10, mainContactSize: 10,
  mainSectionTitleSize: 9, mainBodySize: 10, mainCompanySize: 11, mainRoleSize: 10,
}

export default function ResumePreview({ data, id = 'resume-preview' }) {
  const st = { ...DEFAULT, ...data.style }

  const SidebarSection = ({ title, children }) => (
    <div style={{ width: '100%', marginBottom: '14px' }}>
      <h3 style={{
        fontSize: `${st.sidebarSectionTitleSize}px`, letterSpacing: '0.15em',
        fontWeight: '700', textTransform: 'uppercase',
        color: st.sidebarTitleColor, marginBottom: '4px',
      }}>
        {title}
      </h3>
      <div style={{ borderBottom: `1px solid ${st.sidebarItemSubColor}66`, marginBottom: '10px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  )

  const MainSection = ({ title, children }) => (
    <div style={{ marginBottom: `${st.mainBodySize * 2}px` }}>
      <h2 style={{
        fontSize: `${st.mainSectionTitleSize}px`, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: st.mainSectionTitleColor,
        borderBottom: `0.5px solid ${st.mainMutedColor}44`,
        paddingBottom: '4px', marginBottom: '10px',
      }}>
        {title}
      </h2>
      <div>{children}</div>
    </div>
  )

  return (
    <div id={id} style={{
      width: '210mm', minHeight: '297mm',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      display: 'flex', boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div style={{
        width: '35%', backgroundColor: st.sidebarBg,
        padding: '32px 20px', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ marginBottom: '24px' }}>
          {(() => {
            const size = `${data.photoSize ?? 100}px`
            const border = `2px solid ${data.photoBorderColor ?? st.sidebarItemSubColor}`
            return data.photo ? (
              <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border, flexShrink: 0 }}>
                <img src={data.photo} alt="Foto de perfil" draggable={false} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  objectPosition: `${data.photoX ?? 50}% ${data.photoY ?? 50}%`,
                  transform: `scale(${(data.photoScale ?? 100) / 100})`,
                  transformOrigin: `${data.photoX ?? 50}% ${data.photoY ?? 50}%`,
                  display: 'block', pointerEvents: 'none',
                }} />
              </div>
            ) : (
              <div style={{
                width: size, height: size, borderRadius: '50%',
                backgroundColor: `${st.sidebarItemSubColor}22`,
                border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: st.sidebarItemSubColor, fontSize: '10px',
                textAlign: 'center', lineHeight: '1.3',
              }}>
                Adicionar<br />Foto
              </div>
            )
          })()}
        </div>

        <SidebarSection title="SOCIAL">
          {data.social.map((s) => (
            <div key={s.id || s.platform}>
              <p style={{ fontWeight: '700', fontSize: `${st.sidebarItemTitleSize}px`, color: st.sidebarItemTitleColor, marginBottom: '1px' }}>{s.platform}</p>
              <p style={{ fontSize: `${st.sidebarItemSubSize}px`, color: st.sidebarItemSubColor }}>{s.handle}</p>
            </div>
          ))}
        </SidebarSection>

        <SidebarSection title="FORMAÇÃO ACADÊMICA">
          {data.education.map((e) => (
            <div key={e.id} style={{ marginBottom: '6px' }}>
              <p style={{ fontWeight: '700', fontSize: `${st.sidebarItemTitleSize}px`, color: st.sidebarItemTitleColor, lineHeight: '1.4', marginBottom: '2px' }}>{e.degree}</p>
              <p style={{ fontSize: `${st.sidebarItemSubSize}px`, color: st.sidebarItemSubColor, fontStyle: 'italic' }}>{e.institution}</p>
            </div>
          ))}
        </SidebarSection>

        <SidebarSection title="ESPECIALIZAÇÕES">
          {data.specializations.map((s) => (
            <div key={s.id} style={{ marginBottom: '6px' }}>
              <p style={{ fontWeight: '700', fontSize: `${st.sidebarItemTitleSize}px`, color: st.sidebarItemTitleColor, marginBottom: '1px' }}>{s.name}</p>
              <p style={{ fontSize: `${st.sidebarItemSubSize}px`, color: st.sidebarItemSubColor, fontStyle: 'italic' }}>{s.institution}</p>
            </div>
          ))}
        </SidebarSection>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <div style={{
        width: '65%', padding: '36px 32px', backgroundColor: st.mainBg,
        display: 'flex', flexDirection: 'column',
      }}>
        <h1 style={{ fontSize: `${st.mainNameSize}px`, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: st.mainNameColor, marginBottom: '4px', lineHeight: '1.1' }}>
          {data.name}
        </h1>
        <p style={{ fontSize: `${st.mainSubtitleSize}px`, color: st.mainMutedColor, marginBottom: '16px', lineHeight: '1.5' }}>
          {data.subtitle}
        </p>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={9} color={st.mainMutedColor} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: `${st.mainContactSize}px`, color: st.mainBodyColor }}>{data.address}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={9} color={st.mainMutedColor} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: `${st.mainContactSize}px`, color: st.mainBodyColor }}>{data.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={9} color={st.mainMutedColor} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: `${st.mainContactSize}px`, color: st.mainBodyColor }}>{data.phone}</span>
          </div>
        </div>

        <MainSection title="RESUMO PROFISSIONAL">
          <p style={{ fontSize: `${st.mainBodySize}px`, color: st.mainBodyColor, lineHeight: '1.7' }}>{data.summary}</p>
        </MainSection>

        <MainSection title="EXPERIÊNCIAS DE TRABALHO">
          {data.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: '700', fontSize: `${st.mainCompanySize}px`, color: st.mainBodyColor, marginBottom: '2px' }}>{exp.company}</p>
              <p style={{ fontSize: `${st.mainRoleSize}px`, fontStyle: 'italic', color: st.mainMutedColor, marginBottom: '6px' }}>{exp.role}</p>
              {exp.bullets.map((bullet, i) => (
                <p key={i} style={{ fontSize: `${st.mainBodySize}px`, color: st.mainBodyColor, marginLeft: '8px', marginBottom: '3px', lineHeight: '1.6' }}>
                  &bull; {bullet}
                </p>
              ))}
            </div>
          ))}
        </MainSection>
      </div>
    </div>
  )
}
