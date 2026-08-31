/**
 * @jest-environment jsdom
 */
import { localDraftAttachmentsToCompose } from '../use-offline-draft-sync'

describe('localDraftAttachmentsToCompose', () => {
  it('rebuilds File objects from stored blobs', () => {
    const blob = new Blob(['hi'], { type: 'text/plain' })
    const [attachment] = localDraftAttachmentsToCompose('d1', [
      { id: 'a1', name: 'note.txt', size: 2, type: 'text/plain', blob },
    ])
    expect(attachment?.name).toBe('note.txt')
    expect(attachment?.file).toBeInstanceOf(File)
    expect(attachment?.file?.size).toBe(2)
  })
})
