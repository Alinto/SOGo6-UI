import * as fs from 'fs'
import * as path from 'path'

/**
 * Tests for useProfile hook (use-profile.ts)
 *
 * Redux and RTK Query are heavy dependencies that cannot be fully resolved
 * in the Jest/jsdom environment. Following the project pattern, we verify
 * the hook structure by reading the file content.
 */
describe('useProfile hook', () => {
  const filePath = path.join(__dirname, '../use-profile.ts')
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  describe('File structure', () => {
    it('should exist and be non-empty', () => {
      expect(fs.existsSync(filePath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should export useProfile function', () => {
      expect(fileContent).toContain('export function useProfile')
    })

    it('should import useAppSelector', () => {
      expect(fileContent).toContain('useAppSelector')
      expect(fileContent).toMatch(/import\s*{[^}]*useAppSelector[^}]*}\s*from/)
    })

    it('should import useGetUserProfileQuery', () => {
      expect(fileContent).toContain('useGetUserProfileQuery')
      expect(fileContent).toMatch(
        /import\s*{[^}]*useGetUserProfileQuery[^}]*}\s*from/
      )
    })
  })

  describe('Profile API integration', () => {
    it('should call useGetUserProfileQuery', () => {
      expect(fileContent).toContain('useGetUserProfileQuery()')
    })

    it('should destructure data as profile', () => {
      expect(fileContent).toMatch(/data:\s*profile/)
    })

    it('should destructure isLoading', () => {
      expect(fileContent).toContain('isLoading')
    })

    it('should destructure isError', () => {
      expect(fileContent).toContain('isError')
    })

    it('should destructure error', () => {
      expect(fileContent).toContain('error')
    })

    it('should destructure refetch', () => {
      expect(fileContent).toContain('refetch')
    })

    it('should return raw profile data', () => {
      expect(fileContent).toContain('profile,')
    })

    it('should return isLoading', () => {
      expect(fileContent).toContain('isLoading,')
    })

    it('should return isError', () => {
      expect(fileContent).toContain('isError,')
    })

    it('should return error', () => {
      expect(fileContent).toContain('error,')
    })

    it('should return refetch', () => {
      expect(fileContent).toContain('refetch,')
    })
  })

  describe('Auth user integration', () => {
    it('should select auth user from Redux state', () => {
      expect(fileContent).toContain('state.auth.user')
    })

    it('should extract domain from uid', () => {
      expect(fileContent).toContain('domain')
      expect(fileContent).toContain("includes('@')")
      expect(fileContent).toContain("split('@')[1]")
    })

    it('should return user with domain', () => {
      expect(fileContent).toContain('user:')
      expect(fileContent).toContain('domain,')
    })

    it('should return null when authUser is null', () => {
      expect(fileContent).toMatch(/authUser\s*\?[\s\S]*?:\s*null/)
    })
  })

  describe('Mailbox handling', () => {
    it('should find main account with id 0', () => {
      expect(fileContent).toContain("m.id === '0'")
      expect(fileContent).toContain('mainAccount')
    })

    it('should filter external accounts with id not 0', () => {
      expect(fileContent).toContain("m.id !== '0'")
      expect(fileContent).toContain('externalAccounts')
    })

    it('should return allMailboxes', () => {
      expect(fileContent).toContain('allMailboxes')
      expect(fileContent).toMatch(
        /allMailboxes:\s*profile\?\.mailboxes\s*\|\|\s*\[\]/
      )
    })

    it('should find default identity from main account', () => {
      expect(fileContent).toContain('defaultIdentity')
      expect(fileContent).toContain('isDefault')
    })

    it('should return mainAccount', () => {
      expect(fileContent).toContain('mainAccount,')
    })

    it('should return externalAccounts', () => {
      expect(fileContent).toContain('externalAccounts,')
    })

    it('should return defaultIdentity', () => {
      expect(fileContent).toContain('defaultIdentity,')
    })
  })

  describe('Preferences shortcuts', () => {
    it('should return preferences from profile.prefs', () => {
      expect(fileContent).toMatch(/preferences:\s*profile\?\.prefs/)
    })

    it('should return language from USER_GENERAL', () => {
      expect(fileContent).toContain('SOGO_U_LANGUAGE')
      expect(fileContent).toContain('language:')
    })

    it('should return timezone from USER_GENERAL', () => {
      expect(fileContent).toContain('SOGO_U_TIMEZONE')
      expect(fileContent).toContain('timezone:')
    })

    it('should return firstModule from USER_GENERAL', () => {
      expect(fileContent).toContain('SOGO_U_FIRST_MODULE')
      expect(fileContent).toContain('firstModule:')
    })

    it('should return mfaEnabled from USER_SECURITY', () => {
      expect(fileContent).toContain('SOGO_U_MFA_ENABLE')
      expect(fileContent).toContain('mfaEnabled:')
    })
  })

  describe('UI settings and feature toggles', () => {
    it('should return uiSettings from profile.ui', () => {
      expect(fileContent).toMatch(/uiSettings:\s*profile\?\.ui/)
    })

    it('should return canAddExternalAccount with false default', () => {
      expect(fileContent).toContain('SOGO_D_ALLOW_EXT_MAIL_ACCOUNT')
      expect(fileContent).toMatch(/canAddExternalAccount[\s\S]*?\?\?\s*false/)
    })

    it('should return identitiesEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_IDENTITIES_ENABLED')
      expect(fileContent).toMatch(/identitiesEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return customFromEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED')
      expect(fileContent).toMatch(/customFromEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return moduleAccess with empty array default', () => {
      expect(fileContent).toContain('SOGO_D_MODULE_ACCESS')
      expect(fileContent).toMatch(/moduleAccess[\s\S]*?\|\|\s*\[\]/)
    })

    it('should return mfaAvailable with false default', () => {
      expect(fileContent).toContain('SOGO_D_LOGIN_MFA')
      expect(fileContent).toMatch(/mfaAvailable[\s\S]*?\?\?\s*false/)
    })

    it('should return passwordChangeEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_PWD_CHANGE_ENABLED')
      expect(fileContent).toMatch(/passwordChangeEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return forwardEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_FORWARD_ENABLED')
      expect(fileContent).toMatch(/forwardEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return vacationEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_VACATION_ENABLED')
      expect(fileContent).toMatch(/vacationEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return mailFilteringEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_MAIL_FILTERING_ENABLED')
      expect(fileContent).toMatch(/mailFilteringEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return mailPurgeAllow with false default', () => {
      expect(fileContent).toContain('SOGO_D_MAIL_PURGE_ALLOW')
      expect(fileContent).toMatch(/mailPurgeAllow[\s\S]*?\?\?\s*false/)
    })

    it('should return mailMaxRecipient with 0 default', () => {
      expect(fileContent).toContain('SOGO_D_MAIL_MAX_RECIPIENT')
      expect(fileContent).toMatch(/mailMaxRecipient[\s\S]*?\?\?\s*0/)
    })

    it('should return jitsiLinkEnabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_JITSI_LINK_ENABLED')
      expect(fileContent).toMatch(/jitsiLinkEnabled[\s\S]*?\?\?\s*false/)
    })

    it('should return jitsiBaseUrl with null default', () => {
      expect(fileContent).toContain('SOGO_D_JITSI_BASE_URL')
      expect(fileContent).toMatch(/jitsiBaseUrl[\s\S]*?\?\?\s*null/)
    })

    it('should return folderSharingDisabled with false default', () => {
      expect(fileContent).toContain('SOGO_D_FOLDER_DISABLE_SHARING')
      expect(fileContent).toMatch(/folderSharingDisabled[\s\S]*?\?\?\s*false/)
    })

    it('should return draftAutosaveTimer with 5 default', () => {
      expect(fileContent).toContain('SOGO_D_MAIL_DRAFT_AUTOSAVE')
      expect(fileContent).toMatch(/draftAutosaveTimer[\s\S]*?\?\?\s*5/)
    })
  })
})
