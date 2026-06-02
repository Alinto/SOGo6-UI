import {
  recurrenceScopeToMutationFields,
  singleOccurrenceMutationFields,
} from '../recurrence-scope-mutation'

describe('recurrenceScopeToMutationFields', () => {
  it('returns empty fields for ALL scope', () => {
    expect(
      recurrenceScopeToMutationFields('ALL', '2026-01-01T10:00:00Z')
    ).toEqual({})
  })

  it('returns recurrence_id only for ONE scope', () => {
    expect(
      recurrenceScopeToMutationFields('ONE', '2026-01-01T10:00:00Z')
    ).toEqual({ recurrence_id: '2026-01-01T10:00:00Z' })
  })

  it('returns recurrence_id and THISANDFUTURE range', () => {
    expect(
      recurrenceScopeToMutationFields(
        'THISANDFUTURE',
        '2026-01-01T10:00:00Z'
      )
    ).toEqual({
      recurrence_id: '2026-01-01T10:00:00Z',
      recurrence_range: 'THISANDFUTURE',
    })
  })
})

describe('singleOccurrenceMutationFields', () => {
  it('returns recurrence_id when present', () => {
    expect(singleOccurrenceMutationFields('2026-01-01T10:00:00Z')).toEqual({
      recurrence_id: '2026-01-01T10:00:00Z',
    })
  })

  it('returns empty when absent', () => {
    expect(singleOccurrenceMutationFields(null)).toEqual({})
  })
})
