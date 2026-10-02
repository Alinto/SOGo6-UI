import { logout } from '@/features/auth/components/store/auth.slice'
import { clearAllDrafts } from '@/features/mails/store/mail-compose-slice'
import { clearSelectedMails } from '@/features/mails/store/mail-layout-slice'
import { clearMailNavigation } from '@/features/mails/store/mail-navigation-slice'
import { clearMailSearch } from '@/features/mails/store/mail-search-slice'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { startAppListening } from '@/lib/redux/listener-middleware'
import { getSSEServiceInstance, sseApi } from '@/lib/redux/sse/sse-api'
import type { AppDispatch } from '@/lib/redux/store'

/**
 * Query cache keys do not include the user. Call this only after the
 * authenticated tree has unmounted, otherwise still-subscribed hooks refetch
 * the previous account (or a token-less 401).
 */
export function clearAuthenticatedApiCache(dispatch: AppDispatch) {
  dispatch(apiSlice.util.resetApiState())
  dispatch(sseApi.util.resetApiState())
}

startAppListening({
  actionCreator: logout,
  effect: (_, listenerApi) => {
    listenerApi.cancelActiveListeners()

    getSSEServiceInstance()?.disconnect()
    listenerApi.dispatch(clearAllDrafts())
    listenerApi.dispatch(clearMailNavigation())
    listenerApi.dispatch(clearMailSearch())
    listenerApi.dispatch(clearSelectedMails())
  },
})
