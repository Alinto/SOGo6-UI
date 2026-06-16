import { serializeTaskBody } from '../serialize-task'

describe('serializeTaskBody', () => {
  it('maps due to date_due and omits due', () => {
    const body = serializeTaskBody({
      title: 'Task',
      due: '2026-04-22T17:00:00.000Z',
    })

    expect(body).toEqual({
      title: 'Task',
      date_due: '2026-04-22T17:00:00.000Z',
    })
    expect(body).not.toHaveProperty('due')
  })

  it('serializes related_to string uids as objects', () => {
    const body = serializeTaskBody({
      title: 'Task',
      related_to: ['uid-1', 'uid-2'],
    })

    expect(body.related_to).toEqual([{ uid: 'uid-1' }, { uid: 'uid-2' }])
  })

  it('only includes defined patch fields', () => {
    const body = serializeTaskBody({
      status: 'completed',
      percent_complete: 100,
    })

    expect(body).toEqual({
      status: 'completed',
      percent_complete: 100,
    })
    expect(body).not.toHaveProperty('title')
    expect(body).not.toHaveProperty('due')
    expect(body).not.toHaveProperty('date_due')
  })
})
