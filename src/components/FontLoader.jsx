import { useEffect } from 'react'
import { FONTS } from '../data/fonts.js'

export default function FontLoader() {
  useEffect(() => {
    if (document.querySelector('link[data-gf-resume]')) return

    const families = FONTS
      .filter((f) => f.googleFont)
      .map((f) => `family=${f.googleFont}`)
      .join('&')

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
    link.setAttribute('data-gf-resume', '1')
    document.head.appendChild(link)
  }, [])

  return null
}
