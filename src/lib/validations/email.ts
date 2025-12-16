/**
 * Email validation utilities following RFC 5321 standards
 * @module lib/validations/email
 */

/**
 * RFC 5321 compliant email validation
 * - Max total length: 254 characters
 * - Max local part: 64 characters
 * - Validates domain format
 *
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 *
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid.email') // false
 * isValidEmail('a'.repeat(65) + '@example.com') // false (local part too long)
 */
export const isValidEmail = (email: string): boolean => {
  // RFC 5321 compliant regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) return false

  // RFC 5321 length constraints
  if (email.length > 254) return false

  const [localPart] = email.split('@')
  if (localPart.length > 64) return false

  return true
}

/**
 * Normalizes an email address (lowercase, trimmed)
 *
 * @param email - Email address to normalize
 * @returns Normalized email address
 *
 * @example
 * normalizeEmail(' User@Example.COM ') // 'user@example.com'
 */
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

/**
 * Extracts email addresses from a text string
 * Supports comma, semicolon, and newline separators
 *
 * @param text - Text containing email addresses
 * @returns Array of extracted email addresses
 *
 * @example
 * extractEmails('user1@example.com, user2@example.com') // ['user1@example.com', 'user2@example.com']
 */
export const extractEmails = (text: string): string[] => {
  return text
    .split(/[,\n;]/)
    .map((email) => email.trim())
    .filter((email) => email.length > 0)
}

/**
 * Validates and normalizes an email address
 *
 * @param email - Email address to validate and normalize
 * @returns Normalized email if valid, null otherwise
 *
 * @example
 * validateAndNormalize(' User@Example.COM ') // 'user@example.com'
 * validateAndNormalize('invalid') // null
 */
export const validateAndNormalize = (email: string): string | null => {
  const normalized = normalizeEmail(email)
  return isValidEmail(normalized) ? normalized : null
}




