'use client'

import { Button } from '@/components/ui/button'
import { Download, Share, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useState } from 'react'
import { isPwaEnabled } from '../flags'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'sogo_pwa_install_dismissed'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  )
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iPadOs =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || iPadOs
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Install banner. Chromium: native beforeinstallprompt flow.
 * iOS Safari (no prompt API): manual "Share → Add to Home Screen" hint.
 * Dismissal is persisted so the banner does not nag on every visit.
 */
function InstallPwaPrompt() {
  const t = useTranslations('PWA')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  )
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (!isPwaEnabled() || isStandalone()) return
    let cancelled = false

    // Deferred so the first client render matches the SSR output
    // (dismissed=true → nothing rendered), avoiding hydration mismatches.
    queueMicrotask(() => {
      if (cancelled) return
      setDismissed(readDismissed())
      if (isIos()) setShowIosHint(true)
    })

    if (isIos()) {
      return () => {
        cancelled = true
      }
    }

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => {
      cancelled = true
      window.removeEventListener('beforeinstallprompt', onBip)
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // storage unavailable — session-only dismissal
    }
  }

  if (!isPwaEnabled() || dismissed) return null

  if (showIosHint) {
    return (
      <div className="bg-muted flex items-center justify-between gap-2 px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <Share className="size-4 shrink-0" aria-hidden />
          {t('install_ios_hint.string')}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={t('install_dismiss.string')}
          onClick={dismiss}
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
    )
  }

  if (!deferred) return null

  return (
    <div className="bg-muted flex items-center justify-between gap-2 px-3 py-2 text-sm">
      <span>{t('install_prompt.string')}</span>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
          {t('install_dismiss.string')}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={async () => {
            await deferred.prompt()
            setDeferred(null)
          }}
        >
          <Download className="mr-1 size-4" aria-hidden />
          {t('install_action.string')}
        </Button>
      </div>
    </div>
  )
}

export default memo(InstallPwaPrompt)
