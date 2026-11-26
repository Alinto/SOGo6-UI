'use client'

import { Button } from '@/components/ui/button'
import {
  logout,
  selectIsAuthenticated,
  setCredentials,
} from '@/features/auth/components/store/auth.slice'
import {
  SSO_ERROR_INVALID_STATE,
  useSsoErrorMessage,
} from '@/features/auth/sso-error-message'
import {
  consumeSsoNonce,
  decodeJwtPayload,
  type JwtPayload,
} from '@/features/auth/utils'
import { waitForLogoutWipe } from '@/features/offline/auth/logout-wipe'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppStore } from '@/lib/redux/hooks'
import { clearAuthenticatedApiCache } from '@/lib/redux/listeners/reset-cache-on-logout'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import LoginErrorNotice from './login-error-notice'

/**
 * Landing page after a SSO login: the API callback redirects here with the result in the fragment,
 * `#token=<jwt>` or `#error=<error code>`. The fragment is never sent to a server.
 * The query holds the nonce put by the login form (see buildSsoRedirectUrl).
 */
export function LoginSsoCallback() {
  const t = useTranslations('AUTH')
  const ssoErrorMessage = useSsoErrorMessage()
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const [error, setError] = React.useState<string | null>(null)
  // The fragment is cleared once read, the effect must not run twice (React strict mode)
  const handled = React.useRef(false)

  React.useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    const nonceValid = consumeSsoNonce(window.location.search)
    // Remove the token and the nonce from the url right away, so they do not stay in the browser history
    window.history.replaceState(null, '', window.location.pathname)

    const token = params.get('token')
    if (!token) {
      setError(params.get('error') ?? '')
      return
    }
    if (!nonceValid) {
      setError(SSO_ERROR_INVALID_STATE)
      return
    }

    let payload: JwtPayload
    try {
      payload = decodeJwtPayload(token)
    } catch {
      setError('')
      return
    }

    const openSession = async () => {
      // Another account may still be signed in on this browser: end its session first
      if (selectIsAuthenticated(store.getState())) {
        dispatch(logout())
      }
      // A logout may still be deleting the offline database of the previous user.
      await waitForLogoutWipe()
      // Cache keys do not include the user: drop the previous account before the new one.
      clearAuthenticatedApiCache(dispatch)

      dispatch(
        setCredentials({
          token,
          user: { uid: payload.uid, cn: payload.cn, email: payload.email },
          rememberMe: false,
        })
      )
      push('/u/0/INBOX')
    }
    void openSession()
  }, [dispatch, push, store])

  if (error === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-primary-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-4">
      <LoginErrorNotice>{ssoErrorMessage(error)}</LoginErrorNotice>
      <Button
        type="button"
        variant="outline"
        onClick={() => push('/auth/login')}
      >
        {t('sso_back_to_login.string')}
      </Button>
    </div>
  )
}
