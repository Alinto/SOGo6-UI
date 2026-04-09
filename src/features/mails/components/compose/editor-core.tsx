'use client'

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
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HtmlEmbed,
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
import { setPendingInsert } from '../../store/mail-compose-slice'

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
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HtmlEmbed,
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
]

interface CustomEditorCoreProps {
  data: string
  onChange?: (content: string) => void
}

export const CustomEditorCore = ({ data, onChange }: CustomEditorCoreProps) => {
  const locale = useLocale()
  const editorRef = useRef<ClassicEditor | null>(null)
  const dispatch = useAppDispatch()
  const pendingInsert = useAppSelector(
    (state) => state.mailCompose.pendingInsert
  )

  // Stable config — prevents CKEditor from reinitializing on every render
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
          'heading',
          '|',
          'bold',
          'italic',
          'link',
          'bulletedList',
          'numberedList',
          '|',
          'outdent',
          'indent',
          '|',
          'imageUpload',
          'blockQuote',
          'insertTable',
          'mediaEmbed',
          'undo',
          'redo',
        ],
      },
    }),
    [locale]
  )

  // Stable onReady callback
  const handleReady = useCallback((editor: ClassicEditor) => {
    editorRef.current = editor
  }, [])

  // Handle content changes
  const handleChange = useCallback((event, editor: ClassicEditor) => {
    onChange?.(editor.getData())
  }, [onChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editorRef.current = null
    }
  }, [])

  // Insert pendingInsert content at cursor position
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !pendingInsert) return

    const viewFragment = editor.data.processor.toView(pendingInsert)
    const modelFragment = editor.data.toModel(viewFragment)
    editor.model.insertContent(modelFragment)
    dispatch(setPendingInsert(null))
  }, [pendingInsert, dispatch])

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

export default CustomEditorCore
