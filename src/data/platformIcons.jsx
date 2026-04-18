import { useEffect, useRef, useState } from 'react'
import { Mail, Phone, MapPin, Globe, Link2 } from 'lucide-react'
import {
  siInstagram, siFacebook, siX, siYoutube, siTiktok,
  siWhatsapp, siTelegram, siGithub, siBehance, siDribbble,
  siPinterest, siDiscord, siTwitch, siSnapchat, siThreads,
} from 'simple-icons'

// LinkedIn was removed from simple-icons v16; path taken from the official brand kit
const LINKEDIN_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

export const ICON_REGISTRY = {
  // ── Geral / contato ──────────────────────────────────────────────────────────
  mail:      { label: 'E-mail',      group: 'geral',  type: 'lucide', Component: Mail },
  phone:     { label: 'Telefone',    group: 'geral',  type: 'lucide', Component: Phone },
  mappin:    { label: 'Endereço',    group: 'geral',  type: 'lucide', Component: MapPin },
  globe:     { label: 'Website',     group: 'geral',  type: 'lucide', Component: Globe },
  link:      { label: 'Link',        group: 'geral',  type: 'lucide', Component: Link2 },
  // ── Redes sociais ────────────────────────────────────────────────────────────
  linkedin:  { label: 'LinkedIn',    group: 'social', type: 'svg', path: LINKEDIN_PATH },
  instagram: { label: 'Instagram',   group: 'social', type: 'svg', path: siInstagram.path },
  facebook:  { label: 'Facebook',    group: 'social', type: 'svg', path: siFacebook.path },
  x:         { label: 'X / Twitter', group: 'social', type: 'svg', path: siX.path },
  youtube:   { label: 'YouTube',     group: 'social', type: 'svg', path: siYoutube.path },
  tiktok:    { label: 'TikTok',      group: 'social', type: 'svg', path: siTiktok.path },
  whatsapp:  { label: 'WhatsApp',    group: 'social', type: 'svg', path: siWhatsapp.path },
  telegram:  { label: 'Telegram',    group: 'social', type: 'svg', path: siTelegram.path },
  github:    { label: 'GitHub',      group: 'social', type: 'svg', path: siGithub.path },
  discord:   { label: 'Discord',     group: 'social', type: 'svg', path: siDiscord.path },
  twitch:    { label: 'Twitch',      group: 'social', type: 'svg', path: siTwitch.path },
  pinterest: { label: 'Pinterest',   group: 'social', type: 'svg', path: siPinterest.path },
  behance:   { label: 'Behance',     group: 'social', type: 'svg', path: siBehance.path },
  dribbble:  { label: 'Dribbble',    group: 'social', type: 'svg', path: siDribbble.path },
  snapchat:  { label: 'Snapchat',    group: 'social', type: 'svg', path: siSnapchat.path },
  threads:   { label: 'Threads',     group: 'social', type: 'svg', path: siThreads.path },
}

export const ICON_GROUPS = {
  geral:  Object.entries(ICON_REGISTRY).filter(([, v]) => v.group === 'geral').map(([id, v]) => ({ id, ...v })),
  social: Object.entries(ICON_REGISTRY).filter(([, v]) => v.group === 'social').map(([id, v]) => ({ id, ...v })),
}

// ── Renderizador ──────────────────────────────────────────────────────────────
export function PlatformIcon({ iconId, size = 11, color = '#9ca3af', style: extraStyle }) {
  if (!iconId) return null
  const def = ICON_REGISTRY[iconId]
  if (!def) return null

  if (def.type === 'lucide') {
    const { Component } = def
    return <Component size={size} color={color} style={{ flexShrink: 0, ...extraStyle }} />
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, ...extraStyle }}>
      <path d={def.path} />
    </svg>
  )
}

// ── Seletor de ícone ─────────────────────────────────────────────────────────
export function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={value ? (ICON_REGISTRY[value]?.label ?? value) : 'Sem ícone'}
        className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors ${
          open ? 'border-gray-600 bg-gray-50' : 'border-gray-200 hover:border-gray-400 bg-white'
        }`}
      >
        {value
          ? <PlatformIcon iconId={value} size={14} color="#374151" />
          : <span className="text-gray-300 text-xs font-bold leading-none select-none">—</span>
        }
      </button>

      {open && (
        <div
          className="absolute z-30 bg-white border border-gray-200 rounded-xl shadow-xl"
          style={{ top: 'calc(100% + 4px)', right: 0, width: '216px', padding: '10px' }}
        >
          {/* Sem ícone */}
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false) }}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 mb-2 transition-colors ${
              !value ? 'bg-gray-100 font-semibold text-gray-600' : 'text-gray-400'
            }`}
          >
            Sem ícone
          </button>

          {/* Geral */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-1.5">Geral</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {ICON_GROUPS.geral.map(({ id, label }) => (
              <button
                key={id} type="button" title={label}
                onClick={() => { onChange(id); setOpen(false) }}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
                  value === id ? 'bg-gray-200 ring-1 ring-gray-500' : ''
                }`}
              >
                <PlatformIcon iconId={id} size={14} color="#374151" />
              </button>
            ))}
          </div>

          {/* Redes sociais */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-1.5">Redes Sociais</p>
          <div className="flex flex-wrap gap-1">
            {ICON_GROUPS.social.map(({ id, label }) => (
              <button
                key={id} type="button" title={label}
                onClick={() => { onChange(id); setOpen(false) }}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
                  value === id ? 'bg-gray-200 ring-1 ring-gray-500' : ''
                }`}
              >
                <PlatformIcon iconId={id} size={14} color="#374151" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
