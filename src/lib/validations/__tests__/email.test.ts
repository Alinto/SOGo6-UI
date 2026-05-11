import {
  extractEmails,
  isValidEmail,
  normalizeEmail,
  validateAndNormalize,
} from '../email'

describe('Email Validations', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user+tag@example.co.uk')).toBe(true)
      expect(isValidEmail('user_name@example-domain.com')).toBe(true)
      expect(isValidEmail('first.last@example.com')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('enforces RFC 5321 length constraints', () => {
      // Local part too long (> 64 characters)
      const longLocal = 'a'.repeat(65) + '@example.com'
      expect(isValidEmail(longLocal)).toBe(false)

      // Total length too long (> 254 characters)
      const longTotal = 'user@' + 'a'.repeat(250) + '.com'
      expect(isValidEmail(longTotal)).toBe(false)

      // Valid at maximum lengths
      const maxLocal = 'a'.repeat(64) + '@example.com'
      expect(isValidEmail(maxLocal)).toBe(true)
    })

    it('validates domain format correctly', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('user@subdomain.example.com')).toBe(true)
      expect(isValidEmail('user@example.co.uk')).toBe(true)
    })

    it('rejects emails with invalid characters', () => {
      expect(isValidEmail('user name@example.com')).toBe(false)
      expect(isValidEmail('user@exam ple.com')).toBe(false)
    })
  })

  describe('normalizeEmail', () => {
    it('normalizes email addresses', () => {
      expect(normalizeEmail(' User@Example.COM ')).toBe('user@example.com')
      expect(normalizeEmail('TEST@DOMAIN.COM')).toBe('test@domain.com')
      expect(normalizeEmail('MixedCase@Example.Com')).toBe(
        'mixedcase@example.com'
      )
    })

    it('trims whitespace', () => {
      expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com')
      expect(normalizeEmail('\tuser@example.com\n')).toBe('user@example.com')
    })

    it('handles already normalized emails', () => {
      expect(normalizeEmail('user@example.com')).toBe('user@example.com')
    })
  })

  describe('extractEmails', () => {
    it('extracts emails from comma-separated text', () => {
      const result = extractEmails('user1@example.com, user2@example.com')
      expect(result).toEqual(['user1@example.com', 'user2@example.com'])
    })

    it('extracts emails from semicolon-separated text', () => {
      const result = extractEmails('user1@example.com; user2@example.com')
      expect(result).toEqual(['user1@example.com', 'user2@example.com'])
    })

    it('extracts emails from newline-separated text', () => {
      const result = extractEmails('user1@example.com\nuser2@example.com')
      expect(result).toEqual(['user1@example.com', 'user2@example.com'])
    })

    it('handles multiple separators', () => {
      const result = extractEmails(
        'a@test.com,b@test.com;c@test.com\nd@test.com'
      )
      expect(result).toEqual([
        'a@test.com',
        'b@test.com',
        'c@test.com',
        'd@test.com',
      ])
    })

    it('trims whitespace around emails', () => {
      const result = extractEmails('  user1@example.com  ,  user2@example.com  ')
      expect(result).toEqual(['user1@example.com', 'user2@example.com'])
    })

    it('filters out empty strings', () => {
      const result = extractEmails('user1@example.com,,,user2@example.com')
      expect(result).toEqual(['user1@example.com', 'user2@example.com'])
    })

    it('handles single email', () => {
      const result = extractEmails('user@example.com')
      expect(result).toEqual(['user@example.com'])
    })

    it('returns empty array for empty input', () => {
      expect(extractEmails('')).toEqual([])
      expect(extractEmails('   ')).toEqual([])
      expect(extractEmails(',,,')).toEqual([])
    })
  })

  describe('validateAndNormalize', () => {
    it('returns normalized email if valid', () => {
      expect(validateAndNormalize(' User@Example.COM ')).toBe(
        'user@example.com'
      )
      expect(validateAndNormalize('TEST@DOMAIN.COM')).toBe('test@domain.com')
    })

    it('returns null if invalid', () => {
      expect(validateAndNormalize('invalid')).toBeNull()
      expect(validateAndNormalize('@example.com')).toBeNull()
      expect(validateAndNormalize('user@')).toBeNull()
      expect(validateAndNormalize('')).toBeNull()
    })

    it('handles edge cases', () => {
      expect(validateAndNormalize('   ')).toBeNull()
      expect(validateAndNormalize('user @example.com')).toBeNull()
    })

    it('preserves valid special characters', () => {
      expect(validateAndNormalize('user+tag@example.com')).toBe(
        'user+tag@example.com'
      )
      expect(validateAndNormalize('first.last@example.com')).toBe(
        'first.last@example.com'
      )
    })
  })
})

