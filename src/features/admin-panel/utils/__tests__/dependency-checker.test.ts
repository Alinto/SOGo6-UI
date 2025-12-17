import { ConfigOption } from '../../types'
import {
  getAllVisibleDescendants,
  getVisibleChildren,
  hasVisibleDescendants,
  isDependencyMet,
  parseDependency,
  type ParsedDependency,
} from '../dependency-checker'

describe('parseDependency', () => {
  it('parses valid dependency string correctly', () => {
    const result = parseDependency('US_TYPE%%%equal%%%ldap')
    expect(result).toEqual({
      fieldName: 'US_TYPE',
      operator: 'equal',
      value: 'ldap',
    })
  })

  it('returns null for null input', () => {
    const result = parseDependency(null)
    expect(result).toBeNull()
  })

  it('returns null for empty string', () => {
    const result = parseDependency('')
    expect(result).toBeNull()
  })

  it('returns null for invalid format with fewer parts', () => {
    const result = parseDependency('US_TYPE%%%equal')
    expect(result).toBeNull()
  })

  it('returns null for invalid format with more parts', () => {
    const result = parseDependency('US_TYPE%%%equal%%%ldap%%%extra')
    expect(result).toBeNull()
  })

  it('handles empty values in parts', () => {
    const result = parseDependency('FIELD%%%operator%%%')
    expect(result).toEqual({
      fieldName: 'FIELD',
      operator: 'operator',
      value: '',
    })
  })

  it('handles special characters in field name', () => {
    const result = parseDependency('FIELD_NAME_123%%%equal%%%value')
    expect(result).toEqual({
      fieldName: 'FIELD_NAME_123',
      operator: 'equal',
      value: 'value',
    })
  })
})

describe('isDependencyMet', () => {
  describe('equal operator', () => {
    it('returns true when values are equal', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'equal',
        value: 'ldap',
      }
      expect(isDependencyMet(dependency, 'ldap')).toBe(true)
    })

    it('returns false when values are not equal', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'equal',
        value: 'ldap',
      }
      expect(isDependencyMet(dependency, 'mysql')).toBe(false)
    })

    it('converts parent value to string for comparison', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'equal',
        value: '123',
      }
      expect(isDependencyMet(dependency, 123)).toBe(true)
    })
  })

  describe('notequal operator', () => {
    it('returns true when values are not equal', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notequal',
        value: 'ldap',
      }
      expect(isDependencyMet(dependency, 'mysql')).toBe(true)
    })

    it('returns false when values are equal', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notequal',
        value: 'ldap',
      }
      expect(isDependencyMet(dependency, 'ldap')).toBe(false)
    })
  })

  describe('contains operator', () => {
    it('returns true when array contains value', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'contains',
        value: 'item2',
      }
      expect(isDependencyMet(dependency, ['item1', 'item2', 'item3'])).toBe(
        true
      )
    })

    it('returns false when array does not contain value', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'contains',
        value: 'item4',
      }
      expect(isDependencyMet(dependency, ['item1', 'item2', 'item3'])).toBe(
        false
      )
    })

    it('returns false when parent value is not an array', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'contains',
        value: 'value',
      }
      expect(isDependencyMet(dependency, 'string')).toBe(false)
    })

    it('returns false when parent value is null', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'contains',
        value: 'value',
      }
      expect(isDependencyMet(dependency, null)).toBe(false)
    })
  })

  describe('notcontains operator', () => {
    it('returns true when array does not contain value', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notcontains',
        value: 'item4',
      }
      expect(isDependencyMet(dependency, ['item1', 'item2', 'item3'])).toBe(
        true
      )
    })

    it('returns false when array contains value', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notcontains',
        value: 'item2',
      }
      expect(isDependencyMet(dependency, ['item1', 'item2', 'item3'])).toBe(
        false
      )
    })

    it('returns false when parent value is not an array', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notcontains',
        value: 'value',
      }
      expect(isDependencyMet(dependency, 'string')).toBe(false)
    })
  })

  describe('greaterthan operator', () => {
    it('returns true when parent value is greater', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'greaterthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, 20)).toBe(true)
    })

    it('returns false when parent value is less', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'greaterthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, 5)).toBe(false)
    })

    it('returns false when parent value is equal', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'greaterthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, 10)).toBe(false)
    })

    it('handles string numbers', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'greaterthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, '20')).toBe(true)
    })
  })

  describe('lessthan operator', () => {
    it('returns true when parent value is less', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'lessthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, 5)).toBe(true)
    })

    it('returns false when parent value is greater', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'lessthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, 20)).toBe(false)
    })

    it('returns false when parent value is equal', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'lessthan',
        value: '10',
      }
      expect(isDependencyMet(dependency, 10)).toBe(false)
    })
  })

  describe('exists operator', () => {
    it('returns true when value exists', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'exists',
        value: '',
      }
      expect(isDependencyMet(dependency, 'value')).toBe(true)
    })

    it('returns true for empty string', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'exists',
        value: '',
      }
      expect(isDependencyMet(dependency, '')).toBe(true)
    })

    it('returns true for zero', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'exists',
        value: '',
      }
      expect(isDependencyMet(dependency, 0)).toBe(true)
    })

    it('returns true for false', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'exists',
        value: '',
      }
      expect(isDependencyMet(dependency, false)).toBe(true)
    })

    it('returns false for null', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'exists',
        value: '',
      }
      expect(isDependencyMet(dependency, null)).toBe(false)
    })

    it('returns false for undefined', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'exists',
        value: '',
      }
      expect(isDependencyMet(dependency, undefined)).toBe(false)
    })
  })

  describe('notexists operator', () => {
    it('returns true for null', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notexists',
        value: '',
      }
      expect(isDependencyMet(dependency, null)).toBe(true)
    })

    it('returns true for undefined', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notexists',
        value: '',
      }
      expect(isDependencyMet(dependency, undefined)).toBe(true)
    })

    it('returns false when value exists', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notexists',
        value: '',
      }
      expect(isDependencyMet(dependency, 'value')).toBe(false)
    })

    it('returns false for empty string', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notexists',
        value: '',
      }
      expect(isDependencyMet(dependency, '')).toBe(false)
    })

    it('returns false for zero', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'notexists',
        value: '',
      }
      expect(isDependencyMet(dependency, 0)).toBe(false)
    })
  })

  describe('unknown operator', () => {
    it('returns false for unknown operator', () => {
      const dependency: ParsedDependency = {
        fieldName: 'field',
        operator: 'unknown',
        value: 'value',
      }
      expect(isDependencyMet(dependency, 'value')).toBe(false)
    })
  })
})

