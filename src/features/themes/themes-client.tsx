'use client'

import { useEffect } from 'react'

interface ThemesClientProps {
  themes: string | null
}

export function ThemesClient({ themes }: ThemesClientProps) {
  useEffect(() => {
    // Inject CSS string into the document
    if (themes) {
      let styleTag = document.getElementById('dynamic-theme')
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = 'dynamic-theme'
        document.head.appendChild(styleTag)
      }
      styleTag.innerHTML = themes
    }
  }, [themes])

  return null
}
