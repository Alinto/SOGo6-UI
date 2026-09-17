import { format, subDays, subMonths } from 'date-fns'
import { z } from 'zod'
import type {
  MailSearchFieldScope,
  MailSearchParams,
  MailSearchSize,
} from '../mails-types'

export const dateRangePresets = [
  'anytime',
  'last_7_days',
  'last_30_days',
  'last_6_months',
  'before',
  'after',
  'between',
] as const

export type DateRangePreset = (typeof dateRangePresets)[number]

export const sizeUnits = ['kb', 'mb', 'gb'] as const
export type SizeUnit = (typeof sizeUnits)[number]

export const searchFormSchema = z.object({
  fieldScope: z
    .array(z.enum(['subject', 'sender', 'to', 'entire_message']))
    .min(1),
  text: z.string(),
  subject: z.string(),
  from: z.string(),
  to: z.string(),
  bcc: z.string(),
  hasAttachment: z.boolean(),
  attachmentType: z.array(z.string()),
  dateRangePreset: z.enum(dateRangePresets),
  dateFrom: z.string(),
  dateTo: z.string(),
  sizeOperator: z.enum(['any', '>', '<']),
  sizeValue: z.string(),
  sizeUnit: z.enum(sizeUnits),
  isRead: z.enum(['any', 'unread', 'read']),
  isFlagged: z.boolean(),
  folder: z.string(),
  includeSubfolders: z.boolean(),
  labels: z.array(z.string()),
  operator: z.enum(['AND', 'OR']),
})

export type SearchFormValues = z.infer<typeof searchFormSchema>

export const defaultSearchFormValues: SearchFormValues = {
  fieldScope: ['subject', 'sender'],
  text: '',
  subject: '',
  from: '',
  to: '',
  bcc: '',
  hasAttachment: false,
  attachmentType: [],
  dateRangePreset: 'anytime',
  dateFrom: '',
  dateTo: '',
  sizeOperator: 'any',
  sizeValue: '',
  sizeUnit: 'kb',
  isRead: 'any',
  isFlagged: false,
  folder: 'INBOX',
  // Simple-bar searches never expose this control and always search the
  // current folder only; only the advanced modal/bar lets the user opt in.
  includeSubfolders: false,
  labels: [],
  operator: 'AND',
}

const ISO_DATE_FORMAT = 'yyyy-MM-dd'

/**
 * Resolves a date-range preset (plus, for `before`/`after`/`between`, the
 * manually-picked `dateFrom`/`dateTo`) into the `date_range.start`/`end`
 * sent to the API. The relative presets (`last_7_days`, etc.) are always
 * computed against "now" rather than a date fixed at selection time.
 */
export function resolveDateRangePreset(
  preset: DateRangePreset,
  dateFrom: string,
  dateTo: string
): { start?: string; end?: string } {
  const today = new Date()
  switch (preset) {
    case 'last_7_days':
      return { start: format(subDays(today, 7), ISO_DATE_FORMAT) }
    case 'last_30_days':
      return { start: format(subDays(today, 30), ISO_DATE_FORMAT) }
    case 'last_6_months':
      return { start: format(subMonths(today, 6), ISO_DATE_FORMAT) }
    case 'after':
      return dateFrom ? { start: dateFrom } : {}
    case 'before':
      return dateTo ? { end: dateTo } : {}
    case 'between':
      return {
        ...(dateFrom ? { start: dateFrom } : {}),
        ...(dateTo ? { end: dateTo } : {}),
      }
    case 'anytime':
    default:
      return {}
  }
}

/**
 * Reverse of `resolveDateRangePreset`: given the raw `start`/`end` from an
 * already-active search, infers which preset the user most likely picked so
 * the form re-selects it. Relative presets are recognized by matching the
 * computed date exactly; anything else falls back to before/after/between.
 */
function dateRangeToPreset(
  start: string | undefined,
  end: string | undefined
): DateRangePreset {
  if (!start && !end) return 'anytime'
  if (start && !end) {
    const today = new Date()
    if (start === format(subDays(today, 7), ISO_DATE_FORMAT))
      return 'last_7_days'
    if (start === format(subDays(today, 30), ISO_DATE_FORMAT))
      return 'last_30_days'
    if (start === format(subMonths(today, 6), ISO_DATE_FORMAT))
      return 'last_6_months'
    return 'after'
  }
  if (!start && end) return 'before'
  return 'between'
}

/** Compact `>15kb`-style encoding of a size filter, shared by the advanced
 * query bar and the shareable URL. */
