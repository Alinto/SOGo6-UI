'use client'

import { isPwaEnabled } from '@/features/offline/flags'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const SerwistProvider = dynamic(
  () => import('@serwist/turbopack/react').then((m) => m.SerwistProvider),
  { ssr: false }
)

interface SerwistProviderGateProps {
  children: ReactNode
}

export default function SerwistProviderGate({
  children,
}: SerwistProviderGateProps) {
  if (!isPwaEnabled()) {
    return <>{children}</>
  }

  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={false}>
      {children}
    </SerwistProvider>
  )
}
