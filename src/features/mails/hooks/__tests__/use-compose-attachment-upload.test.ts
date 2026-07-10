import { act, renderHook } from '@testing-library/react'
import {
  addAttachment,
  renameAttachment,
  updateAttachmentProgress,
  updateMailKey,
} from '../../store/mail-compose-slice'

const mockDispatch = jest.fn()
const mockUploadAttachment = jest.fn()
const mockUseUploadAttachmentMutation = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/utils/create-client-id', () => ({
  createClientId: jest.fn(() => 'temp-id'),
}))

jest.mock('../../store/mail-api', () => ({
  useUploadAttachmentMutation: () => mockUseUploadAttachmentMutation(),
}))

import { useComposeAttachmentUpload } from '../use-compose-attachment-upload'

const baseOptions = { draftId: 'draft-1', accountId: 'acc-1', mailKey: null }

const dragEvent = (types: string[]) =>
  ({
    dataTransfer: { types, files: [] },
    preventDefault: jest.fn(),
  }) as unknown as React.DragEvent

const dropEvent = (types: string[], files: File[]) =>
  ({
    dataTransfer: { types, files },
    preventDefault: jest.fn(),
  }) as unknown as React.DragEvent

const changeEvent = (files: File[] | null) =>
  ({
    target: { files, value: 'C:\\fakepath\\file' },
  }) as unknown as React.ChangeEvent<HTMLInputElement>

