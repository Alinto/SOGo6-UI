import {
  DEFAULT_TAG_COLOR,
  mergeLabelOptions,
  tagColor,
  toSearchableMailTags,
  type MailboxTag,
} from '../searchable-mail-tags'

const tag = (name: string, color?: string | null, is_default = false) =>
  ({ name, color, is_default }) as MailboxTag

describe('toSearchableMailTags', () => {
  it('returns an empty list without tags', () => {
    expect(toSearchableMailTags(undefined)).toEqual([])
  })

  it('drops system flags, $ keywords and junk markers', () => {
    expect(
      toSearchableMailTags([
        tag('\\Seen'),
        tag('\\Answered'),
        tag('$Forwarded'),
        tag('$MDNSent'),
        tag('Junk'),
        tag('NonJunk'),
        tag(' '),
        tag('Facture', '#ef4444'),
        tag('Projet-X'),
      ]).map((t) => t.name)
    ).toEqual(['Facture', 'Projet-X'])
  })

  it('keeps the color and default flag of the tags', () => {
    expect(toSearchableMailTags([tag('Work', '#8b5cf6', true)])).toEqual([
      { name: 'Work', color: '#8b5cf6', is_default: true },
    ])
  })
})

describe('mergeLabelOptions', () => {
  it('lists categories first, then tags without a matching category', () => {
    expect(
      mergeLabelOptions(
        [tag('Urgent'), tag('Work')],
        [tag('urgent'), tag('Facture'), tag('work')]
      ).map((t) => t.name)
    ).toEqual(['Urgent', 'Work', 'Facture'])
  })

  it('removes duplicate tags', () => {
    expect(
      mergeLabelOptions([], [tag('A'), tag('a'), tag('B')]).map((t) => t.name)
    ).toEqual(['A', 'B'])
  })

  it('keeps the color of the first entry', () => {
    expect(
      mergeLabelOptions([tag('Work', '#111111')], [tag('work', '#222222')])
    ).toEqual([tag('Work', '#111111')])
  })

  it('fills a missing color from a skipped duplicate', () => {
    expect(
      mergeLabelOptions([tag('Work', '', true)], [tag('work', '#222222')])
    ).toEqual([tag('Work', '#222222', true)])
  })
})

describe('tagColor', () => {
  it('returns the tag color', () => {
    expect(tagColor({ color: '#22c55e' })).toBe('#22c55e')
  })

  it.each([undefined, null, '', '  '])(
    'falls back to the theme color for %p',
    (color) => {
      expect(tagColor({ color })).toBe(DEFAULT_TAG_COLOR)
    }
  )
})
