import { format, subDays, subMonths } from 'date-fns'
import type { MailSearchParams } from '../../mails-types'
import {
  ADVANCED_QUERY_TOKEN_RE,
  buildMailSearchParams,
  defaultSearchFormValues,
  isSimpleBarCompatible,
  mailSearchParamsToFormValues,
  mailSearchParamsToQueryText,
  queryTextToSearchFormValues,
  resolveDateRangePreset,
} from '../mail-search-form'

describe('buildMailSearchParams — include_subfolders', () => {
  it('omits include_subfolders when unset (simple bar default)', () => {
    const params = buildMailSearchParams({
      ...defaultSearchFormValues,
      subject: 'invoice',
    })
    expect(params.include_subfolders).toBeUndefined()
  })

  it('sends include_subfolders: true when opted in (advanced search only)', () => {
    const params = buildMailSearchParams({
      ...defaultSearchFormValues,
      subject: 'invoice',
      includeSubfolders: true,
    })
    expect(params.include_subfolders).toBe(true)
  })
})

describe('resolveDateRangePreset', () => {
  it('returns an empty range for "anytime"', () => {
    expect(
      resolveDateRangePreset('anytime', '2024-01-01', '2024-02-01')
    ).toEqual({})
  })

  it('computes a start date relative to now for the relative presets', () => {
    const today = new Date()
    expect(resolveDateRangePreset('last_7_days', '', '')).toEqual({
      start: format(subDays(today, 7), 'yyyy-MM-dd'),
    })
    expect(resolveDateRangePreset('last_30_days', '', '')).toEqual({
      start: format(subDays(today, 30), 'yyyy-MM-dd'),
    })
    expect(resolveDateRangePreset('last_6_months', '', '')).toEqual({
      start: format(subMonths(today, 6), 'yyyy-MM-dd'),
    })
  })

  it('uses only the picked start date for "after"', () => {
    expect(resolveDateRangePreset('after', '2024-01-01', '2024-02-01')).toEqual(
      {
        start: '2024-01-01',
      }
    )
  })

  it('uses only the picked end date for "before"', () => {
    expect(
      resolveDateRangePreset('before', '2024-01-01', '2024-02-01')
    ).toEqual({
      end: '2024-02-01',
    })
  })

  it('uses both picked dates for "between"', () => {
    expect(
      resolveDateRangePreset('between', '2024-01-01', '2024-02-01')
    ).toEqual({
      start: '2024-01-01',
      end: '2024-02-01',
    })
  })
})

describe('buildMailSearchParams — dateRangePreset', () => {
  it('omits date_range when preset is "anytime"', () => {
    const params = buildMailSearchParams({
      ...defaultSearchFormValues,
      dateRangePreset: 'anytime',
      dateFrom: '2024-01-01',
      dateTo: '2024-02-01',
    })
    expect(params.date_range).toBeUndefined()
  })

  it('sends only start for "after" regardless of a stray dateTo value', () => {
    const params = buildMailSearchParams({
      ...defaultSearchFormValues,
      dateRangePreset: 'after',
      dateFrom: '2024-01-01',
      dateTo: '2024-02-01',
    })
    expect(params.date_range).toEqual({ start: '2024-01-01' })
  })

  it('sends start and end for "between"', () => {
    const params = buildMailSearchParams({
      ...defaultSearchFormValues,
      dateRangePreset: 'between',
      dateFrom: '2024-01-01',
      dateTo: '2024-02-01',
    })
    expect(params.date_range).toEqual({
      start: '2024-01-01',
      end: '2024-02-01',
    })
  })
})

