import { PP_DEFAULT } from '@/features/user-settings/store/user-preferences-api-types'

import { createProfileSchema } from '../profile-schema'

// Minimal mock for the translation function
const t = (key: string) => key

describe('profile-schema', () => {
  const schema = createProfileSchema(t as any, t as any)

  describe('schema', () => {
    it('should validate valid data', () => {
      const validData = {
        profilePictureSource: PP_DEFAULT,
        identities: [
          {
            mail: 'john@example.com',
            name: 'John',
            replyTo: 'john@example.com',
            isDefault: true,
          },
        ],
      }
      expect(() => schema.parse(validData)).not.toThrow()
    })

    it('should reject an invalid email in mail field', () => {
      const invalidData = {
        profilePictureSource: PP_DEFAULT,
        identities: [
          {
            mail: 'not-an-email',
            name: 'John',
            replyTo: 'john@example.com',
            isDefault: true,
          },
        ],
      }
      expect(() => schema.parse(invalidData)).toThrow()
    })

    it('should require at least one identity', () => {
      const missingIdentities = {
        profilePictureSource: PP_DEFAULT,
        identities: [],
      }
      expect(() => schema.parse(missingIdentities)).toThrow()
    })

    it('should require at least one default identity', () => {
      const noDefault = {
        profilePictureSource: PP_DEFAULT,
        identities: [
          {
            mail: 'john@example.com',
            name: 'John',
            replyTo: 'john@example.com',
            isDefault: false, // no default set
          },
        ],
      }
      expect(() => schema.parse(noDefault)).toThrow()
    })

    it('accepts an unchanged identity when custom fields are disabled', () => {
      const locked = createProfileSchema(
        t as any,
        t as any,
        {
          SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED: false,
          SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED: false,
          SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED: false,
        },
        [
          {
            mail: 'john@example.com',
            name: 'John',
            replyTo: 'john@example.com',
          },
        ]
      )
      expect(() =>
        locked.parse({
          profilePictureSource: PP_DEFAULT,
          identities: [
            {
              mail: 'john@example.com',
              name: 'John',
              replyTo: 'john@example.com',
              isDefault: true,
            },
          ],
        })
      ).not.toThrow()
    })

    it('rejects a changed From when custom from is disabled', () => {
      const locked = createProfileSchema(
        t as any,
        t as any,
        {
          SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED: false,
        },
        [
          {
            mail: 'john@example.com',
            name: 'John',
            replyTo: 'john@example.com',
          },
        ]
      )
      expect(() =>
        locked.parse({
          profilePictureSource: PP_DEFAULT,
          identities: [
            {
              mail: 'other@example.com',
              name: 'John',
              replyTo: 'john@example.com',
              isDefault: true,
            },
          ],
        })
      ).toThrow()
    })

    it('accepts a changed From when custom from is enabled', () => {
      const unlocked = createProfileSchema(
        t as any,
        t as any,
        {
          SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED: true,
        },
        [
          {
            mail: 'john@example.com',
            name: 'John',
            replyTo: 'john@example.com',
          },
        ]
      )
      expect(() =>
        unlocked.parse({
          profilePictureSource: PP_DEFAULT,
          identities: [
            {
              mail: 'other@example.com',
              name: 'John',
              replyTo: 'john@example.com',
              isDefault: true,
            },
          ],
        })
      ).not.toThrow()
    })

    it('should reject an invalid profilePictureSource', () => {
      const invalidSource = {
        profilePictureSource: 'invalid-source',
        identities: [
          {
            mail: 'john@example.com',
            name: 'John',
            replyTo: 'john@example.com',
            isDefault: true,
          },
        ],
      }
      expect(() => schema.parse(invalidSource)).toThrow()
    })
  })
})
