// compose-editor-core.tsx — full file
'use client'

import { useProfile } from '@/features/user-profile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Alignment,
  AutoImage,
  AutoLink,
  Autoformat,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  ClassicEditor,
  CloudServices,
  Code,
  CodeBlock,
  Emoji,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersEssentials,
  SpecialCharactersMathematical,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import { useLocale } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  setPendingInsert,
  updateBody,
  updateSelectedSignatureKey,
} from '../../store/mail-compose-slice'
import { PlainTextModePlugin } from './plain-text-mode-plugin'
import { SignatureWidget } from './signature-widget'

const EDITOR_PLUGINS = [
  Alignment,
  AutoImage,
  AutoLink,
  Autoformat,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  Emoji,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersEssentials,
  SpecialCharactersMathematical,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo,
  SignatureWidget,
  PlainTextModePlugin,
]

export interface ComposeEditorCoreProps {
  draftId: string
  data?: string
  onChange?: (content: string) => void
}

export const ComposeEditorCore = ({
  draftId,
  data: propData,
  onChange: propOnChange,
}: ComposeEditorCoreProps) => {
  const locale = useLocale()
  const editorRef = useRef<ClassicEditor | null>(null)
  const dispatch = useAppDispatch()

  const { preferences } = useProfile()

  const USER_MAIL_GENERAL_SETTINGS = preferences?.USER_MAIL_GENERAL_SETTINGS
  const isHtmlMode =
    USER_MAIL_GENERAL_SETTINGS?.SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT !== 'text'

  const pendingInsert = useAppSelector(
    (state) => state.mailCompose.pendingInsert
  )
  const draftBody = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.body ?? ''
  )
  const selectedIdentity = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.selectedIdentity ?? null
  )
  const selectedSignatureKey = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.selectedSignatureKey ?? null
  )

  const data = propData !== undefined ? propData : draftBody

  // ── Refs that mirror the latest prop/state values ──────────────────────────
  // Updated in a single effect (not during render) to satisfy React's ref rules.
  const identityRef = useRef(selectedIdentity)
  const signatureKeyRef = useRef(selectedSignatureKey)
  const draftIdRef = useRef(draftId)
  const isHtmlModeRef = useRef(isHtmlMode)
  const isApplyingSignatureRef = useRef(false)

  useEffect(() => {
    identityRef.current = selectedIdentity
    signatureKeyRef.current = selectedSignatureKey
    draftIdRef.current = draftId
    isHtmlModeRef.current = isHtmlMode
  }, [selectedIdentity, selectedSignatureKey, draftId, isHtmlMode])

  // ── Stable ref that always points to the latest applySignature function ────
  // useCallback deps: only dispatch (stable). All other values are read through
  // refs inside the function, so no stale-closure risk and no unnecessary
  // re-creation across renders.
  const applySignatureRef = useRef<(editor: ClassicEditor) => void>(null!)

  const applySignature = useCallback(
    (editor: ClassicEditor) => {
      const identity = identityRef.current
      const signatureKey = signatureKeyRef.current

      if (!identity) return

      const signatures = identity.signatures as Record<string, string>
      if (!signatures) return

      let plainTextPlugin: PlainTextModePlugin | null = null
      try {
        plainTextPlugin = editor.plugins.get(
          PlainTextModePlugin
        ) as PlainTextModePlugin
      } catch {
        // plugin not available
      }

      const isPlainText = plainTextPlugin?.isPlainText ?? !isHtmlModeRef.current
      const rawContent =
        signatureKey !== null ? (signatures[signatureKey] ?? '') : ''
      const content =
        isPlainText && plainTextPlugin
          ? plainTextPlugin.stripHtml(rawContent)
          : rawContent

      isApplyingSignatureRef.current = true

      editor.model.change((writer) => {
        const root = editor.model.document.getRoot()
        if (!root) return

        // Search for existing signature widget (HTML mode)
        const existing = Array.from(root.getChildren()).find((n) =>
          n.is('element', 'signature')
        )

        if (isPlainText) {
          // Plain text mode: remove HTML widget if present
          if (existing) {
            writer.remove(existing)
          }

          // Remove all existing signature marker paragraphs
          const children = Array.from(root.getChildren())
          for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i]
            if (
              typeof child.getAttribute === 'function' &&
              child.getAttribute('data-signature-marker') === 'true'
            ) {
              writer.remove(child)
            }
          }

          // Insert new signature as plain text marker paragraphs
          // (if signatureKey is null, markers were removed above — no signature shown)
          if (signatureKey !== null && content) {
            const lines = content.split('\n')

            const pSeparator = writer.createElement('paragraph', {
              'data-signature-marker': 'true',
            })
            writer.insertText('--', pSeparator)
            writer.append(pSeparator, root)

            for (let i = 0; i < lines.length; i++) {
              const pLine = writer.createElement('paragraph', {
                'data-signature-marker': 'true',
              })
              writer.insertText(lines[i], pLine)
              writer.append(pLine, root)
            }
          }
        } else {
          // HTML mode: remove plain text marker paragraphs
          // (handles switching back from plain text to HTML)
          const children = Array.from(root.getChildren())
          for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i]
            if (
              typeof child.getAttribute === 'function' &&
              child.getAttribute('data-signature-marker') === 'true'
            ) {
              writer.remove(child)
            }
          }

          if (signatureKey === null) {
            if (existing) writer.remove(existing)
          } else {
            const identitySignatures = JSON.stringify(signatures)
            if (existing) {
              writer.setAttribute('data-content', content, existing)
              writer.setAttribute('data-selected-key', signatureKey, existing)
              writer.setAttribute(
                'data-signatures',
                identitySignatures,
                existing
              )
              // writer.move expects (ModelRange, ModelPosition)
              if (existing.nextSibling) {
                writer.move(
                  writer.createRangeOn(existing),
                  writer.createPositionAt(root, 'end')
                )
              }
            } else {
              const el = writer.createElement('signature', {
                'data-content': content,
                'data-selected-key': signatureKey,
                'data-signatures': identitySignatures,
              })
              writer.append(el, root)
            }
          }
        }
      })

      queueMicrotask(() => {
        isApplyingSignatureRef.current = false
      })
    },
    [dispatch]
  )

  // Keep the ref in sync with the memoised function.
  // In practice this only runs at mount because dispatch is stable.
  useEffect(() => {
    applySignatureRef.current = applySignature
  }, [applySignature])

  const config = useMemo(
    () => ({
      licenseKey: 'GPL',
      plugins: EDITOR_PLUGINS,
      image: {
        toolbar: [
          'imageTextAlternative',
          'toggleImageCaption',
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
        ],
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
        ],
      },
      language: locale,
      toolbar: {
        items: [
          'undo',
          'redo',
          'heading',
          'showBlocks',
          '|',
          'bold',
          'italic',
          'underline',
          'fontColor',
          'fontBackgroundColor',
          'fontFamily',
          'fontSize',
          'removeFormat',
          'horizontalLine',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'outdent',
          'indent',
          'alignment',
          '|',
          'link',
          'blockQuote',
          '|',
          'emoji',
          'imageUpload',
          'specialCharacters',
          'insertTable',
          'mediaEmbed',
          '|',
          'sourceEditing',
          '|',
          'plainTextMode',
        ],
      },
    }),
    [locale]
  )

  const handleReady = useCallback(
    (editor: ClassicEditor) => {
      editorRef.current = editor

      const plainTextPlugin = editor.plugins.get(
        PlainTextModePlugin
      ) as PlainTextModePlugin

      plainTextPlugin.setInitialState(!isHtmlModeRef.current)

      // Insert initial signature (if any)
      applySignatureRef.current(editor)

      // If plain text mode is forced from settings, convert the body and
      // re-place the signature via the unified path (applySignatureRef).
      if (!isHtmlModeRef.current) {
        plainTextPlugin.applyPlainText()
      }

      // Watch for manual widget / marker deletion
      const changeHandler = () => {
        if (isApplyingSignatureRef.current) return

        const root = editor.model.document.getRoot()
        if (!root) return

        const hasSignature = Array.from(root.getChildren()).some(
          (n) =>
            n.is('element', 'signature') ||
            (typeof n.getAttribute === 'function' &&
              n.getAttribute('data-signature-marker') === 'true')
        )

        if (!hasSignature && signatureKeyRef.current !== null) {
          const currentDraftId = draftIdRef.current
          if (currentDraftId) {
            dispatch(
              updateSelectedSignatureKey({ draftId: currentDraftId, key: null })
            )
          }
        }
      }

      editor.model.document.on('change:data', changeHandler)
      editor.on('destroy', () => {
        editor.model.document.off('change:data', changeHandler)
      })
    },
    [dispatch]
  )

  const handleChange = useCallback(
    (_event: unknown, editor: ClassicEditor) => {
      const content = editor.getData()
      propOnChange?.(content)
      if (propOnChange === undefined) {
        dispatch(updateBody({ draftId, body: content }))
      }
    },
    [propOnChange, draftId, dispatch]
  )

  useEffect(() => {
    return () => {
      editorRef.current = null
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !pendingInsert) return

    const viewFragment = editor.data.processor.toView(pendingInsert)
    const modelFragment = editor.data.toModel(viewFragment)

    editor.model.change((writer) => {
      const root = editor.model.document.getRoot()
      if (!root) return

      const signatureNode = Array.from(root.getChildren()).find(
        (n) =>
          n.is('element', 'signature') ||
          (typeof n.getAttribute === 'function' &&
            n.getAttribute('data-signature-marker') === 'true')
      )

      const selection = editor.model.document.selection
      const cursorPosition = selection.getFirstPosition()

      if (cursorPosition) {
        writer.setSelection(cursorPosition)
        editor.model.insertContent(modelFragment)
      } else {
        if (signatureNode) {
          writer.setSelection(writer.createPositionBefore(signatureNode))
        } else {
          writer.setSelection(root, 'end')
        }
        editor.model.insertContent(modelFragment)
      }
    })

    dispatch(setPendingInsert(null))
  }, [pendingInsert, dispatch])

  // Re-apply signature when identity, key, or mode changes.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    applySignatureRef.current(editor)
  }, [selectedIdentity, selectedSignatureKey, isHtmlMode])

  return (
    <CKEditor
      editor={ClassicEditor}
      onReady={handleReady}
      config={config}
      data={data}
      onChange={handleChange}
    />
  )
}

export default ComposeEditorCore
