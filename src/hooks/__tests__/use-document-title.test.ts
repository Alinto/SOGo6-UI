import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from '../use-document-title'

describe('useDocumentTitle', () => {
  afterEach(() => {
    document.title = ''
  })

  it('keeps the message subject over the folder name, then restores the folder', () => {
    document.title = 'Mail · SOGo'

    const folder = renderHook(() => useDocumentTitle('Inbox'))
    expect(document.title).toBe('Inbox · SOGo')

    const message = renderHook(() => useDocumentTitle('Hello', 1))
    expect(document.title).toBe('Hello · SOGo')

    message.unmount()
    expect(document.title).toBe('Inbox · SOGo')

    folder.unmount()
    expect(document.title).toBe('Mail · SOGo')
  })

  it('updates the winning title when the subject changes', () => {
    document.title = 'Mail · SOGo'
    const folder = renderHook(() => useDocumentTitle('Inbox'))
    const message = renderHook(
      ({ subject }: { subject: string }) => useDocumentTitle(subject, 1),
      { initialProps: { subject: 'Hello' } }
    )

    message.rerender({ subject: 'Updated' })
    expect(document.title).toBe('Updated · SOGo')

    message.unmount()
    folder.unmount()
  })
})
