'use client'

import LoginShell from '@/features/auth/components/login-shell'
import { selectIsAuthenticated } from '@/features/auth/components/store/auth.slice'
import { hasSsoCallbackResult } from '@/features/auth/utils'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import React, { startTransition, useEffect, useState } from 'react'

const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { push } = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setIsHydrated(true)
    })
  }, [])

  const ssoResultPending =
    isHydrated && hasSsoCallbackResult(window.location.hash)

  useEffect(() => {
    if (isHydrated && isAuthenticated && !ssoResultPending) {
      push('/u/0/INBOX')
    }
  }, [isHydrated, isAuthenticated, ssoResultPending, push])

  if (!isHydrated || (isAuthenticated && !ssoResultPending)) return null

  return <LoginShell>{children}</LoginShell>
}

export default LoginLayout
