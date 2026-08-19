'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { setPlainTextMode, updateBody } from '../../store'

interface ComposeEditorErrorBoundaryProps {
  draftId: string
  children: ReactNode
}

interface ComposeEditorErrorBoundaryState {
  hasError: boolean
}

class ComposeEditorErrorBoundary extends Component<
  ComposeEditorErrorBoundaryProps,
  ComposeEditorErrorBoundaryState
> {
  state: ComposeEditorErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ComposeEditorErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Compose editor failed to load', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <PlainTextComposeFallback draftId={this.props.draftId} />
    }
    return this.props.children
  }
}

interface PlainTextComposeFallbackProps {
  draftId: string
}

function PlainTextComposeFallback({ draftId }: PlainTextComposeFallbackProps) {
  const t = useTranslations('COMPOSE')
  const dispatch = useAppDispatch()
  const body = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.body ?? ''
  )

  React.useEffect(() => {
    dispatch(setPlainTextMode({ draftId, isPlainText: true }))
  }, [dispatch, draftId])

  return (
    <div className="flex h-full min-h-40 flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        {t('editor_unavailable.string')}
      </p>
      <textarea
        className="border-input bg-background min-h-0 flex-1 resize-none rounded-md border p-3 text-sm"
        value={body}
        onChange={(e) =>
          dispatch(updateBody({ draftId, body: e.target.value }))
        }
        aria-label={t('editor_unavailable_input.string')}
      />
    </div>
  )
}

export default ComposeEditorErrorBoundary
