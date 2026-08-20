import { getMailLabelBulkStates, matchMailLabels } from '../match-mail-labels'

const categories = [
  { name: 'Important', color: '#ff0000' },
  { name: 'Work', color: '#00ff00' },
]

describe('matchMailLabels', () => {
  it('returns an empty array when there are no flags', () => {
    expect(matchMailLabels(undefined, categories)).toEqual([])
    expect(matchMailLabels([], categories)).toEqual([])
  })

  it('returns an empty array when there are no categories', () => {
    expect(matchMailLabels(['Work'], [])).toEqual([])
  })

  it('drops flags that do not match any category', () => {
    expect(matchMailLabels(['\\Seen', '\\Flagged'], categories)).toEqual([])
  })

  it('matches flags to categories by name', () => {
    expect(matchMailLabels(['Important', 'Work'], categories)).toEqual([
      { name: 'Important', color: '#ff0000' },
      { name: 'Work', color: '#00ff00' },
    ])
  })

  it('matches case-insensitively', () => {
    expect(matchMailLabels(['important'], categories)).toEqual([
      { name: 'Important', color: '#ff0000' },
    ])
  })

  it('drops unmatched flags while keeping matched ones', () => {
    expect(matchMailLabels(['\\Seen', 'Work'], categories)).toEqual([
      { name: 'Work', color: '#00ff00' },
    ])
  })

  it('deduplicates flags that match the same category case-insensitively', () => {
    expect(matchMailLabels(['Work', 'work'], categories)).toEqual([
      { name: 'Work', color: '#00ff00' },
    ])
  })
})

describe('getMailLabelBulkStates', () => {
  it('returns an empty map when there are no mails or no categories', () => {
    expect(getMailLabelBulkStates([], categories)).toEqual(new Map())
    expect(getMailLabelBulkStates([['Work']], [])).toEqual(new Map())
  })

  it('marks a label checked when every mail has it', () => {
    const states = getMailLabelBulkStates([['Work'], ['Work']], categories)
    expect(states.get('Work')).toBe('checked')
  })

  it('marks a label indeterminate when only some mails have it', () => {
    const states = getMailLabelBulkStates([['Work'], []], categories)
    expect(states.get('Work')).toBe('indeterminate')
  })

  it('omits a label no mail has', () => {
    const states = getMailLabelBulkStates([[], []], categories)
    expect(states.has('Important')).toBe(false)
    expect(states.has('Work')).toBe(false)
  })

  it('matches case-insensitively', () => {
    const states = getMailLabelBulkStates([['work'], ['WORK']], categories)
    expect(states.get('Work')).toBe('checked')
  })

  it('treats mails with undefined flags as not having any label', () => {
    const states = getMailLabelBulkStates([['Work'], undefined], categories)
    expect(states.get('Work')).toBe('indeterminate')
  })
})
