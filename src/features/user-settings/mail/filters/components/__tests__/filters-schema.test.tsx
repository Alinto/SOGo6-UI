import { createFiltersSchema } from '../filters-schema'
import { createEmptyFilter } from '../../mail-filters-utils'

const mockTranslate = ((key: string) => {
  const messages: Record<string, string> = {
    'errors.validation.email_invalid.string': 'Enter a valid email address',
    'errors.validation.name_required.string': 'Filter name is required',
    'errors.validation.rules_required.string':
      'At least one condition is required',
    'errors.validation.actions_required.string':
      'At least one action is required',
    'errors.validation.action_unavailable.string':
      'This action is not available yet',
  }
  return messages[key] ?? key
}) as ReturnType<typeof import('next-intl').useTranslations>

describe('filters-schema', () => {
  const filtersSchema = createFiltersSchema(mockTranslate)

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

  it('rejects flag actions in v1', () => {
    const filter = createEmptyFilter()
    filter.name = 'Flag filter'
    filter.rules[0].value = 'test'
    filter.actions[0].action = 'flag'

    const result = filtersSchema.safeParse({ filters: [filter] })
    expect(result.success).toBe(false)
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
})