function formatSizeToken(size: MailSearchSize): string {
  return `${size.operator}${size.value}${size.unit}`
}

const SIZE_TOKEN_RE = /^([<>])(\d+(?:\.\d+)?)(kb|mb|gb)$/i

function parseSizeToken(raw: string): MailSearchSize | undefined {
  const match = SIZE_TOKEN_RE.exec(raw)
  if (!match) return undefined
  const [, operator, value, unit] = match
  return {
    operator: operator as '>' | '<',
    value: Number(value),
    unit: unit.toLowerCase() as SizeUnit,
  }
}

export type SimpleSearchField = 'text' | 'subject' | 'from' | 'to'

/**
 * Each scope maps to a single underlying param. Combined searches (e.g.
 * "subject and sender") are expressed by selecting several scopes at once —
 * the simple-search box then writes the typed value into every field mapped
 * by a currently selected scope, which the backend ORs together.
 */
export const SEARCH_FIELD_SCOPE_TARGET: Record<
  MailSearchFieldScope,
  SimpleSearchField
> = {
  subject: 'subject',
  sender: 'from',
  to: 'to',
  entire_message: 'text',
}

export function buildMailSearchParams(
  values: SearchFormValues
): MailSearchParams {
  const params: MailSearchParams = {}
  const text = values.text.trim()
  const subject = values.subject.trim()
  const from = values.from.trim()
  const to = values.to.trim()
  const bcc = values.bcc.trim()

  if (text) params.text = text
  if (subject) params.subject = subject
  if (from) params.from = from
  if (to) params.to = to
  if (bcc) params.bcc = bcc
  if (values.hasAttachment) params.has_attachment = true
  if (values.attachmentType.length > 0) {
    params.attachment_type = values.attachmentType
  }
  const dateRange = resolveDateRangePreset(
    values.dateRangePreset,
    values.dateFrom,
    values.dateTo
  )
  if (dateRange.start || dateRange.end) params.date_range = dateRange
  const sizeValue = values.sizeValue.trim()
  if (values.sizeOperator !== 'any' && sizeValue) {
    const numericSize = Number(sizeValue)
    if (!Number.isNaN(numericSize) && numericSize > 0) {
      params.size = {
        value: numericSize,
        operator: values.sizeOperator,
        unit: values.sizeUnit,
      }
    }
  }
  if (values.isRead !== 'any') params.is_read = values.isRead === 'read'
  if (values.isFlagged) params.is_flagged = true
  params.folders =
    values.folder && values.folder !== 'all' ? [values.folder] : ['all']
  params.include_subfolders = values.includeSubfolders
  if (values.labels.length > 0) params.labels = values.labels
  if (values.operator === 'OR') params.operator = 'OR'

  return params
}

/** Reverse mapping used to prefill the form when reopening an already-active search. */
export function mailSearchParamsToFormValues(
  params: MailSearchParams
): SearchFormValues {
  const fieldScope: MailSearchFieldScope[] = []
  if (params.subject) fieldScope.push('subject')
  if (params.from) fieldScope.push('sender')
  if (params.to) fieldScope.push('to')
  if (params.text) fieldScope.push('entire_message')

  return {
    fieldScope: fieldScope.length > 0 ? fieldScope : ['subject', 'sender'],
    text: params.text ?? '',
    subject: params.subject ?? '',
    from: params.from ?? '',
    to: params.to ?? '',
    bcc: params.bcc ?? '',
    hasAttachment: params.has_attachment ?? false,
    attachmentType: params.attachment_type ?? [],
    dateRangePreset: dateRangeToPreset(
      params.date_range?.start,
      params.date_range?.end
    ),
    dateFrom: params.date_range?.start ?? '',
    dateTo: params.date_range?.end ?? '',
    sizeOperator: params.size?.operator ?? 'any',
    sizeValue: params.size ? String(params.size.value) : '',
    sizeUnit: params.size?.unit ?? 'kb',
    isRead:
      params.is_read === undefined ? 'any' : params.is_read ? 'read' : 'unread',
    isFlagged: params.is_flagged ?? false,
    folder:
      params.folders && params.folders.length > 0 && params.folders[0] !== 'all'
        ? params.folders[0]
        : 'all',
    includeSubfolders: params.include_subfolders ?? false,
    labels: params.labels ?? [],
    operator: params.operator === 'OR' ? 'OR' : 'AND',
  }
}

