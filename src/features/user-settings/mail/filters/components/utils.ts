const operators = [
  {
    id: '1',
    value: 'OR',
    translateKey: 'US_MAIL_FILTERS.operators.or.string',
  },
  {
    id: '1',
    value: 'AND',
    translateKey: 'US_MAIL_FILTERS.operators.and.string',
  },
  {
    id: '1',
    value: 'ALL',
    translateKey: 'US_MAIL_FILTERS.operators.all.string',
  },
]

const ruleFields = [
  {
    id: '1',
    value: 'from',
    translateKey: 'US_MAIL_FILTERS.rules.from.string',
  },
  {
    id: '2',
    value: 'to',
    translateKey: 'US_MAIL_FILTERS.rules.to.string',
  },
  {
    id: '3',
    value: 'subject',
    translateKey: 'US_MAIL_FILTERS.rules.subject.string',
  },
  {
    id: '4',
    value: 'body',
    translateKey: 'US_MAIL_FILTERS.rules.body.string',
  },
  {
    id: '5',
    value: 'cc',
    translateKey: 'rules.cc.string',
  },
  {
    id: '6',
    value: 'to_cc',
    translateKey: 'rules.to_or_cc.string',
  },
  {
    id: '7',
    value: 'header',
    translateKey: 'rules.header.string',
  },
  {
    id: '8',
    value: 'size',
    translateKey: 'rules.size.string',
  },
]

const ruleConditions = [
  {
    id: '1',
    value: 'IS',
    translateKey: 'conditions.is.string',
  },
  {
    id: '2',
    value: 'IS_NOT',
    translateKey: 'conditions.is_not.string',
  },
  {
    id: '3',
    value: 'CONTAINS',
    translateKey: 'conditions.contains.string',
  },
  {
    id: '4',
    value: 'NOT_CONTAIN',
    translateKey: 'conditions.not_contain.string',
  },
  {
    id: '5',
    value: 'MATCH',
    translateKey: 'conditions.match.string',
  },
  {
    id: '6',
    value: 'NOT_MATCH',
    translateKey: 'conditions.not_match.string',
  },
  {
    id: '7',
    value: 'MATCH_REGEX',
    translateKey: 'conditions.match_regex.string',
  },
  {
    id: '8',
    value: 'NOT_MATCH_REGEX',
    translateKey: 'conditions.not_match_regex.string',
  },
  {
    id: '9',
    value: 'IS_UNDER',
    translateKey: 'conditions.is_under.string',
    useOnlyWith: ['size'],
  },
  {
    id: '10',
    value: 'IS_OVER',
    translateKey: 'conditions.is_over.string',
    useOnlyWith: ['size'],
  },
]

const actions = [
  {
    id: '1',
    value: 'move',
    translateKey: 'actions.move.string',
  },
  {
    id: '2',
    value: 'stop',
    translateKey: 'actions.stop.string',
  },
  {
    id: '3',
    value: 'flag',
    translateKey: 'actions.flag.string',
  },
  {
    id: '4',
    value: 'keep',
    translateKey: 'actions.keep.string',
  },
  {
    id: '5',
    value: 'discard',
    translateKey: 'actions.discard.string',
  },
  {
    id: '6',
    value: 'forward',
    translateKey: 'actions.forward.string',
  },
  {
    id: '7',
    value: 'reject',
    translateKey: 'actions.reject.string',
  },
]

export { actions, operators, ruleConditions, ruleFields }
