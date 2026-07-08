import {
  actions,
  getActionOption,
  getConditionsForField,
  operators,
  ruleConditions,
  ruleFields,
} from '../utils'

describe('Mail Filters Utils', () => {
  describe('operators', () => {
    it('exports AND, OR and ALL operators', () => {
      expect(operators.map((op) => op.value)).toEqual(['OR', 'AND', 'ALL'])
    })
  })

  describe('ruleFields v1 scope', () => {
    it('exposes extended field list', () => {
      expect(ruleFields.map((field) => field.value)).toEqual([
        'from',
        'to',
        'cc',
        'to or cc',
        'subject',
        'header',
        'body',
        'size',
      ])
    })
  })

  describe('ruleConditions v1 scope', () => {
    it('exposes supported conditions', () => {
      expect(ruleConditions.map((condition) => condition.value)).toEqual([
        'IS',
        'IS_NOT',
        'CONTAINS',
        'NOT_CONTAIN',
        'MATCH',
        'NOT_MATCH',
        'MATCH_REGEX',
        'NOT_REGEX',
        'EXISTS',
        'NOT_EXISTS',
        'SIZE_OVER',
        'SIZE_UNDER',
      ])
    })

    it('restricts EXISTS to header field', () => {
      const headerConditions = getConditionsForField('header').map(
        (condition) => condition.value
      )
      const fromConditions = getConditionsForField('from').map(
        (condition) => condition.value
      )

      expect(headerConditions).toContain('EXISTS')
      expect(fromConditions).not.toContain('EXISTS')
    })

    it('restricts size operators to size field', () => {
      const sizeConditions = getConditionsForField('size').map(
        (condition) => condition.value
      )
      const fromConditions = getConditionsForField('from').map(
        (condition) => condition.value
      )

      expect(sizeConditions).toEqual(['SIZE_OVER', 'SIZE_UNDER'])
      expect(fromConditions).not.toContain('SIZE_OVER')
    })
  })

  describe('actions', () => {
    it('enables flag and reject actions', () => {
      expect(getActionOption('flag')?.disabled).toBeUndefined()
      expect(getActionOption('reject')?.disabled).toBeUndefined()
      expect(getActionOption('keep')?.disabled).toBeUndefined()
    })

    it('keeps supported actions enabled', () => {
      ;['move', 'copy', 'stop', 'keep', 'discard', 'forward', 'flag', 'reject'].forEach(
        (action) => {
          expect(actions.find((item) => item.value === action)?.disabled).toBe(
            undefined
          )
        }
      )
    })
  })
})
