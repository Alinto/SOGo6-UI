import { createSchema } from '../address-books-schema'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockT = (key: string) => {
  const map: Record<string, string> = {
    'validation.category-name-required': 'Category name is required',
  }
  return map[key] ?? key
}

function makeSchema() {
  return createSchema(mockT as ReturnType<typeof import('next-intl').useTranslations>)
}

function validCategory(overrides = {}) {
  return {
    name: 'Personal',
    color: '#3b82f6',
    isDefault: false,
    ...overrides,
  }
}

function validPayload(overrides = {}) {
  return {
    categories: [],
    creationNotification: false,
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('createSchema', () => {
  describe('schema creation', () => {
    it('returns a Zod schema object without throwing', () => {
      expect(() => makeSchema()).not.toThrow()
    })

    it('returns an object with a parse method', () => {
      const schema = makeSchema()
      expect(typeof schema.parse).toBe('function')
    })

    it('returns an object with a safeParse method', () => {
      const schema = makeSchema()
      expect(typeof schema.safeParse).toBe('function')
    })
  })

  // ── creationNotification ──────────────────────────────────────────────────

  describe('creationNotification field', () => {
    it('accepts true', () => {
      const schema = makeSchema()
      const result = schema.safeParse(validPayload({ creationNotification: true }))
      expect(result.success).toBe(true)
    })

    it('accepts false', () => {
      const schema = makeSchema()
      const result = schema.safeParse(validPayload({ creationNotification: false }))
      expect(result.success).toBe(true)
    })

    it('rejects a string value', () => {
      const schema = makeSchema()
      const result = schema.safeParse(validPayload({ creationNotification: 'yes' }))
      expect(result.success).toBe(false)
    })

    it('rejects a missing field', () => {
      const schema = makeSchema()
      const { creationNotification: _, ...payload } = validPayload()
      const result = schema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  // ── categories ────────────────────────────────────────────────────────────

  describe('categories field', () => {
    it('accepts an empty array', () => {
      const schema = makeSchema()
      const result = schema.safeParse(validPayload({ categories: [] }))
      expect(result.success).toBe(true)
    })

    it('accepts a single valid category', () => {
      const schema = makeSchema()
      const result = schema.safeParse(validPayload({ categories: [validCategory()] }))
      expect(result.success).toBe(true)
    })

    it('accepts multiple valid categories', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({
          categories: [
            validCategory({ name: 'Personal', color: '#3b82f6' }),
            validCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
          ],
        })
      )
      expect(result.success).toBe(true)
    })

    it('rejects when categories field is missing', () => {
      const schema = makeSchema()
      const { categories: _, ...payload } = validPayload()
      const result = schema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    it('rejects a non-array value', () => {
      const schema = makeSchema()
      const result = schema.safeParse(validPayload({ categories: 'not-an-array' }))
      expect(result.success).toBe(false)
    })
  })

  // ── category.name ─────────────────────────────────────────────────────────

  describe('category name field', () => {
    it('accepts a non-empty string', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ name: 'Family' })] })
      )
      expect(result.success).toBe(true)
    })

    it('rejects an empty string and returns the translated error message', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ name: '' })] })
      )
      expect(result.success).toBe(false)
      if (!result.success) {
        const message = result.error.issues[0].message
        expect(message).toBe('Category name is required')
      }
    })

    it('rejects a missing name field', () => {
      const schema = makeSchema()
      const { name: _, ...noName } = validCategory()
      const result = schema.safeParse(validPayload({ categories: [noName] }))
      expect(result.success).toBe(false)
    })

    it('rejects a numeric name', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ name: 42 })] })
      )
      expect(result.success).toBe(false)
    })
  })

  // ── category.color ────────────────────────────────────────────────────────

  describe('category color field', () => {
    it('accepts a hex color string', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ color: '#10b981' })] })
      )
      expect(result.success).toBe(true)
    })

    it('accepts an empty string (no format constraint on color)', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ color: '' })] })
      )
      expect(result.success).toBe(true)
    })

    it('accepts any arbitrary string value', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ color: 'red' })] })
      )
      expect(result.success).toBe(true)
    })

    it('rejects a missing color field', () => {
      const schema = makeSchema()
      const { color: _, ...noColor } = validCategory()
      const result = schema.safeParse(validPayload({ categories: [noColor] }))
      expect(result.success).toBe(false)
    })
  })

  // ── category.isDefault ────────────────────────────────────────────────────

  describe('category isDefault field', () => {
    it('accepts true', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ isDefault: true })] })
      )
      expect(result.success).toBe(true)
    })

    it('accepts false', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ isDefault: false })] })
      )
      expect(result.success).toBe(true)
    })

    it('rejects a string value', () => {
      const schema = makeSchema()
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ isDefault: 'true' })] })
      )
      expect(result.success).toBe(false)
    })

    it('rejects a missing isDefault field', () => {
      const schema = makeSchema()
      const { isDefault: _, ...noDefault } = validCategory()
      const result = schema.safeParse(validPayload({ categories: [noDefault] }))
      expect(result.success).toBe(false)
    })
  })

  // ── translated error messages ─────────────────────────────────────────────

  describe('translated validation messages', () => {
    it('uses the t function to resolve the category name error message', () => {
      const customT = jest.fn((key: string) =>
        key === 'validation.category-name-required' ? 'Custom required msg' : key
      )
      const schema = createSchema(customT as any)
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ name: '' })] })
      )
      expect(customT).toHaveBeenCalledWith('validation.category-name-required')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom required msg')
      }
    })

    it('calls t at schema creation time, not at parse time', () => {
      const customT = jest.fn((key: string) => key)
      createSchema(customT as any)
      const callCount = customT.mock.calls.length
      // t is called eagerly when the schema is built
      expect(callCount).toBeGreaterThan(0)
    })
  })

  // ── full valid payload ────────────────────────────────────────────────────

  describe('full valid payload', () => {
    it('parses and returns the data unchanged for a complete valid payload', () => {
      const schema = makeSchema()
      const payload = validPayload({
        categories: [
          validCategory({ name: 'Personal', color: '#3b82f6', isDefault: true }),
          validCategory({ name: 'Work', color: '#ef4444', isDefault: false }),
        ],
        creationNotification: true,
      })
      const result = schema.safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(payload)
      }
    })

    it('strips unknown top-level fields by default', () => {
      const schema = makeSchema()
      const result = schema.safeParse({ ...validPayload(), unknownField: 'surprise' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('unknownField')
      }
    })
  })
})