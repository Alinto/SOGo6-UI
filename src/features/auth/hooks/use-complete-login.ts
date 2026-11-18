'use client'

import { setCredentials } from '@/features/auth/components/store/auth.slice'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { clearAuthenticatedApiCache } from '@/lib/redux/listeners/reset-cache-on-logout'
import { useCallback } from 'react'

interface JwtPayload {
  uid: string
  cn: string
  email: string
}

export function decodeJwtPayload(token: string): JwtPayload {
  const [, payloadB64] = token.split('.')
  // Convertir base64url → base64 standard
  const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as JwtPayload
}

/**
 * Last step of every login path (password only, MFA verify, forced MFA enrollment):
 * store the user session and go to the mailbox.
 */
export function useCompleteLogin() {
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  return useCallback(
    (jwtToken: string, rememberMe: boolean) => {
      const payload = decodeJwtPayload(jwtToken)

      // Cache keys do not include the user. The login page has no mailbox
      // subscriptions, so this drops the previous account before the new one.
      clearAuthenticatedApiCache(dispatch)

      dispatch(
        setCredentials({
          token: jwtToken,
          user: {
            uid: payload.uid,
            cn: payload.cn,
            email: payload.email,
          },
          rememberMe,
        })
      )

      push('/u/0/INBOX')
    },
    [dispatch, push]
  )
}