describe('useComposeAttachmentUpload', () => {
  beforeEach(() => {
    mockUseUploadAttachmentMutation.mockReturnValue([
      mockUploadAttachment,
      { isLoading: false },
    ])
  })

  describe('handleAttachmentClick', () => {
    it('clicks the hidden file input', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const input = document.createElement('input')
      const clickSpy = jest.spyOn(input, 'click')

      act(() => {
        result.current.fileInputRef.current = input
      })
      act(() => {
        result.current.handleAttachmentClick()
      })

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleFileChange (upload flow)', () => {
    it('does nothing when there are no files', async () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )

      await act(async () => {
        await result.current.handleFileChange(changeEvent([]))
      })

      expect(mockDispatch).not.toHaveBeenCalled()
      expect(mockUploadAttachment).not.toHaveBeenCalled()
    })

    it('adds the attachment optimistically, uploads it, and resets the input value', async () => {
      mockUploadAttachment.mockResolvedValue({
        data: { data: { filename: 'server.txt', key: 'srv-key' } },
      })
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const event = changeEvent([file])

      await act(async () => {
        await result.current.handleFileChange(event)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        addAttachment({
          draftId: 'draft-1',
          attachment: {
            draftId: 'temp-id',
            name: 'test.txt',
            size: file.size,
            type: 'text/plain',
            uploadStatus: 'uploading',
            uploadProgress: 0,
          },
        })
      )
      expect(mockUploadAttachment).toHaveBeenCalledWith({
        accountId: 'acc-1',
        mailKey: null,
        file,
      })
      expect(event.target.value).toBe('')
    })

    it('marks the attachment completed and renames/updates the key from the server response', async () => {
      mockUploadAttachment.mockResolvedValue({
        data: { data: { filename: 'server.txt', key: 'srv-key' } },
      })
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      await act(async () => {
        await result.current.handleFileChange(changeEvent([file]))
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        updateAttachmentProgress({
          draftId: 'draft-1',
          attachmentId: 'temp-id',
          progress: 100,
          status: 'completed',
        })
      )
      expect(mockDispatch).toHaveBeenCalledWith(
        renameAttachment({
          draftId: 'draft-1',
          attachmentId: 'temp-id',
          name: 'server.txt',
        })
      )
      expect(mockDispatch).toHaveBeenCalledWith(
        updateMailKey({ draftId: 'draft-1', mailKey: 'srv-key' })
      )
    })

    it('marks the attachment as errored when the upload returns an error', async () => {
      mockUploadAttachment.mockResolvedValue({ error: { status: 500 } })
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      await act(async () => {
        await result.current.handleFileChange(changeEvent([file]))
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        updateAttachmentProgress({
          draftId: 'draft-1',
          attachmentId: 'temp-id',
          progress: 0,
          status: 'error',
        })
      )
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: renameAttachment({} as any).type })
      )
    })

    it('marks the attachment as errored when the upload call throws', async () => {
      mockUploadAttachment.mockRejectedValue(new Error('network down'))
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      await act(async () => {
        await result.current.handleFileChange(changeEvent([file]))
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        updateAttachmentProgress({
          draftId: 'draft-1',
          attachmentId: 'temp-id',
          progress: 0,
          status: 'error',
        })
      )
    })
  })

  describe('drag and drop', () => {
    it('ignores drag events that are not file drags', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const event = dragEvent(['text/plain'])

      act(() => {
        result.current.handleDragEnter(event)
      })

      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(result.current.isDragOver).toBe(false)
    })

    it('sets isDragOver on file drag enter', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )

      act(() => {
        result.current.handleDragEnter(dragEvent(['Files']))
      })

      expect(result.current.isDragOver).toBe(true)
    })

    it('keeps isDragOver true while nested drag-enters outnumber drag-leaves', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )

      act(() => {
        result.current.handleDragEnter(dragEvent(['Files']))
        result.current.handleDragEnter(dragEvent(['Files']))
        result.current.handleDragLeave(dragEvent(['Files']))
      })

      expect(result.current.isDragOver).toBe(true)

      act(() => {
        result.current.handleDragLeave(dragEvent(['Files']))
      })

      expect(result.current.isDragOver).toBe(false)
    })

    it('prevents default on drag over for file drags only', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const fileDrag = dragEvent(['Files'])
      const otherDrag = dragEvent(['text/plain'])

      act(() => {
        result.current.handleDragOver(fileDrag)
        result.current.handleDragOver(otherDrag)
      })

      expect(fileDrag.preventDefault).toHaveBeenCalled()
      expect(otherDrag.preventDefault).not.toHaveBeenCalled()
    })

    it('handleDrop resets isDragOver and uploads the dropped files', async () => {
      mockUploadAttachment.mockResolvedValue({ data: { data: {} } })
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )
      const file = new File(['content'], 'dropped.txt', {
        type: 'text/plain',
      })

      act(() => {
        result.current.handleDragEnter(dragEvent(['Files']))
      })
      expect(result.current.isDragOver).toBe(true)

      await act(async () => {
        await result.current.handleDrop(dropEvent(['Files'], [file]))
      })

      expect(result.current.isDragOver).toBe(false)
      expect(mockUploadAttachment).toHaveBeenCalledWith(
        expect.objectContaining({ file })
      )
    })

    it('handleDrop does nothing for non-file drags', async () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )

      await act(async () => {
        await result.current.handleDrop(dropEvent(['text/plain'], []))
      })

      expect(mockUploadAttachment).not.toHaveBeenCalled()
    })
  })

  describe('global drag reset listeners', () => {
    it('resets isDragOver when a drop occurs anywhere in the document', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )

      act(() => {
        result.current.handleDragEnter(dragEvent(['Files']))
      })
      expect(result.current.isDragOver).toBe(true)

      act(() => {
        document.dispatchEvent(new Event('drop'))
      })

      expect(result.current.isDragOver).toBe(false)
    })

    it('resets isDragOver when a dragend occurs anywhere in the document', () => {
      const { result } = renderHook(() =>
        useComposeAttachmentUpload(baseOptions)
      )

      act(() => {
        result.current.handleDragEnter(dragEvent(['Files']))
      })
      expect(result.current.isDragOver).toBe(true)

      act(() => {
        document.dispatchEvent(new Event('dragend'))
      })

      expect(result.current.isDragOver).toBe(false)
    })
  })

  it('exposes isUploading from the underlying mutation state', () => {
    mockUseUploadAttachmentMutation.mockReturnValue([
      mockUploadAttachment,
      { isLoading: true },
    ])
    const { result } = renderHook(() => useComposeAttachmentUpload(baseOptions))

    expect(result.current.isUploading).toBe(true)
  })
})
