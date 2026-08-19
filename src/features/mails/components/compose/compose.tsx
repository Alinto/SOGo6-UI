'use client'

import { createLazyImport } from '@/components/lazy-components'
import React from 'react'
import ComposeEditorErrorBoundary from './compose-editor-error-boundary'

// Loading component for the editor
const EditorLoader = () => {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border p-8">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    </div>
  )
}

const LazyComposeEditorCore = createLazyImport(
  () =>
    import('@/features/mails/components/compose/compose-editor-core').then(
      (m) => ({ default: m.ComposeEditorCore as React.ComponentType })
    ),
  <EditorLoader />
)

interface CustomEditorProps {
  draftId: string
}

const CustomEditor = ({ draftId }: CustomEditorProps) => {
  return (
    <ComposeEditorErrorBoundary draftId={draftId}>
      <LazyComposeEditorCore draftId={draftId} />
    </ComposeEditorErrorBoundary>
  )
}

export default CustomEditor
