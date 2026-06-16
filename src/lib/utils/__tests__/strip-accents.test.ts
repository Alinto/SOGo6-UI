import { stripAccents, textMatchesSearch } from '@/lib/utils/strip-accents'

describe('stripAccents', () => {
  it('removes diacritics and lowercases', () => {
    expect(stripAccents('Réunion')).toBe('reunion')
  })
})

describe('textMatchesSearch', () => {
  it('matches accent-insensitive substrings with at least 2 chars', () => {
    expect(textMatchesSearch('Réunion équipe', 'reun')).toBe(true)
    expect(textMatchesSearch('Meeting', 'reun')).toBe(false)
  })

  it('returns true for queries shorter than 2 chars', () => {
    expect(textMatchesSearch('Anything', 'a')).toBe(true)
  })
})
