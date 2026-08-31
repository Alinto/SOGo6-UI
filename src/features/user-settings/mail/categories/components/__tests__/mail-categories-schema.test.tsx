import { createSchema } from '../mail-categories-schema'
import { useTranslations } from 'next-intl'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockT = (key: string) => {
  const map: Record<string, string> = {
    'labels.validation.label-name-required': 'Label name is required',
  }
  return map[key] ?? key
}

function makeSchema() {
  return createSchema(mockT as ReturnType<typeof useTranslations>)
}

function validCategory(overrides = {}) {
  return { name: 'Work', color: '#3b82f6', isDefault: false, ...overrides }
}

function validPayload(overrides = {}) {
  return { categories: [], ...overrides }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('createSchema (mail categories)', () => {

  // ── schema creation ───────────────────────────────────────────────────────

  describe('schema creation', () => {
    it('returns a Zod schema without throwing', () => {
      expect(() => makeSchema()).not.toThrow()
    })

    it('exposes a parse method', () => {
      expect(typeof makeSchema().parse).toBe('function')
    })

    it('exposes a safeParse method', () => {
      expect(typeof makeSchema().safeParse).toBe('function')
    })
  })

  // ── categories array ──────────────────────────────────────────────────────

  describe('categories', () => {
    it('accepts an empty array', () => {
      expect(makeSchema().safeParse(validPayload()).success).toBe(true)
    })

    it('accepts a single valid category', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory()] })).success
      ).toBe(true)
    })

    it('accepts multiple valid categories', () => {
      expect(
        makeSchema().safeParse(
          validPayload({
            categories: [
              validCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
              validCategory({ name: 'Personal', color: '#10b981', isDefault: false }),
            ],
          })
        ).success
      ).toBe(true)
    })

    it('rejects a non-array value', () => {
      expect(makeSchema().safeParse(validPayload({ categories: 'not-an-array' })).success).toBe(false)
    })

    it('rejects when categories field is missing', () => {
      expect(makeSchema().safeParse({}).success).toBe(false)
    })
  })

  // ── category.name ─────────────────────────────────────────────────────────

  describe('category.name', () => {
    it('accepts a non-empty string', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ name: 'Inbox' })] })).success
      ).toBe(true)
    })

    it('rejects an empty string', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ name: '' })] })).success
      ).toBe(false)
    })

    it('returns the translated error message for an empty name', () => {
      const result = makeSchema().safeParse(
        validPayload({ categories: [validCategory({ name: '' })] })
      )
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Label name is required')
      }
    })

    it('rejects a numeric name', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ name: 42 })] })).success
      ).toBe(false)
    })

    it('rejects when name is missing', () => {
      const { name: _, ...noName } = validCategory()
      expect(makeSchema().safeParse(validPayload({ categories: [noName] })).success).toBe(false)
    })
  })

  // ── category.color ────────────────────────────────────────────────────────

  describe('category.color', () => {
    it('accepts a hex color string', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ color: '#ff0000' })] })).success
      ).toBe(true)
    })

    it('accepts an empty string (no format constraint)', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ color: '' })] })).success
      ).toBe(true)
    })

    it('accepts any arbitrary string', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ color: 'red' })] })).success
      ).toBe(true)
    })

    it('rejects when color is missing', () => {
      const { color: _, ...noColor } = validCategory()
      expect(makeSchema().safeParse(validPayload({ categories: [noColor] })).success).toBe(false)
    })
  })

  // ── category.isDefault ────────────────────────────────────────────────────

  describe('category.isDefault', () => {
    it('accepts true', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ isDefault: true })] })).success
      ).toBe(true)
    })

    it('accepts false', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ isDefault: false })] })).success
      ).toBe(true)
    })

    it('rejects a string', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ isDefault: 'true' })] })).success
      ).toBe(false)
    })

    it('rejects a number', () => {
      expect(
        makeSchema().safeParse(validPayload({ categories: [validCategory({ isDefault: 1 })] })).success
      ).toBe(false)
    })

    it('rejects when isDefault is missing', () => {
      const { isDefault: _, ...noDefault } = validCategory()
      expect(makeSchema().safeParse(validPayload({ categories: [noDefault] })).success).toBe(false)
    })
  })

  // ── translation integration ───────────────────────────────────────────────

  describe('translation integration', () => {
    it('calls t at schema creation time, not at parse time', () => {
      const customT = jest.fn((key: string) => key)
      createSchema(customT as any)
      expect(customT.mock.calls.length).toBeGreaterThan(0)
    })

    it('calls t with the correct key for the name validation message', () => {
      const customT = jest.fn((key: string) => key)
      createSchema(customT as any)
      expect(customT).toHaveBeenCalledWith('labels.validation.label-name-required')
    })

    it('uses the value returned by t as the validation error message', () => {
      const customT = jest.fn(() => 'Custom required message')
      const schema = createSchema(customT as any)
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ name: '' })] })
      )
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom required message')
      }
    })

    it('uses a different locale t function and resolves the message correctly', () => {
      const frT = (key: string) =>
        key === 'labels.validation.label-name-required'
          ? 'Nom de libellé requis'
          : key
      const schema = createSchema(frT as any)
      const result = schema.safeParse(
        validPayload({ categories: [validCategory({ name: '' })] })
      )
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nom de libellé requis')
      }
    })
  })

  // ── full payload ──────────────────────────────────────────────────────────

  describe('full payload', () => {
    it('parses a complete valid payload and returns it unchanged', () => {
      const payload = validPayload({
        categories: [
          validCategory({ name: 'Work', color: '#ef4444', isDefault: true }),
          validCategory({ name: 'Personal', color: '#3b82f6', isDefault: false }),
        ],
      })
      const result = makeSchema().safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(payload)
      }
    })

    it('strips unknown top-level fields', () => {
      const result = makeSchema().safeParse({ ...validPayload(), extra: 'field' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('extra')
      }
    })

    it('strips unknown fields inside a category', () => {
      const result = makeSchema().safeParse(
        validPayload({ categories: [{ ...validCategory(), unknown: 'value' }] })
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categories[0]).not.toHaveProperty('unknown')
      }
    })

    it('reports errors for every invalid category in the array', () => {
      const result = makeSchema().safeParse(
        validPayload({
          categories: [
            validCategory({ name: '' }),
            validCategory({ name: '' }),
          ],
        })
      )
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
      }
    })
  })
})