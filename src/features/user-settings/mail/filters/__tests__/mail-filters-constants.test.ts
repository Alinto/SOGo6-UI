import {
  API_CONDITION_TO_UI,
  API_METHOD_TO_UI_ACTION,
  DEFAULT_CREATE_IF_NO_EXIST,
  FILTER_NAME_MAX_LENGTH,
  FILTER_OPERATORS,
  UI_ACTION_TO_API_METHOD,
  UI_CONDITION_TO_API,
  V1_FILTER_CONDITIONS,
  V1_FILTER_FIELDS,
} from '../mail-filters-constants'

describe('mail-filters-constants', () => {
  it('defines v1 filter fields and conditions', () => {
    expect(V1_FILTER_FIELDS).toEqual([
      'from',
      'to',
      'subject',
      'header',
      'size',
    ])
    expect(V1_FILTER_CONDITIONS).toContain('CONTAINS')
    expect(V1_FILTER_CONDITIONS).toContain('STARTS_WITH')
    expect(V1_FILTER_CONDITIONS).toContain('SIZE_OVER')
  })

  it('maps UI conditions to API values and back', () => {
    expect(UI_CONDITION_TO_API.CONTAINS).toBe('contains')
    expect(API_CONDITION_TO_UI.contains).toBe('CONTAINS')
    expect(API_CONDITION_TO_UI['not-contains']).toBe('NOT_CONTAIN')
    expect(UI_CONDITION_TO_API.STARTS_WITH).toBe('starts-with')
    expect(API_CONDITION_TO_UI.exists).toBe('EXISTS')
    expect(API_CONDITION_TO_UI.size).toBe('SIZE_OVER')
  })

  it('maps UI actions to API methods and back', () => {
    expect(UI_ACTION_TO_API_METHOD.move).toBe('fileinto')
    expect(UI_ACTION_TO_API_METHOD.copy).toBe('copy')
    expect(UI_ACTION_TO_API_METHOD.removeheader).toBe('removeheader')
    expect(UI_ACTION_TO_API_METHOD.forward).toBe('redirect')
    expect(API_METHOD_TO_UI_ACTION.fileinto).toBe('move')
    expect(API_METHOD_TO_UI_ACTION.copy).toBe('copy')
    expect(API_METHOD_TO_UI_ACTION.removeheader).toBe('removeheader')
  })

  it('exposes supported operators and defaults', () => {
    expect(FILTER_OPERATORS).toEqual(['AND', 'OR', 'ALL'])
    expect(DEFAULT_CREATE_IF_NO_EXIST).toBe(true)
    expect(FILTER_NAME_MAX_LENGTH).toBe(128)
  })
})
