const operators = [
  {
    id: '1',
    value: 'OR',
    translateKey: 'operators.or',
  },
  {
    id: '1',
    value: 'AND',
    translateKey: 'operators.and',
  },
  {
    id: '1',
    value: 'ALL',
    translateKey: 'operators.all',
  },
]

const ruleFields = [
  {
    id: '1',
    value: 'from',
    translateKey: 'rules.from',
  },
  {
    id: '2',
    value: 'to',
    translateKey: 'rules.to',
  },
  {
    id: '3',
    value: 'subject',
    translateKey: 'rules.subject',
  },
  {
    id: '4',
    value: 'body',
    translateKey: 'rules.body',
  },
  {
    id: '5',
    value: 'cc',
    translateKey: 'rules.cc',
  },
  {
    id: '6',
    value: 'to_cc',
    translateKey: 'rules.to_or_cc',
  },
  {
    id: '7',
    value: 'header',
    translateKey: 'rules.header',
  },
  {
    id: '8',
    value: 'size',
    translateKey: 'rules.size',
  },
]

const ruleConditions = [
  {
    id: '1',
    value: 'IS',
    translateKey: 'conditions.is',
  },
  {
    id: '2',
    value: 'IS_NOT',
    translateKey: 'conditions.is_not',
  },
  {
    id: '3',
    value: 'CONTAINS',
    translateKey: 'conditions.contains',
  },
  {
    id: '4',
    value: 'NOT_CONTAIN',
    translateKey: 'conditions.not_contain',
  },
  {
    id: '5',
    value: 'MATCH',
    translateKey: 'conditions.match',
  },
  {
    id: '6',
    value: 'NOT_MATCH',
    translateKey: 'conditions.not_match',
  },
  {
    id: '7',
    value: 'MATCH_REGEX',
    translateKey: 'conditions.match_regex',
  },
  {
    id: '8',
    value: 'NOT_MATCH_REGEX',
    translateKey: 'conditions.not_match_regex',
  },
  {
    id: '9',
    value: 'IS_UNDER',
    translateKey: 'conditions.is_under',
    useOnlyWith: ['size'],
  },
  {
    id: '10',
    value: 'IS_OVER',
    translateKey: 'operators.is_over',
    useOnlyWith: ['size'],
  },
]

const actions = [
  {
    id: '1',
    value: 'move',
    translateKey: 'actions.move',
  },
  {
    id: '2',
    value: 'stop',
    translateKey: 'actions.stop',
  },
  {
    id: '3',
    value: 'flag',
    translateKey: 'actions.flag',
  },
  {
    id: '4',
    value: 'keep',
    translateKey: 'actions.keep',
  },
  {
    id: '5',
    value: 'discard',
    translateKey: 'actions.discard',
  },
  {
    id: '6',
    value: 'forward',
    translateKey: 'actions.forward',
  },
  {
    id: '7',
    value: 'reject',
    translateKey: 'actions.reject',
  },
]

export { actions, operators, ruleConditions, ruleFields }