/** Recognized `key:value` operators in the advanced search query bar. */
type QueryTokenKey =
  | 'from'
  | 'to'
  | 'bcc'
  | 'subject'
  | 'has'
  | 'type'
  | 'after'
  | 'before'
  | 'size'
  | 'is'
  | 'in'
  | 'label'
  | 'subfolders'
  | 'match'

/** Matches any recognized `key:value` operator anywhere in a string, e.g. "to:jane". */
export const ADVANCED_QUERY_TOKEN_RE =
  /\b(from|to|bcc|subject|has|type|after|before|size|is|in|label|subfolders|match):\S/i

// A single-word value that happens to look like a recognized `key:value`
// token (e.g. a free-text search for literal "to:5") must also be quoted,
// not just multi-word values — otherwise it renders unquoted and gets
// silently reinterpreted as that operator the next time the bar is parsed.
function quoteIfNeeded(value: string): string {
  return /\s/.test(value) || ADVANCED_QUERY_TOKEN_RE.test(value)
    ? `"${value}"`
    : value
}

/**
 * Renders active search params as a advanced-style query string (e.g.
 * `to:jane subject:invoice`) for display/editing in the advanced search bar.
 *
 * The `operator` only ever governs how the match *criteria* (subject/from/
 * to/bcc/free text) combine — scoping filters (has:, type:, after:/before:,
 * is:, in:, subfolders:, label:) are always plain AND constraints on top,
 * regardless of `operator`. When it's OR, that's rendered as a leading
 * `match:any` token (consistent with the rest of the key:value syntax,
 * rather than an inline "OR" keyword — see `applyQueryToken`/parsing below)
 * rather than folded into the criteria themselves, so filters never end up
 * looking like an alternative match (e.g. `from:test OR in:INBOX`, where the
 * folder isn't really an alternative to `from:test`).
 */
export function mailSearchParamsToQueryText(params: MailSearchParams): string {
  const criteria: string[] = []
  const filters: string[] = []
  const push = (key: QueryTokenKey, value: string) => {
    filters.push(`${key}:${quoteIfNeeded(value)}`)
  }

  if (params.subject) criteria.push(`subject:${quoteIfNeeded(params.subject)}`)
  if (params.from) criteria.push(`from:${quoteIfNeeded(params.from)}`)
  if (params.to) criteria.push(`to:${quoteIfNeeded(params.to)}`)
  if (params.bcc) criteria.push(`bcc:${quoteIfNeeded(params.bcc)}`)
  if (params.text) criteria.push(quoteIfNeeded(params.text))

  if (params.has_attachment) filters.push('has:attachment')
  params.attachment_type?.forEach((type) => push('type', type))
  if (params.date_range?.start) push('after', params.date_range.start)
  if (params.date_range?.end) push('before', params.date_range.end)
  if (params.size) push('size', formatSizeToken(params.size))
  if (params.is_read !== undefined) {
    filters.push(params.is_read ? 'is:read' : 'is:unread')
  }
  if (params.is_flagged) filters.push('is:flagged')
  if (
    params.folders &&
    params.folders.length > 0 &&
    params.folders[0] !== 'all'
  ) {
    params.folders.forEach((folder) => push('in', folder))
  }
  if (params.include_subfolders) filters.push('subfolders:true')
  params.labels?.forEach((label) => push('label', label))

  // Always render an explicit "match:any" when the operator is OR, even with
  // zero or one criterion (where AND/OR are currently equivalent): dropping
  // it would lose the user's chosen operator on round-trip through
  // queryTextToSearchFormValues (e.g. re-parsing the query bar after adding
  // a second criterion would silently fall back to AND).
  const matchToken = params.operator === 'OR' ? ['match:any'] : []

  return [...matchToken, ...criteria, ...filters].filter(Boolean).join(' ')
}