describe('mailSearchParamsToFormValues — dateRangePreset', () => {
  it('defaults to "anytime" when no date_range is present', () => {
    expect(mailSearchParamsToFormValues({}).dateRangePreset).toBe('anytime')
  })

  it('infers "between" when both start and end are present', () => {
    const values = mailSearchParamsToFormValues({
      date_range: { start: '2024-01-01', end: '2024-02-01' },
    })
    expect(values.dateRangePreset).toBe('between')
    expect(values.dateFrom).toBe('2024-01-01')
    expect(values.dateTo).toBe('2024-02-01')
  })

  it('infers "before" when only end is present', () => {
    expect(
      mailSearchParamsToFormValues({ date_range: { end: '2024-02-01' } })
        .dateRangePreset
    ).toBe('before')
  })

  it('infers "after" for an arbitrary start-only date', () => {
    expect(
      mailSearchParamsToFormValues({ date_range: { start: '2024-01-01' } })
        .dateRangePreset
    ).toBe('after')
  })

  it('recognizes a start-only date matching "last 7 days" from today', () => {
    const start = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    expect(
      mailSearchParamsToFormValues({ date_range: { start } }).dateRangePreset
    ).toBe('last_7_days')
  })
})

describe('mailSearchParamsToFormValues — includeSubfolders', () => {
  it('defaults to false when absent from params', () => {
    expect(mailSearchParamsToFormValues({}).includeSubfolders).toBe(false)
  })

  it('reflects include_subfolders: true from params', () => {
    expect(
      mailSearchParamsToFormValues({ include_subfolders: true })
        .includeSubfolders
    ).toBe(true)
  })
})

describe('mailSearchParamsToQueryText', () => {
  it('renders known fields as space-separated key:value tokens', () => {
    const params: MailSearchParams = { to: 'jane', subject: 'invoice' }
    expect(mailSearchParamsToQueryText(params)).toBe('subject:invoice to:jane')
  })

  it('quotes values containing whitespace', () => {
    const params: MailSearchParams = { from: 'John Doe' }
    expect(mailSearchParamsToQueryText(params)).toBe('from:"John Doe"')
  })

  it('renders has:attachment, is:read/unread/flagged, dates, labels and attachment types', () => {
    const params: MailSearchParams = {
      has_attachment: true,
      attachment_type: ['pdf', 'png'],
      date_range: { start: '2024-01-01', end: '2024-02-01' },
      is_read: true,
      is_flagged: true,
      labels: ['Work'],
    }
    expect(mailSearchParamsToQueryText(params)).toBe(
      'has:attachment type:pdf type:png after:2024-01-01 before:2024-02-01 is:read is:flagged label:Work'
    )
  })

  it('prefixes a match:any token when the operator is OR with multiple criteria', () => {
    const params: MailSearchParams = {
      subject: 'invoice',
      from: 'invoice',
      operator: 'OR',
    }
    expect(mailSearchParamsToQueryText(params)).toBe(
      'match:any subject:invoice from:invoice'
    )
  })

  it('omits match:any when OR is set but there is only one criterion', () => {
    const params: MailSearchParams = { subject: 'invoice', operator: 'OR' }
    expect(mailSearchParamsToQueryText(params)).toBe('subject:invoice')
  })

  it('does not fold scoping filters (e.g. the folder) into the OR chain', () => {
    // Regression: "from:test OR in:INBOX" reads as if the folder were an
    // alternative match, but it's always an AND constraint on top of the
    // (possibly OR'd) criteria — it must not follow "OR".
    const params: MailSearchParams = {
      from: 'test',
      operator: 'OR',
      folders: ['INBOX'],
    }
    expect(mailSearchParamsToQueryText(params)).toBe('from:test in:INBOX')
  })

  it('only marks the criteria as match:any, appending filters as plain AND constraints', () => {
    const params: MailSearchParams = {
      subject: 'invoice',
      from: 'invoice',
      operator: 'OR',
      is_flagged: true,
      folders: ['INBOX'],
    }
    expect(mailSearchParamsToQueryText(params)).toBe(
      'match:any subject:invoice from:invoice is:flagged in:INBOX'
    )
  })

  it('omits the folder token when scoped to "all"', () => {
    const params: MailSearchParams = { subject: 'invoice', folders: ['all'] }
    expect(mailSearchParamsToQueryText(params)).toBe('subject:invoice')
  })

  it('includes a folder token when scoped to a specific folder', () => {
    const params: MailSearchParams = {
      subject: 'invoice',
      folders: ['INBOX/Work'],
    }
    expect(mailSearchParamsToQueryText(params)).toBe(
      'subject:invoice in:INBOX/Work'
    )
  })

  it('appends free text without a key', () => {
    const params: MailSearchParams = { text: 'quarterly report' }
    expect(mailSearchParamsToQueryText(params)).toBe('"quarterly report"')
  })

  it('renders subfolders:true when include_subfolders is set', () => {
    const params: MailSearchParams = {
      subject: 'invoice',
      include_subfolders: true,
    }
    expect(mailSearchParamsToQueryText(params)).toBe(
      'subject:invoice subfolders:true'
    )
  })

  it('omits the subfolders token when include_subfolders is unset', () => {
    const params: MailSearchParams = { subject: 'invoice' }
    expect(mailSearchParamsToQueryText(params)).not.toContain('subfolders')
  })
})

