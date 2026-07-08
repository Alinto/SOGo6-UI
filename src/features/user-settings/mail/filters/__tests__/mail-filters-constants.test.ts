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
      'cc',
      'to or cc',
      'subject',
      'header',
      'body',
      'size',
    ])
    expect(V1_FILTER_CONDITIONS).toContain('CONTAINS')
    expect(V1_FILTER_CONDITIONS).toContain('NOT_CONTAIN')
    expect(V1_FILTER_CONDITIONS).toContain('SIZE_OVER')
    expect(V1_FILTER_CONDITIONS).toContain('SIZE_UNDER')
  })

  it('maps UI conditions to API values and back', () => {
    expect(UI_CONDITION_TO_API.CONTAINS).toBe('contains')
    expect(UI_CONDITION_TO_API.NOT_CONTAIN).toBe('notcontains')
    expect(API_CONDITION_TO_UI.contains).toBe('CONTAINS')
    expect(API_CONDITION_TO_UI.notcontains).toBe('NOT_CONTAIN')
    expect(UI_CONDITION_TO_API.SIZE_OVER).toBe('over')
    expect(UI_CONDITION_TO_API.SIZE_UNDER).toBe('under')
    expect(API_CONDITION_TO_UI.over).toBe('SIZE_OVER')
    expect(API_CONDITION_TO_UI.under).toBe('SIZE_UNDER')
  })

  it('maps UI actions to API methods and back', () => {
    expect(UI_ACTION_TO_API_METHOD.move).toBe('fileinto')
    expect(UI_ACTION_TO_API_METHOD.copy).toBe('fileinto')
    expect(UI_ACTION_TO_API_METHOD.forward).toBe('redirect')
    expect(UI_ACTION_TO_API_METHOD.flag).toBe('addflag')
    expect(UI_ACTION_TO_API_METHOD.reject).toBe('reject')
    expect(API_METHOD_TO_UI_ACTION.fileinto).toBe('move')
    expect(API_METHOD_TO_UI_ACTION.addflag).toBe('flag')
  })

  it('exposes supported operators and defaults', () => {
    expect(FILTER_OPERATORS).toEqual(['AND', 'OR', 'ALL'])
    expect(DEFAULT_CREATE_IF_NO_EXIST).toBe(true)
    expect(FILTER_NAME_MAX_LENGTH).toBe(128)
  })
})
