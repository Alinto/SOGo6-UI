import { actions, getActionOption, operators, ruleConditions, ruleFields } from '../utils'

describe('Mail Filters Utils', () => {
  describe('operators', () => {
    it('exports AND, OR and ALL operators', () => {
      expect(operators.map((op) => op.value)).toEqual(['OR', 'AND', 'ALL'])
    })
  })

  describe('ruleFields v1 scope', () => {
    it('only exposes from, to, subject and header', () => {
      expect(ruleFields.map((field) => field.value)).toEqual([
        'from',
        'to',
        'subject',
        'header',
      ])
    })
  })

  describe('ruleConditions v1 scope', () => {
    it('exposes supported conditions only', () => {
      expect(ruleConditions.map((condition) => condition.value)).toEqual([
        'IS',
        'CONTAINS',
        'NOT_CONTAIN',
        'MATCH',
        'MATCH_REGEX',
      ])
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
      ;['move', 'stop', 'keep', 'discard', 'forward'].forEach((action) => {
        expect(actions.find((item) => item.value === action)?.disabled).toBe(
          undefined
        )
      })
    })
  })
})