describe('queryTextToSearchFormValues', () => {
  const base = { ...defaultSearchFormValues, folder: 'INBOX' }

  it('parses key:value tokens into their matching fields', () => {
    const values = queryTextToSearchFormValues('to:jane subject:invoice', base)
    expect(values.to).toBe('jane')
    expect(values.subject).toBe('invoice')
    expect(values.operator).toBe('AND')
  })

  it('parses quoted values containing spaces', () => {
    const values = queryTextToSearchFormValues(
      'from:"John Doe" subject:"Q1 report"',
      base
    )
    expect(values.from).toBe('John Doe')
    expect(values.subject).toBe('Q1 report')
  })

  it('sets operator to OR when a literal OR token is present', () => {
    const values = queryTextToSearchFormValues(
      'to:jane OR subject:invoice',
      base
    )
    expect(values.operator).toBe('OR')
    expect(values.to).toBe('jane')
    expect(values.subject).toBe('invoice')
  })

  it('sets operator to OR/AND from match:any / match:all', () => {
    expect(
      queryTextToSearchFormValues('match:any to:jane subject:invoice', base)
        .operator
    ).toBe('OR')
    expect(
      queryTextToSearchFormValues('match:all to:jane subject:invoice', base)
        .operator
    ).toBe('AND')
  })

  it('gives match: precedence over a literal OR when both are present', () => {
    const values = queryTextToSearchFormValues(
      'match:all to:jane OR subject:invoice',
      base
    )
    expect(values.operator).toBe('AND')
  })

  it('folds an invalid match: value into free text', () => {
    const values = queryTextToSearchFormValues(
      'match:maybe subject:invoice',
      base
    )
    expect(values.operator).toBe('AND')
    expect(values.text).toBe('match:maybe')
  })

  it('parses has:attachment, is:, after:/before:, in: and label: tokens', () => {
    const values = queryTextToSearchFormValues(
      'has:attachment is:flagged after:2024-01-01 before:2024-02-01 in:Sent label:Work',
      base
    )
    expect(values.hasAttachment).toBe(true)
    expect(values.isFlagged).toBe(true)
    expect(values.dateFrom).toBe('2024-01-01')
    expect(values.dateTo).toBe('2024-02-01')
    expect(values.folder).toBe('Sent')
    expect(values.labels).toEqual(['Work'])
    expect(values.dateRangePreset).toBe('between')
  })

  it('infers dateRangePreset "after" from a lone after: token', () => {
    expect(
      queryTextToSearchFormValues('after:2024-01-01', base).dateRangePreset
    ).toBe('after')
  })

  it('infers dateRangePreset "before" from a lone before: token', () => {
    expect(
      queryTextToSearchFormValues('before:2024-02-01', base).dateRangePreset
    ).toBe('before')
  })

  it('defaults dateRangePreset to "anytime" when no date tokens are present', () => {
    expect(
      queryTextToSearchFormValues('subject:invoice', base).dateRangePreset
    ).toBe('anytime')
  })

  it('parses is:read and is:unread', () => {
    expect(queryTextToSearchFormValues('is:read', base).isRead).toBe('read')
    expect(queryTextToSearchFormValues('is:unread', base).isRead).toBe('unread')
  })

  it('accumulates repeated type: tokens', () => {
    const values = queryTextToSearchFormValues('type:pdf type:png', base)
    expect(values.attachmentType).toEqual(['pdf', 'png'])
  })

  it('folds bare words and unrecognized key:value tokens into free text', () => {
    const values = queryTextToSearchFormValues('quarterly report foo:bar', base)
    expect(values.text).toBe('quarterly report foo:bar')
  })

  it('falls back to the base folder when no in: token is present', () => {
    const values = queryTextToSearchFormValues('subject:invoice', base)
    expect(values.folder).toBe('INBOX')
  })

  it('parses subfolders:true and subfolders:false', () => {
    expect(
      queryTextToSearchFormValues('subfolders:true', base).includeSubfolders
    ).toBe(true)
    expect(
      queryTextToSearchFormValues('subfolders:false', base).includeSubfolders
    ).toBe(false)
  })

  it('folds an invalid subfolders: value into free text', () => {
    const values = queryTextToSearchFormValues('subfolders:maybe', base)
    expect(values.includeSubfolders).toBe(false)
    expect(values.text).toBe('subfolders:maybe')
  })

  it('round-trips through mailSearchParamsToQueryText for a mixed query', () => {
    const text = 'to:jane subject:invoice has:attachment is:flagged'
    const values = queryTextToSearchFormValues(text, base)
    expect(values.to).toBe('jane')
    expect(values.subject).toBe('invoice')
    expect(values.hasAttachment).toBe(true)
    expect(values.isFlagged).toBe(true)
  })
})

