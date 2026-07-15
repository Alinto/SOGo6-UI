'use client'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { selectIsAuthenticated } from '@/features/auth/components/store/auth.slice'
import { useAppSelector } from '@/lib/redux/hooks'
import Image from 'next/image'
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

  return (
    <div className="bg-background relative grid min-h-svh lg:grid-cols-2 lg:items-center">
      <div className="bg-background lg:animate-horizontalTranslate z-50 flex flex-1 justify-center rounded-lg p-6 shadow-2xl sm:justify-center md:p-10 lg:min-h-[400px] lg:items-center lg:justify-end">
        <Image
          alt="SOGo"
          src="/images/sogo-full.svg"
          width={300}
          height={235}
          priority
        />
      </div>
      <div className="bg-primary flex flex-1 justify-center p-6 sm:justify-center sm:p-10 lg:min-h-[400px] lg:items-center lg:justify-start">
        <div className="w-full max-w-xs">{children}</div>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
    </div>
  )
}

export default LoginLayout
