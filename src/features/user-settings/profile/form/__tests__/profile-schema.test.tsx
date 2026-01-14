import { defaultValues, schema } from '../profile-schema'

describe('profile-schema', () => {
  describe('schema', () => {
    it('should validate valid data', () => {
      const validData = {
        firstname: 'John',
        lastname: 'Doe',
      }

      expect(() => schema.parse(validData)).not.toThrow()
      expect(schema.parse(validData)).toEqual(validData)
    })

    it('should invalidate invalid data', () => {
      const invalidData = {
        firstname: 123, // should be string
        lastname: 'Doe',
      }

      expect(() => schema.parse(invalidData)).toThrow()
    })

    it('should require firstname and lastname', () => {
      const missingData = {
        firstname: 'John',
        // lastname missing
      }

      expect(() => schema.parse(missingData)).toThrow()
    })
  })

  describe('defaultValues', () => {
    it('should have correct default values', () => {
      expect(defaultValues).toEqual({
        firstname: 'Henry',
        lastname: 'Dupont',
      })
    })
  })
})
