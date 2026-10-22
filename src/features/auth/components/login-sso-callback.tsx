'use client'

import { Button } from '@/components/ui/button'
import { setCredentials } from '@/features/auth/components/store/auth.slice'
import { decodeJwtPayload } from '@/features/auth/utils'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

/**
 * Landing page after a SSO login: the API callback redirects here with the result in the fragment,
 * `#token=<jwt>` or `#error=<error code>`. The fragment is never sent to a server.
 */
export function LoginSsoCallback() {
  const t = useTranslations('AUTH')
  const { push } = useRouter()
  const dispatch = useAppDispatch()
  const [error, setError] = React.useState<string | null>(null)
  // The fragment is cleared once read, the effect must not run twice (React strict mode)
  const handled = React.useRef(false)

  React.useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    // Remove the token from the url right away, so it does not stay in the browser history
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    )

    const token = params.get('token')
    if (!token) {
      setError(params.get('error') ?? '')
      return
    }

    try {
      const payload = decodeJwtPayload(token)
      dispatch(
        setCredentials({
          token,
          user: { uid: payload.uid, cn: payload.cn, email: payload.email },
          rememberMe: false,
        })
      )
      push('/u/0/INBOX')
    } catch {
      setError('')
    }
  }, [dispatch, push])

  if (error === null) return null

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-4">
      <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {error
            ? t('error.sso_failed.string', { code: error })
            : t('error.generic.string')}
        </p>
      </div>
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
