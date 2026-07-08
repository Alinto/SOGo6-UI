import { createEmptyFilter } from '../../mail-filters-utils'
import {
  createFiltersSchema,
  createSingleFilterSchema,
  defaultFilterValues,
} from '../filters-schema'

const mockTranslate = ((key: string) => {
  const messages: Record<string, string> = {
    'errors.validation.email_invalid.string': 'Enter a valid email address',
    'errors.validation.name_required.string': 'Filter name is required',
    'errors.validation.rules_required.string':
      'At least one condition is required',
    'errors.validation.actions_required.string':
      'At least one action is required',
    'errors.validation.flag_required.string': 'An IMAP flag is required',
  }
  return messages[key] ?? key
}) as (key: string) => string

describe('filters-schema', () => {
  const filtersSchema = createFiltersSchema(mockTranslate)

  it('exposes defaultFilterValues from createEmptyFilter', () => {
    expect(defaultFilterValues).toMatchObject({
      name: '',
      operator: 'AND',
      enabled: true,
    })
    expect(defaultFilterValues.rules).toHaveLength(1)
    expect(defaultFilterValues.actions).toHaveLength(1)
  })

  it('defaultFilterValues matches a fresh empty filter shape', () => {
    const empty = createEmptyFilter()
    expect(defaultFilterValues.operator).toBe(empty.operator)
    expect(defaultFilterValues.enabled).toBe(empty.enabled)
    expect(defaultFilterValues.rules[0].field).toBe(empty.rules[0].field)
    expect(defaultFilterValues.actions[0].action).toBe(empty.actions[0].action)
  })

  it('exports createSingleFilterSchema', () => {
    expect(typeof createSingleFilterSchema).toBe('function')
  })

  it('accepts a valid filter form payload', () => {
    const filter = createEmptyFilter()
    filter.name = 'My filter'
    filter.rules[0].value = 'example.com'
    filter.actions[0].action = 'keep'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(true)
  })

  it('requires at least one condition for AND filters', () => {
    const filter = createEmptyFilter()
    filter.name = 'Invalid'
    filter.rules = []

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(false)
  })

  it('allows ALL operator without conditions', () => {
    const filter = createEmptyFilter()
    filter.name = 'Catch all'
    filter.operator = 'ALL'
    filter.rules = []
    filter.actions[0].action = 'discard'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(true)
  })

  it('accepts flag action with value', () => {
    const filter = createEmptyFilter()
    filter.name = 'Flag filter'
    filter.rules[0].value = 'test'
    filter.actions[0].action = 'flag'
    filter.actions[0].value = '\\Flagged'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(true)
  })

  it('returns a translated message for invalid forward email', () => {
    const filter = createEmptyFilter()
    filter.name = 'Forward filter'
    filter.rules[0].value = 'test'
    filter.actions[0].action = 'forward'
    filter.actions[0].value = 'not-an-email'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const actionError = result.error.issues.find(
        (issue) => issue.path.join('.') === 'filters.0.actions.0.value'
      )
      expect(actionError?.message).toBe('Enter a valid email address')
    }
  })

  it('allows EXISTS condition without value', () => {
    const filter = createEmptyFilter()
    filter.name = 'Header exists'
    filter.rules[0].field = 'header'
    filter.rules[0].field_value = 'X-Flag'
    filter.rules[0].condition = 'EXISTS'
    filter.rules[0].value = ''
    filter.actions[0].action = 'keep'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(true)
  })

  it('requires value for SIZE_OVER condition', () => {
    const filter = createEmptyFilter()
    filter.name = 'Size filter'
    filter.rules[0].field = 'size'
    filter.rules[0].condition = 'SIZE_OVER'
    filter.rules[0].value = ''
    filter.actions[0].action = 'discard'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(false)
  })

  it('accepts SIZE_UNDER condition with value', () => {
    const filter = createEmptyFilter()
    filter.name = 'Size filter'
    filter.rules[0].field = 'size'
    filter.rules[0].condition = 'SIZE_UNDER'
    filter.rules[0].value = '10M'
    filter.actions[0].action = 'discard'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(true)
  })

  it('requires SIZE_OVER or SIZE_UNDER condition for size field', () => {
    const filter = createEmptyFilter()
    filter.name = 'Size filter'
    filter.rules[0].field = 'size'
    filter.rules[0].condition = 'CONTAINS'
    filter.rules[0].value = '100'
    filter.actions[0].action = 'discard'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(false)
  })
})
