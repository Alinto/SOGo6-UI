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
    it('exposes from, to, subject, header and size', () => {
      expect(ruleFields.map((field) => field.value)).toEqual([
        'from',
        'to',
        'subject',
        'header',
        'size',
      ])
    })
  })

  describe('ruleConditions v1 scope', () => {
    it('exposes supported conditions', () => {
      expect(ruleConditions.map((condition) => condition.value)).toEqual([
        'IS',
        'CONTAINS',
        'NOT_CONTAIN',
        'MATCH',
        'MATCH_REGEX',
        'STARTS_WITH',
        'ENDS_WITH',
        'EXISTS',
        'SIZE_OVER',
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

    it('restricts SIZE_OVER to size field', () => {
      const sizeConditions = getConditionsForField('size').map(
        (condition) => condition.value
      )
      const fromConditions = getConditionsForField('from').map(
        (condition) => condition.value
      )

      expect(sizeConditions).toEqual(['SIZE_OVER'])
      expect(fromConditions).not.toContain('SIZE_OVER')
    })
  })

  describe('actions', () => {
    it('marks flag and reject as disabled', () => {
      expect(getActionOption('flag')?.disabled).toBe(true)
      expect(getActionOption('reject')?.disabled).toBe(true)
      expect(getActionOption('keep')?.disabled).toBeUndefined()
    })

    it('provides disabled tooltip keys for unavailable actions', () => {
      expect(getActionOption('flag')?.disabledReasonKey).toBe(
        'actions.flag.disabled_tooltip.string'
      )
      expect(getActionOption('reject')?.disabledReasonKey).toBe(
        'actions.reject.disabled_tooltip.string'
      )
    })

    it('keeps supported actions enabled', () => {
      ;[
        'move',
        'copy',
        'stop',
        'keep',
        'discard',
        'forward',
        'removeheader',
      ].forEach((action) => {
        expect(actions.find((item) => item.value === action)?.disabled).toBe(
          undefined
        )
      })
    })
  })
})
