import type { ApiFilterItem } from '../mail-filters-api-types'
import type { MailFilter } from '../mail-filters-types'
import {
  mapApiFilterToUi,
  mapApiFiltersToUi,
  mapApiRuleTreeToFlatRules,
  mapFlatRulesToApiTree,
  mapUiFilterToApi,
  mapUiFiltersToApi,
} from '../mail-filters-utils'

describe('mail-filters-utils', () => {
  const sampleApiFilter: ApiFilterItem = {
    name: 'test header',
    enabled: true,
    actions: [
      {
        method: 'fileinto',
        arguments: {
          folders: ['Trash'],
          create_if_no_exist: true,
        },
      },
    ],
    rules: {
      op: 'or',
      rules: [
        {
          field: 'header',
          operator: 'contains',
          custom_header: 'X-Alinto-Pub',
          value: 'rule1',
          case_sensitive: false,
        },
      ],
    },
  }

  describe('mapApiRuleTreeToFlatRules', () => {
    it('maps OR group with leaf rules', () => {
      const result = mapApiRuleTreeToFlatRules(sampleApiFilter.rules)
      expect(result.operator).toBe('OR')
      expect(result.rules).toHaveLength(1)
      expect(result.rules[0].field).toBe('header')
      expect(result.rules[0].field_value).toBe('X-Alinto-Pub')
      expect(result.advancedStructure).toBe(false)
    })

    it('maps empty rules to ALL operator', () => {
      const result = mapApiRuleTreeToFlatRules({ op: 'and', rules: [] })
      expect(result.operator).toBe('ALL')
      expect(result.rules).toHaveLength(0)
    })

    it('flags nested groups as advanced structure', () => {
      const nested = {
        op: 'and' as const,
        rules: [
          {
            op: 'or' as const,
            rules: [{ field: 'from', operator: 'contains', value: 'a' }],
          },
        ],
      }
      const result = mapApiRuleTreeToFlatRules(nested)
      expect(result.advancedStructure).toBe(true)
    })
  })

  describe('mapFlatRulesToApiTree', () => {
    it('maps AND operator to and group', () => {
      const tree = mapFlatRulesToApiTree('AND', [
        {
          id: '1',
          field: 'from',
          condition: 'CONTAINS',
          value: 'alinto.eu',
        },
      ])
      expect(tree).toEqual({
        op: 'and',
        rules: [{ field: 'from', operator: 'contains', value: 'alinto.eu' }],
      })
    })

    it('maps ALL operator to empty and group', () => {
      expect(mapFlatRulesToApiTree('ALL', [])).toEqual({ op: 'and', rules: [] })
    })
  })

  describe('mapApiFilterToUi / mapUiFilterToApi', () => {
    it('maps enabled to boolean', () => {
      const ui = mapApiFilterToUi(sampleApiFilter)
      expect(ui.enabled).toBe(true)
      expect(ui.name).toBe('test header')
      expect(ui.operator).toBe('OR')
    })

    it('maps fileinto action to move', () => {
      const ui = mapApiFilterToUi(sampleApiFilter)
      expect(ui.actions[0].action).toBe('move')
      expect(ui.actions[0].value).toBe('Trash')
      expect(ui.actions[0].createIfNotExist).toBe(true)
    })

    it('maps redirect action to forward', () => {
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        actions: [
          { method: 'redirect', arguments: { addresses: ['a@b.com'] } },
        ],
      })
      expect(ui.actions[0].action).toBe('forward')
      expect(ui.actions[0].value).toBe('a@b.com')
    })

    it('maps fileinto with keep_copy to copy', () => {
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        actions: [
          {
            method: 'fileinto',
            arguments: {
              folders: ['Archive'],
              create_if_no_exist: false,
              keep_copy: true,
            },
          },
        ],
      })
      expect(ui.actions[0].action).toBe('copy')
      expect(ui.actions[0].value).toBe('Archive')
      expect(ui.actions[0].createIfNotExist).toBe(false)
    })

    it('maps addflag action to flag', () => {
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        actions: [{ method: 'addflag', arguments: { flags: ['\\Flagged'] } }],
      })
      expect(ui.actions[0].action).toBe('flag')
      expect(ui.actions[0].value).toBe('\\Flagged')
    })

    it('maps size over/under operators', () => {
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        rules: {
          op: 'and',
          rules: [
            { field: 'size', operator: 'over', value: '5M' },
            { field: 'size', operator: 'under', value: '10M' },
          ],
        },
      })

      expect(ui.rules.map((rule) => rule.condition)).toEqual([
        'SIZE_OVER',
        'SIZE_UNDER',
      ])
    })

    it('uses stable ids when mapping from API', () => {
      const first = mapApiFilterToUi(sampleApiFilter)
      const second = mapApiFilterToUi(sampleApiFilter)
      expect(first.id).toBe(second.id)
      expect(first.rules[0].id).toBe(second.rules[0].id)
    })

    it('marks filters with unsupported actions as read-only and preserves them on save', () => {
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        actions: [{ method: 'notify', arguments: { method: 'mailto' } }],
      })

      expect(ui.readOnly).toBe(true)
      expect(ui.actions[0].unsupportedAction).toBe(true)

      const api = mapUiFilterToApi(ui)
      expect(api.actions[0].method).toBe('notify')
    })

    it('preserves rawRules for advanced structure filters', () => {
      const nestedRules = {
        op: 'and' as const,
        rules: [
          {
            op: 'or' as const,
            rules: [{ field: 'from', operator: 'contains', value: 'a' }],
          },
        ],
      }
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        rules: nestedRules,
      })

      expect(ui.readOnly).toBe(true)
      expect(ui.rawRules).toEqual(nestedRules)

      const api = mapUiFilterToApi(ui)
      expect(api.rules).toEqual(nestedRules)
    })

    it('preserves case_sensitive on rules round-trip', () => {
      const ui = mapApiFilterToUi({
        ...sampleApiFilter,
        rules: {
          op: 'and',
          rules: [
            {
              field: 'subject',
              operator: 'contains',
              value: 'Hello',
              case_sensitive: false,
            },
          ],
        },
      })

      const api = mapUiFilterToApi(ui)
      expect(api.rules).toEqual({
        op: 'and',
        rules: [
          {
            field: 'subject',
            operator: 'contains',
            value: 'Hello',
            case_sensitive: false,
          },
        ],
      })
    })

    it('round-trips copy as fileinto with keep_copy', () => {
      const ui: MailFilter = {
        id: 'ui-copy',
        name: 'Copy filter',
        operator: 'AND',
        enabled: true,
        rules: [
          { id: 'r1', field: 'from', condition: 'CONTAINS', value: 'test' },
        ],
        actions: [
          {
            id: 'a1',
            action: 'copy',
            value: 'Archive',
            createIfNotExist: true,
          },
        ],
      }

      const api = mapUiFilterToApi(ui)
      expect(api.actions).toEqual([
        {
          method: 'fileinto',
          arguments: {
            folders: ['Archive'],
            create_if_no_exist: true,
            keep_copy: true,
          },
        },
      ])
    })

    it('round-trips AND filter preserving semantic fields', () => {
      const ui: MailFilter = {
        id: 'ui-1',
        name: 'Filter 1',
        operator: 'AND',
        enabled: true,
        rules: [
          {
            id: 'r1',
            field: 'from',
            condition: 'CONTAINS',
            value: 'alinto.eu',
          },
        ],
        actions: [
          {
            id: 'a1',
            action: 'move',
            value: 'INBOX',
            createIfNotExist: true,
          },
        ],
      }

      const api = mapUiFilterToApi(ui)
      expect(api.enabled).toBe(true)
      expect(api.name).toBe('Filter 1')
      expect(api.rules).toEqual({
        op: 'and',
        rules: [{ field: 'from', operator: 'contains', value: 'alinto.eu' }],
      })
      expect(api.actions[0]).toEqual({
        method: 'fileinto',
        arguments: {
          folders: ['INBOX'],
          create_if_no_exist: true,
          keep_copy: false,
        },
      })
    })

    it('maps flag and reject actions when saving', () => {
      const ui: MailFilter = {
        id: 'ui-2',
        name: 'Filter 2',
        operator: 'AND',
        enabled: false,
        rules: [
          { id: 'r1', field: 'subject', condition: 'IS', value: 'test' },
        ],
        actions: [
          { id: 'a1', action: 'flag', value: '\\Flagged' },
          { id: 'a2', action: 'reject', value: 'Blocked' },
          { id: 'a3', action: 'keep', value: '' },
        ],
      }
      const api = mapUiFilterToApi(ui)
      expect(api.actions).toHaveLength(3)
      expect(api.actions[0]).toEqual({
        method: 'addflag',
        arguments: { flags: ['\\Flagged'] },
      })
      expect(api.actions[1]).toEqual({
        method: 'reject',
        arguments: { message: 'Blocked' },
      })
      expect(api.enabled).toBe(false)
    })
  })

  describe('mapApiFiltersToUi / mapUiFiltersToApi', () => {
    it('preserves order of filters', () => {
      const items: ApiFilterItem[] = [
        { ...sampleApiFilter, name: 'first' },
        { ...sampleApiFilter, name: 'second' },
      ]
      const ui = mapApiFiltersToUi(items)
      expect(ui.map((f) => f.name)).toEqual(['first', 'second'])

      const back = mapUiFiltersToApi(ui)
      expect(back.map((f) => f.name)).toEqual(['first', 'second'])
    })
  })
})
