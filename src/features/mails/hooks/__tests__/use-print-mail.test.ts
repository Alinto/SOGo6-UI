import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import type { ImapMessages } from '../../mails-types'

const mockDispatch = jest.fn()
const mockOpenPrintWindow = jest.fn()
const mockBuildPrintDocument = jest.fn()
const mockPrepareMailBodyHtml = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/features/mails/utils/open-print-window', () => ({
  openPrintWindow: (...args: unknown[]) => mockOpenPrintWindow(...args),
}))

jest.mock('@/features/mails/utils/build-print-document', () => ({
  buildPrintDocument: (...args: unknown[]) => mockBuildPrintDocument(...args),
}))

jest.mock('@/features/mails/utils/prepare-mail-body-html', () => ({
  prepareMailBodyHtml: (...args: unknown[]) => mockPrepareMailBodyHtml(...args),
}))

import { usePrintMail } from '../use-print-mail'

const baseMail: ImapMessages = {
  id: '1',
  subject: 'Hello',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  cc: [],
  date: 1_704_067_200_000,
  body: '<p>Mail body</p>',
  seen: true,
  answered: false,
  deleted: false,
  attachments: { count: 0, parts: [] },
  imageBlocked: false,
}

describe('usePrintMail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrepareMailBodyHtml.mockReturnValue('<p>Mail body</p>')
    mockBuildPrintDocument.mockReturnValue('<html>print</html>')
    mockOpenPrintWindow.mockReturnValue(true)
  })

  describe('configuration', () => {
    it('disables print when mail body is missing', () => {
      const { result } = renderHook(() =>
        usePrintMail({ ...baseMail, body: undefined })
      )
      expect(result.current.isPrintDisabled).toBe(true)
    })

    it('enables print when mail body exists', () => {
      const { result } = renderHook(() => usePrintMail(baseMail))
      expect(result.current.isPrintDisabled).toBe(false)
    })
  })

  describe('handlePrint', () => {
    it('builds print document and opens print window', () => {
      const { result } = renderHook(() => usePrintMail(baseMail))

      act(() => {
        result.current.handlePrint()
      })

      expect(mockPrepareMailBodyHtml).toHaveBeenCalledWith(baseMail.body, {
        includeExternalImages: true,
      })
      expect(mockBuildPrintDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Hello',
          body: '<p>Mail body</p>',
        })
      )
      expect(mockOpenPrintWindow).toHaveBeenCalledWith('<html>print</html>')
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('dispatches notification when popup is blocked', () => {
      mockOpenPrintWindow.mockReturnValue(false)
      const { result } = renderHook(() => usePrintMail(baseMail))

      act(() => {
        result.current.handlePrint()
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
          payload: expect.objectContaining({
            type: 'info',
            title: 'mail_print.popup_blocked.title.string',
          }),
        })
      )
    })

    it('does nothing when body is empty', () => {
      const { result } = renderHook(() =>
        usePrintMail({ ...baseMail, body: '' })
      )

      act(() => {
        result.current.handlePrint()
      })

      expect(mockPrepareMailBodyHtml).not.toHaveBeenCalled()
      expect(mockOpenPrintWindow).not.toHaveBeenCalled()
    })

    it('respects includeExternalImages option override', () => {
      const { result } = renderHook(() =>
        usePrintMail(baseMail, { includeExternalImages: false })
      )

      act(() => {
        result.current.handlePrint()
      })

      expect(mockPrepareMailBodyHtml).toHaveBeenCalledWith(baseMail.body, {
        includeExternalImages: false,
      })
    })
  })
})
