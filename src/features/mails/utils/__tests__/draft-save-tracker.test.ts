import { trackDraftSave, waitForPendingDraftSave } from '../draft-save-tracker'

describe('draft-save-tracker', () => {
  it('resolves null when no save is in flight', async () => {
    await expect(waitForPendingDraftSave('none')).resolves.toBeNull()
  })

  it('resolves with the key of the save in flight, then forgets it', async () => {
    await trackDraftSave('d1', Promise.resolve('key-1'))
    // A settled save is dropped, so later sends do not reuse it.
    await expect(waitForPendingDraftSave('d1')).resolves.toBeNull()

    let finish: (key: string) => void = () => {}
    trackDraftSave(
      'd1',
      new Promise<string>((resolve) => {
        finish = resolve
      })
    )
    const waiting = waitForPendingDraftSave('d1')
    finish('key-2')
    await expect(waiting).resolves.toBe('key-2')
  })

  it('resolves null when the save fails', async () => {
    const failing = Promise.reject(new Error('boom'))
    trackDraftSave('d2', failing).catch(() => undefined)
    await expect(waitForPendingDraftSave('d2')).resolves.toBeNull()
  })
})
