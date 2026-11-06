'use client'

import { useLayoutEffect, useRef } from 'react'

type TitleEntry = { id: number; title: string; priority: number }

let nextId = 0
let baseTitle: string | null = null
const entries: TitleEntry[] = []

function winningTitle(): string | null {
  let best: TitleEntry | null = null
  for (const entry of entries) {
    if (
      !best ||
      entry.priority > best.priority ||
      (entry.priority === best.priority && entry.id > best.id)
    ) {
      best = entry
    }
  }
  return best?.title ?? null
}

function applyTitle() {
  const next = winningTitle()
  if (!next) {
    if (baseTitle != null) {
      document.title = baseTitle
      baseTitle = null
    }
    return
  }
  if (baseTitle == null) baseTitle = document.title
  document.title = next
}

function removeEntry(id: number) {
  const index = entries.findIndex((entry) => entry.id === id)
  if (index >= 0) entries.splice(index, 1)
}

/**
 * Sets `document.title` to `title · SOGo`.
 * Several callers can be mounted together (folder layout and open message).
 * The highest `priority` wins; unmounting it restores the previous one.
 */
export function useDocumentTitle(
  title: string | null | undefined,
  priority = 0
) {
  const idRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!title) {
      if (idRef.current != null) {
        removeEntry(idRef.current)
        idRef.current = null
        applyTitle()
      }
      return
    }

    const formatted = `${title} · SOGo`
    if (idRef.current == null) {
      idRef.current = ++nextId
      entries.push({ id: idRef.current, title: formatted, priority })
    } else {
      const entry = entries.find((item) => item.id === idRef.current)
      if (entry) {
        entry.title = formatted
        entry.priority = priority
      } else {
        entries.push({ id: idRef.current, title: formatted, priority })
      }
    }
    applyTitle()

    const id = idRef.current
    return () => {
      removeEntry(id)
      if (idRef.current === id) idRef.current = null
      applyTitle()
    }
  }, [title, priority])
}
