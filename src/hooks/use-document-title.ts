'use client'

import { useEffect } from 'react'

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} · SOGo`
    return () => {
      document.title = previous
    }
  }, [title])
}
