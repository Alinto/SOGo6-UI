import { actions, operators, ruleConditions, ruleFields } from '../utils'

describe('Mail Filters Utils', () => {
  describe('operators', () => {
    it('should export operators array with correct structure', () => {
      expect(operators).toBeDefined()
      expect(Array.isArray(operators)).toBe(true)
      expect(operators.length).toBeGreaterThan(0)
    })

    it('should have OR operator', () => {
      const orOperator = operators.find((op) => op.value === 'OR')
      expect(orOperator).toBeDefined()
      expect(orOperator?.translateKey).toBe('operators.or.string')
    })

    it('should have AND operator', () => {
      const andOperator = operators.find((op) => op.value === 'AND')
      expect(andOperator).toBeDefined()
      expect(andOperator?.translateKey).toBe('operators.and.string')
    })

    it('should have ALL operator', () => {
      const allOperator = operators.find((op) => op.value === 'ALL')
      expect(allOperator).toBeDefined()
      expect(allOperator?.translateKey).toBe('operators.all.string')
    })

    it('should have id property for each operator', () => {
      operators.forEach((op) => {
        expect(op.id).toBeDefined()
        expect(typeof op.id).toBe('string')
      })
    })
  })

  describe('ruleFields', () => {
    it('should export ruleFields array with correct structure', () => {
      expect(ruleFields).toBeDefined()
      expect(Array.isArray(ruleFields)).toBe(true)
      expect(ruleFields.length).toBeGreaterThan(0)
    })

    it('should have from field', () => {
      const fromField = ruleFields.find((field) => field.value === 'from')
      expect(fromField).toBeDefined()
      expect(fromField?.translateKey).toBe('rules.from.string')
    })

    it('should have to field', () => {
      const toField = ruleFields.find((field) => field.value === 'to')
      expect(toField).toBeDefined()
      expect(toField?.translateKey).toBe('rules.to.string')
    })

    it('should have subject field', () => {
      const subjectField = ruleFields.find((field) => field.value === 'subject')
      expect(subjectField).toBeDefined()
      expect(subjectField?.translateKey).toBe('rules.subject.string')
    })

    it('should have body field', () => {
      const bodyField = ruleFields.find((field) => field.value === 'body')
      expect(bodyField).toBeDefined()
      expect(bodyField?.translateKey).toBe('rules.body.string')
    })

    it('should have cc field', () => {
      const ccField = ruleFields.find((field) => field.value === 'cc')
      expect(ccField).toBeDefined()
      expect(ccField?.translateKey).toBe('rules.cc.string')
    })

    it('should have to_cc field', () => {
      const toCcField = ruleFields.find((field) => field.value === 'to_cc')
      expect(toCcField).toBeDefined()
      expect(toCcField?.translateKey).toBe('rules.to_or_cc.string')
    })

    it('should have header field', () => {
      const headerField = ruleFields.find((field) => field.value === 'header')
      expect(headerField).toBeDefined()
      expect(headerField?.translateKey).toBe('rules.header.string')
    })

    it('should have size field', () => {
      const sizeField = ruleFields.find((field) => field.value === 'size')
      expect(sizeField).toBeDefined()
      expect(sizeField?.translateKey).toBe('rules.size.string')
    })

    it('should have id property for each field', () => {
      ruleFields.forEach((field) => {
        expect(field.id).toBeDefined()
        expect(typeof field.id).toBe('string')
      })
    })
  })

  describe('ruleConditions', () => {
    it('should export ruleConditions array with correct structure', () => {
      expect(ruleConditions).toBeDefined()
      expect(Array.isArray(ruleConditions)).toBe(true)
      expect(ruleConditions.length).toBeGreaterThan(0)
    })

    it('should have IS condition', () => {
      const isCondition = ruleConditions.find((cond) => cond.value === 'IS')
      expect(isCondition).toBeDefined()
      expect(isCondition?.translateKey).toBe('conditions.is.string')
    })

    it('should have IS_NOT condition', () => {
      const isNotCondition = ruleConditions.find(
        (cond) => cond.value === 'IS_NOT'
      )
      expect(isNotCondition).toBeDefined()
      expect(isNotCondition?.translateKey).toBe('conditions.is_not.string')
    })

    it('should have CONTAINS condition', () => {
      const containsCondition = ruleConditions.find(
        (cond) => cond.value === 'CONTAINS'
      )
      expect(containsCondition).toBeDefined()
      expect(containsCondition?.translateKey).toBe('conditions.contains.string')
    })

    it('should have NOT_CONTAIN condition', () => {
      const notContainCondition = ruleConditions.find(
        (cond) => cond.value === 'NOT_CONTAIN'
      )
      expect(notContainCondition).toBeDefined()
      expect(notContainCondition?.translateKey).toBe(
        'conditions.not_contain.string'
      )
    })

    it('should have MATCH condition', () => {
      const matchCondition = ruleConditions.find(
        (cond) => cond.value === 'MATCH'
      )
      expect(matchCondition).toBeDefined()
      expect(matchCondition?.translateKey).toBe('conditions.match.string')
    })

    it('should have NOT_MATCH condition', () => {
      const notMatchCondition = ruleConditions.find(
        (cond) => cond.value === 'NOT_MATCH'
      )
      expect(notMatchCondition).toBeDefined()
      expect(notMatchCondition?.translateKey).toBe(
        'conditions.not_match.string'
      )
    })

    it('should have MATCH_REGEX condition', () => {
      const matchRegexCondition = ruleConditions.find(
        (cond) => cond.value === 'MATCH_REGEX'
      )
      expect(matchRegexCondition).toBeDefined()
      expect(matchRegexCondition?.translateKey).toBe(
        'conditions.match_regex.string'
      )
    })

    it('should have NOT_MATCH_REGEX condition', () => {
      const notMatchRegexCondition = ruleConditions.find(
        (cond) => cond.value === 'NOT_MATCH_REGEX'
      )
      expect(notMatchRegexCondition).toBeDefined()
      expect(notMatchRegexCondition?.translateKey).toBe(
        'conditions.not_match_regex.string'
      )
    })

    it('should have IS_UNDER condition with useOnlyWith property', () => {
      const isUnderCondition = ruleConditions.find(
        (cond) => cond.value === 'IS_UNDER'
      )
      expect(isUnderCondition).toBeDefined()
      expect(isUnderCondition?.translateKey).toBe('conditions.is_under.string')
      expect(isUnderCondition?.useOnlyWith).toContain('size')
    })

    it('should have IS_OVER condition with useOnlyWith property', () => {
      const isOverCondition = ruleConditions.find(
        (cond) => cond.value === 'IS_OVER'
      )
      expect(isOverCondition).toBeDefined()
      expect(isOverCondition?.translateKey).toBe('conditions.is_over.string')
      expect(isOverCondition?.useOnlyWith).toContain('size')
    })

    it('should have id property for each condition', () => {
      ruleConditions.forEach((condition) => {
        expect(condition.id).toBeDefined()
        expect(typeof condition.id).toBe('string')
      })
    })
  })

  describe('actions', () => {
    it('should export actions array with correct structure', () => {
      expect(actions).toBeDefined()
      expect(Array.isArray(actions)).toBe(true)
      expect(actions.length).toBeGreaterThan(0)
    })

    it('should have move action', () => {
      const moveAction = actions.find((action) => action.value === 'move')
      expect(moveAction).toBeDefined()
      expect(moveAction?.translateKey).toBe('actions.move.string')
    })

    it('should have stop action', () => {
      const stopAction = actions.find((action) => action.value === 'stop')
      expect(stopAction).toBeDefined()
      expect(stopAction?.translateKey).toBe('actions.stop.string')
    })

    it('should have flag action', () => {
      const flagAction = actions.find((action) => action.value === 'flag')
      expect(flagAction).toBeDefined()
      expect(flagAction?.translateKey).toBe('actions.flag.string')
    })

    it('should have keep action', () => {
      const keepAction = actions.find((action) => action.value === 'keep')
      expect(keepAction).toBeDefined()
      expect(keepAction?.translateKey).toBe('actions.keep.string')
    })

    it('should have discard action', () => {
      const discardAction = actions.find((action) => action.value === 'discard')
      expect(discardAction).toBeDefined()
      expect(discardAction?.translateKey).toBe('actions.discard.string')
    })

    it('should have forward action', () => {
      const forwardAction = actions.find((action) => action.value === 'forward')
      expect(forwardAction).toBeDefined()
      expect(forwardAction?.translateKey).toBe('actions.forward.string')
    })

    it('should have reject action', () => {
      const rejectAction = actions.find((action) => action.value === 'reject')
      expect(rejectAction).toBeDefined()
      expect(rejectAction?.translateKey).toBe('actions.reject.string')
    })

    it('should have id property for each action', () => {
      actions.forEach((action) => {
        expect(action.id).toBeDefined()
        expect(typeof action.id).toBe('string')
      })
    })
  })

  describe('exports', () => {
    it('should export all required constants', () => {
      expect(operators).toBeDefined()
      expect(ruleFields).toBeDefined()
      expect(ruleConditions).toBeDefined()
      expect(actions).toBeDefined()
    })
  })
})
