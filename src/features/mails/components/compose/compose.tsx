// components/custom-editor.js
'use client' // Required only in App Router.

import { createLazyImport } from '@/components/lazy-components'

// Loading component for the editor
const EditorLoader = () => {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border p-8">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    </div>
  )
}

// Lazy load the entire CKEditor component
const LazyCustomEditor = createLazyImport(
  () => import('@/features/mails/components/compose/editor-core'),
  <EditorLoader />
)

const CustomEditor = () => {
  return <LazyCustomEditor />
}

export default CustomEditor
