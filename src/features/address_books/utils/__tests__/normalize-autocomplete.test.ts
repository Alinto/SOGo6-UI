import {
  normalizeAutocompleteResponse,
  normalizeContactSuggestion,
} from '../normalize-autocomplete'

describe('normalizeContactSuggestion', () => {
  it('maps snake_case autocomplete fields to UI model', () => {
    expect(
      normalizeContactSuggestion({
        type: 'contact',
        name: 'Alice Martin',
        email: 'alice@example.com',
        contact_key: 'c1',
        list_key: null,
        member_count: null,
        members: null,
        address_book: { key: 'ab-1', name: 'Personal' },
      })
    ).toEqual({
      type: 'contact',
      name: 'Alice Martin',
      email: 'alice@example.com',
      contactKey: 'c1',
      listKey: undefined,
      memberCount: undefined,
      members: undefined,
      addressBookKey: 'ab-1',
      addressBookName: 'Personal',
    })
  })
})

describe('normalizeAutocompleteResponse', () => {
  it('returns array payloads unchanged', () => {
    const suggestions = [{ type: 'contact' as const, email: 'a@example.com' }]
    expect(normalizeAutocompleteResponse(suggestions)).toBe(suggestions)
  })

  it('unwraps backend envelope and normalizes suggestions', () => {
    const result = normalizeAutocompleteResponse({
      data: {
        suggestions: [
          {
            type: 'list',
            name: 'Team',
            list_key: 'l1',
            member_count: 2,
            members: [{ contact_key: 'c1', name: 'Bob', email: 'bob@example.com' }],
          },
        ],
      },
      error_code: 'S000000',
    })

    expect(result).toHaveLength(1)
    expect(result[0].listKey).toBe('l1')
    expect(result[0].members?.[0].email).toBe('bob@example.com')
  })
})
