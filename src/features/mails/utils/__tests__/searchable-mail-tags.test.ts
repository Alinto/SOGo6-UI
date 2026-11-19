import {
  mergeLabelOptions,
  toSearchableMailTags,
} from '../searchable-mail-tags'

describe('toSearchableMailTags', () => {
  it('returns an empty list without tags', () => {
    expect(toSearchableMailTags(undefined)).toEqual([])
  })

  it('drops system flags, $ keywords and junk markers', () => {
    expect(
      toSearchableMailTags([
        '\\Seen',
        '\\Answered',
        '$Forwarded',
        '$MDNSent',
        'Junk',
        'NonJunk',
        ' ',
        'Facture',
        'Projet-X',
      ])
    ).toEqual(['Facture', 'Projet-X'])
  })
})

describe('mergeLabelOptions', () => {
  it('lists categories first, then tags without a matching category', () => {
    expect(
      mergeLabelOptions(['Urgent', 'Work'], ['urgent', 'Facture', 'work'])
    ).toEqual(['Urgent', 'Work', 'Facture'])
  })

  it('removes duplicate tags', () => {
    expect(mergeLabelOptions([], ['A', 'a', 'B'])).toEqual(['A', 'B'])
  })
})