// Matches, in order of priority: a `key:"quoted value"` token, a `key:value`
// token, a free-standing `"quoted phrase"`, or a free-standing word.
const QUERY_TOKEN_RE =
  /([A-Za-z]+):"([^"]*)"|([A-Za-z]+):(\S+)|"([^"]*)"|(\S+)/g

function applyQueryToken(
  values: SearchFormValues,
  key: string,
  value: string
): boolean {
  switch (key) {
    case 'from':
      values.from = value
      return true
    case 'to':
      values.to = value
      return true
    case 'bcc':
      values.bcc = value
      return true
    case 'subject':
      values.subject = value
      return true
    case 'has':
      if (value === 'attachment') values.hasAttachment = true
      return value === 'attachment'
    case 'type':
      if (!value) return false
      values.attachmentType = [...values.attachmentType, value]
      return true
    case 'after':
      values.dateFrom = value
      return true
    case 'before':
      values.dateTo = value
      return true
    case 'size': {
      const size = parseSizeToken(value)
      if (!size) return false
      values.sizeOperator = size.operator
      values.sizeValue = String(size.value)
      values.sizeUnit = size.unit
      return true
    }
    case 'is':
      if (value === 'read' || value === 'unread') {
        values.isRead = value
        return true
      }
      if (value === 'flagged' || value === 'starred') {
        values.isFlagged = true
        return true
      }
      return false
    case 'in':
      values.folder = value
      return true
    case 'subfolders':
      if (value === 'true' || value === 'false') {
        values.includeSubfolders = value === 'true'
        return true
      }
      return false
    case 'label':
      if (!value) return false
      values.labels = [...values.labels, value]
      return true
    default:
      return false
  }
}

/**
 * Parses a advanced-style query string (e.g. `match:any to:jane
 * subject:invoice has:attachment`) typed into the search bar back into form
 * values, starting from `base` (used for fields the bar doesn't expose,
 * like `folder`). Unrecognized `key:value` tokens and bare words are folded
 * into `text` (full-text search) rather than dropped. A bare "OR" word is
 * also accepted as an alias for `match:any`, since that's what the bar
 * displays when the OR wouldn't be meaningful (a single criterion) and
 * what a user typing advanced-style syntax by hand would reach for.
 */
export function queryTextToSearchFormValues(
  text: string,
  base: SearchFormValues
): SearchFormValues {
  const values: SearchFormValues = {
    ...base,
    text: '',
    subject: '',
    from: '',
    to: '',
    bcc: '',
    hasAttachment: false,
    attachmentType: [],
    dateRangePreset: 'anytime',
    dateFrom: '',
    dateTo: '',
    sizeOperator: 'any',
    sizeValue: '',
    sizeUnit: 'kb',
    isRead: 'any',
    isFlagged: false,
    includeSubfolders: false,
    labels: [],
    operator: 'AND',
  }

  const freeWords: string[] = []
  let matchOperator: 'AND' | 'OR' | undefined
  let sawBareOr = false

  QUERY_TOKEN_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = QUERY_TOKEN_RE.exec(text))) {
    const [raw, qKey, qVal, key, val, quotedFree, plainFree] = match
    if (qKey !== undefined || key !== undefined) {
      const tokenKey = (qKey ?? key).toLowerCase()
      const tokenValue = qVal ?? val ?? ''
      if (
        tokenKey === 'match' &&
        (tokenValue === 'any' || tokenValue === 'all')
      ) {
        matchOperator = tokenValue === 'any' ? 'OR' : 'AND'
      } else if (!applyQueryToken(values, tokenKey, tokenValue)) {
        freeWords.push(raw)
      }
    } else if (quotedFree !== undefined) {
      freeWords.push(quotedFree)
    } else if (plainFree !== undefined) {
      if (plainFree.toUpperCase() === 'OR') sawBareOr = true
      else freeWords.push(plainFree)
    }
  }

  values.text = freeWords.join(' ')
  values.operator = matchOperator ?? (sawBareOr ? 'OR' : 'AND')
  values.dateRangePreset = dateRangeToPreset(
    values.dateFrom || undefined,
    values.dateTo || undefined
  )

  return values
}

/**
 * Whether `params` can be fully represented by the simple search bar (a
 * single free-text value applied to a chosen combination of subject/sender/
 * to/entire-message). Anything else — bcc, attachments, dates, read/flag
 * status, labels, or differing values across fields — requires the advanced
 * query bar to edit.
 */
/**
 * Pseudo-folder path segment used for the advanced search route
 * (`/u/{account}/advanced-search?...`) so a submitted advanced search is
 * bookmarkable/shareable and survives a reload, unlike the simple bar which
 * stays on whatever real folder it was triggered from.
 */
export const ADVANCED_SEARCH_ROUTE_SEGMENT = 'advanced-search'

const URL_ARRAY_PARAM_SEPARATOR = ','

/**
 * Serializes active search params into URL query params — the counterpart
 * to `urlSearchParamsToMailSearchParams`, used to build/restore the
 * advanced search route.
 */
