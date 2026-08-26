'use client'

import LoginShell from '@/features/auth/components/login-shell'
import { selectIsAuthenticated } from '@/features/auth/components/store/auth.slice'
import { useAppSelector } from '@/lib/redux/hooks'
import { useRouter } from 'next/navigation'
import React, { startTransition, useEffect, useState } from 'react'

const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setIsHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/u/0/INBOX')
    }
  }, [isHydrated, isAuthenticated, router])

  if (!isHydrated || isAuthenticated) return null

  return <LoginShell>{children}</LoginShell>
}

export default LoginLayout