describe('getVisibleChildren', () => {
  it('returns empty array when field has no children', () => {
    const field = { value: 'ldap' }
    expect(getVisibleChildren(field)).toEqual([])
  })

  it('returns empty array when children array is empty', () => {
    const field = { value: 'ldap', children: [] }
    expect(getVisibleChildren(field)).toEqual([])
  })

  it('returns all children when they have no dependencies', () => {
    const field = {
      value: 'ldap',
      children: [
        { depends: null, value: 'child1' },
        { depends: null, value: 'child2' },
      ],
    }
    expect(getVisibleChildren(field)).toHaveLength(2)
  })

  it('filters children based on dependency', () => {
    const field = {
      value: 'ldap',
      children: [
        { depends: 'field%%%equal%%%ldap', value: 'child1' },
        { depends: 'field%%%equal%%%mysql', value: 'child2' },
      ],
    }
    const visible = getVisibleChildren(field)
    expect(visible).toHaveLength(1)
    expect(visible[0].value).toBe('child1')
  })

  it('includes children with null depends', () => {
    const field = {
      value: 'ldap',
      children: [
        { depends: 'field%%%equal%%%ldap', value: 'child1' },
        { depends: null, value: 'child2' },
        { depends: 'field%%%equal%%%mysql', value: 'child3' },
      ],
    }
    const visible = getVisibleChildren(field)
    expect(visible).toHaveLength(2)
    expect(visible[0].value).toBe('child1')
    expect(visible[1].value).toBe('child2')
  })

  it('handles children with invalid dependency format', () => {
    const field = {
      value: 'ldap',
      children: [
        { depends: 'invalid', value: 'child1' },
        { depends: 'field%%%equal%%%ldap', value: 'child2' },
      ],
    }
    const visible = getVisibleChildren(field)
    expect(visible).toHaveLength(2) // Invalid dependency is treated as always visible
  })

  it('returns only direct children, not grandchildren', () => {
    const field = {
      value: 'ldap',
      children: [
        {
          depends: 'field%%%equal%%%ldap',
          value: 'child1',
          children: [
            { depends: null, value: 'grandchild1' },
            { depends: null, value: 'grandchild2' },
          ],
        },
      ],
    }
    const visible = getVisibleChildren(field)
    expect(visible).toHaveLength(1)
    expect(visible[0].value).toBe('child1')
  })
})

