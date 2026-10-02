import {
  logout,
  setCredentials,
} from '@/features/auth/components/store/auth.slice'
import { createDraft } from '@/features/mails/store/mail-compose-slice'
import { setSelectedMails } from '@/features/mails/store/mail-layout-slice'
import { setMailNavigation } from '@/features/mails/store/mail-navigation-slice'
import { setMailSearch } from '@/features/mails/store/mail-search-slice'
import type { ProfileData } from '@/features/user-profile/profile-types'
import { profileApi } from '@/features/user-profile/store/profile-api'
import { clearAuthenticatedApiCache } from '@/lib/redux/listeners/reset-cache-on-logout'
import { makeStore } from '@/lib/redux/store'

const profile = {
  mailboxes: [
    {
      id: '0',
      identities: [
        {
          mail: 'sogo-tests1@example.org',
          name: 'Didy',
          replyTo: '',
          isDefault: true,
          signatures: {},
        },
      ],
      receipts: {},
      certificates: {},
    },
  ],
  prefs: {},
  ui: {},
} as ProfileData

describe('reset cache on logout', () => {
  it('drops the previous account cache and in-memory mail state', () => {
    const store = makeStore()
    store.dispatch(
      setCredentials({
        token: 'token-user-1',
        user: {
          uid: 'sogo-tests1@example.org',
          cn: 'Didy',
          email: 'sogo-tests1@example.org',
        },
        rememberMe: false,
      })
    )
    store.dispatch(
      profileApi.util.upsertQueryData('getUserProfile', undefined, profile)
    )
    store.dispatch(
      createDraft({
        draftId: 'draft-1',
        initialData: { subject: 'secret' },
      })
    )
    store.dispatch(setSelectedMails(['1']))
    store.dispatch(
      setMailNavigation({
        folderKey: '0:INBOX',
        orderedIds: ['1'],
        page: 1,
        totalPages: 1,
      })
    )
    store.dispatch(
      setMailSearch({
        accountId: '0',
        folder: 'INBOX',
        params: { subject: 'hello' },
      })
    )

    expect(store.getState().api.queries).not.toEqual({})

    store.dispatch(logout())

    expect(store.getState().auth.user).toBeNull()
    expect(store.getState().api.queries).not.toEqual({})
    expect(store.getState().mailCompose.drafts).toEqual({})
    expect(store.getState().mailLayout.selectedMailIds).toEqual([])
    expect(store.getState().mailNavigation.orderedIds).toEqual([])
    expect(store.getState().mailSearch.isActive).toBe(false)

    clearAuthenticatedApiCache(store.dispatch)

    expect(store.getState().api.queries).toEqual({})
  })
})