export function mailSearchParamsToUrlSearchParams(
  params: MailSearchParams
): URLSearchParams {
  const urlParams = new URLSearchParams()
  if (params.text) urlParams.set('text', params.text)
  if (params.subject) urlParams.set('subject', params.subject)
  if (params.from) urlParams.set('from', params.from)
  if (params.to) urlParams.set('to', params.to)
  if (params.bcc) urlParams.set('bcc', params.bcc)
  if (params.has_attachment) urlParams.set('has_attachment', '1')
  if (params.attachment_type && params.attachment_type.length > 0) {
    urlParams.set(
      'attachment_type',
      params.attachment_type.join(URL_ARRAY_PARAM_SEPARATOR)
    )
  }
  if (params.date_range?.start)
    urlParams.set('date_start', params.date_range.start)
  if (params.date_range?.end) urlParams.set('date_end', params.date_range.end)
  if (params.size) urlParams.set('size', formatSizeToken(params.size))
  if (params.is_read !== undefined) {
    urlParams.set('is_read', params.is_read ? 'read' : 'unread')
  }
  if (params.is_flagged) urlParams.set('is_flagged', '1')
  if (
    params.folders &&
    params.folders.length > 0 &&
    params.folders[0] !== 'all'
  ) {
    urlParams.set('folder', params.folders.join(URL_ARRAY_PARAM_SEPARATOR))
  }
  if (params.include_subfolders) urlParams.set('include_subfolders', '1')
  if (params.labels && params.labels.length > 0) {
    urlParams.set('labels', params.labels.join(URL_ARRAY_PARAM_SEPARATOR))
  }
  if (params.operator === 'OR') urlParams.set('operator', 'OR')
  return urlParams
}

/** Reverse of `mailSearchParamsToUrlSearchParams`. */
export function urlSearchParamsToMailSearchParams(
  urlParams: URLSearchParams
): MailSearchParams {
  const params: MailSearchParams = {}
  const text = urlParams.get('text')
  if (text) params.text = text
  const subject = urlParams.get('subject')
  if (subject) params.subject = subject
  const from = urlParams.get('from')
  if (from) params.from = from
  const to = urlParams.get('to')
  if (to) params.to = to
  const bcc = urlParams.get('bcc')
  if (bcc) params.bcc = bcc
  if (urlParams.get('has_attachment') === '1') params.has_attachment = true
  const attachmentType = urlParams.get('attachment_type')
  if (attachmentType) {
    params.attachment_type = attachmentType
      .split(URL_ARRAY_PARAM_SEPARATOR)
      .filter(Boolean)
  }
  const dateStart = urlParams.get('date_start')
  const dateEnd = urlParams.get('date_end')
  if (dateStart || dateEnd) {
    params.date_range = {
      ...(dateStart ? { start: dateStart } : {}),
      ...(dateEnd ? { end: dateEnd } : {}),
    }
  }
  const size = urlParams.get('size')
  if (size) {
    const parsedSize = parseSizeToken(size)
    if (parsedSize) params.size = parsedSize
  }
  const isRead = urlParams.get('is_read')
  if (isRead === 'read' || isRead === 'unread')
    params.is_read = isRead === 'read'
  if (urlParams.get('is_flagged') === '1') params.is_flagged = true
  const folder = urlParams.get('folder')
  params.folders = folder
    ? folder.split(URL_ARRAY_PARAM_SEPARATOR).filter(Boolean)
    : ['all']
  if (urlParams.get('include_subfolders') === '1')
    params.include_subfolders = true
  const labels = urlParams.get('labels')
  if (labels)
    params.labels = labels.split(URL_ARRAY_PARAM_SEPARATOR).filter(Boolean)
  if (urlParams.get('operator') === 'OR') params.operator = 'OR'
  return params
}

/** Builds the bookmarkable/shareable URL for an advanced search's results. */
export function buildAdvancedSearchPath(
  accountId: string,
  params: MailSearchParams
): string {
  const query = mailSearchParamsToUrlSearchParams(params).toString()
  const base = `/u/${accountId}/${ADVANCED_SEARCH_ROUTE_SEGMENT}`
  return query ? `${base}?${query}` : base
}

export function isSimpleBarCompatible(params: MailSearchParams): boolean {
  const hasAdvancedOnlyFields = Boolean(
    params.bcc ||
    params.has_attachment ||
    (params.attachment_type && params.attachment_type.length > 0) ||
    params.date_range?.start ||
    params.date_range?.end ||
    params.size ||
    params.is_read !== undefined ||
    params.is_flagged ||
    params.include_subfolders ||
    (params.labels && params.labels.length > 0)
  )
  if (hasAdvancedOnlyFields) return false

  const textFields = [
    params.subject,
    params.from,
    params.to,
    params.text,
  ].filter((value): value is string => Boolean(value))
  if (new Set(textFields).size > 1) return false
  if (textFields.length > 0 && params.operator !== 'OR') return false

  return true
}
