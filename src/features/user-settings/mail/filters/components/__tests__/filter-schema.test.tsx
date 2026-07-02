import { createEmptyFilter } from '../../mail-filters-utils'
import {
  createFiltersSchema,
  createSingleFilterSchema,
  defaultFilterValues,
} from '../filter-schema'

describe('filter-schema', () => {
  it('re-exports createFiltersSchema and createSingleFilterSchema', () => {
    expect(typeof createFiltersSchema).toBe('function')
    expect(typeof createSingleFilterSchema).toBe('function')
  })

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
})