describe('ADVANCED_QUERY_TOKEN_RE', () => {
  it.each([
    'to:jane',
    'subject:invoice',
    'has:attachment',
    'is:read',
    'label:Work',
    'subfolders:true',
    'match:any',
  ])('matches recognized operator "%s"', (input) => {
    expect(ADVANCED_QUERY_TOKEN_RE.test(input)).toBe(true)
  })

  it.each(['invoice', 'http://example.com', 'foo:bar'])(
    'does not match plain text or unrecognized keys ("%s")',
    (input) => {
      expect(ADVANCED_QUERY_TOKEN_RE.test(input)).toBe(false)
    }
  )
})

describe('isSimpleBarCompatible', () => {
  it('is true for empty params', () => {
    expect(isSimpleBarCompatible({})).toBe(true)
  })

  it('is true for a single field with no operator', () => {
    expect(isSimpleBarCompatible({ subject: 'invoice' })).toBe(false)
  })

  it('requires operator OR once a field is set (matches what the simple bar always sends)', () => {
    expect(isSimpleBarCompatible({ subject: 'invoice', operator: 'OR' })).toBe(
      true
    )
  })

  it('is true when subject/from/to share the same value under OR', () => {
    expect(
      isSimpleBarCompatible({
        subject: 'invoice',
        from: 'invoice',
        operator: 'OR',
      })
    ).toBe(true)
  })

  it('is false when fields hold different values', () => {
    expect(
      isSimpleBarCompatible({
        subject: 'invoice',
        from: 'jane',
        operator: 'OR',
      })
    ).toBe(false)
  })

  it('is false when any advanced-only field is set', () => {
    expect(isSimpleBarCompatible({ bcc: 'jane', operator: 'OR' })).toBe(false)
    expect(isSimpleBarCompatible({ has_attachment: true })).toBe(false)
    expect(isSimpleBarCompatible({ is_flagged: true })).toBe(false)
    expect(isSimpleBarCompatible({ labels: ['Work'] })).toBe(false)
    expect(isSimpleBarCompatible({ include_subfolders: true })).toBe(false)
  })
})