describe('getAllVisibleDescendants', () => {
  it('returns empty array when field has no children', () => {
    const field = { value: 'ldap' }
    expect(getAllVisibleDescendants(field)).toEqual([])
  })

  it('returns empty array when children array is empty', () => {
    const field = { value: 'ldap', children: [] }
    expect(getAllVisibleDescendants(field)).toEqual([])
  })

  it('returns all descendants when they have no dependencies', () => {
    const field = {
      value: 'ldap',
      children: [
        {
          depends: null,
          value: 'child1',
          children: [
            { depends: null, value: 'grandchild1' },
            { depends: null, value: 'grandchild2' },
          ],
        },
        { depends: null, value: 'child2' },
      ],
    }
    const descendants = getAllVisibleDescendants(field)
    expect(descendants).toHaveLength(4) // child1, grandchild1, grandchild2, child2
  })

  it('filters descendants based on dependencies', () => {
    type TestField = {
      depends: string | null
      value: string
      children?: TestField[]
    }
    const field: { value: string; children: TestField[] } = {
      value: 'ldap',
      children: [
        {
          depends: 'field%%%equal%%%ldap',
          value: 'child1',
          children: [
            { depends: 'child1%%%equal%%%child1', value: 'grandchild1' },
            { depends: 'child1%%%equal%%%other', value: 'grandchild2' },
          ],
        },
        { depends: 'field%%%equal%%%mysql', value: 'child2' },
      ],
    }
    const descendants = getAllVisibleDescendants(field)
    expect(descendants).toHaveLength(2) // child1 and grandchild1
    expect(descendants[0].value).toBe('child1')
    expect(descendants[1].value).toBe('grandchild1')
  })

  it('returns flat array of all levels', () => {
    type TestField = {
      depends: string | null
      value: string
      children?: TestField[]
    }
    const field: { value: string; children: TestField[] } = {
      value: 'a',
      children: [
        {
          depends: null,
          value: 'b',
          children: [
            {
              depends: null,
              value: 'c',
              children: [{ depends: null, value: 'd' }],
            },
          ],
        },
      ],
    }
    const descendants = getAllVisibleDescendants(field)
    expect(descendants).toHaveLength(3)
    expect(descendants.map((d) => d.value)).toEqual(['b', 'c', 'd'])
  })

  it('handles multiple branches', () => {
    type TestField = {
      depends: string | null
      value: string
      children?: TestField[]
    }
    const field: { value: string; children: TestField[] } = {
      value: 'root',
      children: [
        {
          depends: null,
          value: 'branch1',
          children: [
            { depends: null, value: 'branch1-child1' },
            { depends: null, value: 'branch1-child2' },
          ],
        },
        {
          depends: null,
          value: 'branch2',
          children: [
            { depends: null, value: 'branch2-child1' },
            { depends: null, value: 'branch2-child2' },
          ],
        },
      ],
    }
    const descendants = getAllVisibleDescendants(field)
    expect(descendants).toHaveLength(6)
  })

  it('stops recursion when child dependencies are not met', () => {
    const field = {
      value: 'ldap',
      children: [
        {
          depends: 'field%%%equal%%%ldap',
          value: 'child1',
          children: [
            { depends: 'child1%%%equal%%%other', value: 'grandchild1' },
          ],
        },
      ],
    } as ConfigOption
    const descendants = getAllVisibleDescendants(field)
    expect(descendants).toHaveLength(1) // Only child1, grandchild1 is filtered out
    expect(descendants[0].value).toBe('child1')
  })
})

describe('hasVisibleDescendants', () => {
  it('returns false when field has no children', () => {
    const field = { value: 'ldap' }
    expect(hasVisibleDescendants(field)).toBe(false)
  })

  it('returns false when children array is empty', () => {
    const field = { value: 'ldap', children: [] }
    expect(hasVisibleDescendants(field)).toBe(false)
  })

  it('returns true when field has visible children', () => {
    const field = {
      value: 'ldap',
      children: [{ depends: null, value: 'child1' }],
    }
    expect(hasVisibleDescendants(field)).toBe(true)
  })

  it('returns true when field has visible grandchildren', () => {
    type TestField = {
      depends: string | null
      value: string
      children?: TestField[]
    }
    const field: { value: string; children: TestField[] } = {
      value: 'ldap',
      children: [
        {
          depends: null,
          value: 'child1',
          children: [{ depends: null, value: 'grandchild1' }],
        },
      ],
    }
    expect(hasVisibleDescendants(field)).toBe(true)
  })

  it('returns false when all descendants are filtered out', () => {
    type TestField = {
      depends: string | null
      value: string
      children?: TestField[]
    }
    const field: { value: string; children: TestField[] } = {
      value: 'ldap',
      children: [
        {
          depends: 'field%%%equal%%%mysql',
          value: 'child1',
          children: [{ depends: null, value: 'grandchild1' }],
        },
      ],
    }
    expect(hasVisibleDescendants(field)).toBe(false)
  })

  it('returns true when at least one descendant at any level is visible', () => {
    type TestField = {
      depends: string | null
      value: string
      children?: TestField[]
    }
    const field: { value: string; children: TestField[] } = {
      value: 'ldap',
      children: [
        {
          depends: 'field%%%equal%%%ldap',
          value: 'child1',
          children: [
            { depends: 'child1%%%equal%%%other', value: 'grandchild1' },
            { depends: 'child1%%%equal%%%child1', value: 'grandchild2' },
          ],
        },
        { depends: 'field%%%equal%%%mysql', value: 'child2' },
      ],
    }
    expect(hasVisibleDescendants(field)).toBe(true)
  })
})
