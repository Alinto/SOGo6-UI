'use client'

import { useAppDispatch } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import React from 'react'
import { useUploadAttachmentMutation } from '../store/mail-api'
import {
  addAttachment,
  updateAttachmentProgress,
  updateMailKey,
  renameAttachment,
} from '../store/mail-compose-slice'

interface UseComposeAttachmentUploadOptions {
  draftId: string
  accountId: string
  mailKey: string | null
}

export function useComposeAttachmentUpload({
  draftId,
  accountId,
  mailKey,
}: UseComposeAttachmentUploadOptions) {
  const dispatch = useAppDispatch()
  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadAttachmentMutation()

  const [isDragOver, setIsDragOver] = React.useState(false)
  const dragCounterRef = React.useRef(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const resetDragState = () => {
      dragCounterRef.current = 0
      setIsDragOver(false)
    }
    // capture phase: fires before CKEditor's stopPropagation on drop
    document.addEventListener('drop', resetDragState, true)
    // dragend: fires when an internal drag ends anywhere
    document.addEventListener('dragend', resetDragState)
    return () => {
      document.removeEventListener('drop', resetDragState, true)
      document.removeEventListener('dragend', resetDragState)
    }
  }, [])

  const processFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const tempId = createClientId()

      dispatch(
        addAttachment({
          draftId,
          attachment: {
            draftId: tempId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadStatus: 'uploading',
            uploadProgress: 0,
          },
        })
      )

      try {
        const result = await uploadAttachment({
          accountId,
          mailKey,
          file,
        })
        if (!('error' in result) && result.data?.data) {
          const serverFilename = result.data.data.filename
          const serverMailKey = result.data.data.key

          dispatch(
            updateAttachmentProgress({
              draftId,
              attachmentId: tempId,
              progress: 100,
              status: 'completed',
            })
          )

          if (serverFilename) {
            dispatch(
              renameAttachment({
                draftId,
                attachmentId: tempId,
                name: serverFilename,
              })
            )
          }
          if (serverMailKey) {
            dispatch(updateMailKey({ draftId, mailKey: serverMailKey }))
          }
        } else {
          dispatch(
            updateAttachmentProgress({
              draftId,
              attachmentId: tempId,
              progress: 0,
              status: 'error',
            })
          )
        }
      } catch {
        dispatch(
          updateAttachmentProgress({
            draftId,
            attachmentId: tempId,
            progress: 0,
            status: 'error',
          })
        )
      }
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await processFiles(files)
    e.target.value = ''
  }

  const isFileDrag = (e: React.DragEvent) =>
    e.dataTransfer.types.includes('Files')

  const handleDragEnter = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
    dragCounterRef.current++
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    await processFiles(files)
  }

  return {
    fileInputRef,
    isDragOver,
    isUploading,
    handleAttachmentClick,
    handleFileChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
