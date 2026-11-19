import { toMailBatchActionResult } from '../mail-batch-action-result'

describe('toMailBatchActionResult', () => {
  it('lists the folders reported in data.errors', () => {
    expect(
      toMailBatchActionResult({
        data: { errors: { Shared: 'S000403', Junk: 'S000309' } },
      })
    ).toEqual({ failedFolders: ['Shared', 'Junk'] })
  })

  it.each([
    ['no errors', { data: { errors: {} } }],
    ['null errors', { data: { errors: null } }],
    ['no data', { data: null }],
    ['empty body', null],
    ['undefined', undefined],
  ])('reports no failure for %s', (_label, response) => {
    expect(toMailBatchActionResult(response)).toEqual({ failedFolders: [] })
  })
})
