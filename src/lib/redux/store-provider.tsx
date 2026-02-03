'use client'
import { useRef, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import type { AppStore } from './store'
import { makeStore } from './store'

interface StoreProviderProps {
  children: ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null)
  
  // This pattern is recommended by Redux Toolkit for Next.js App Router
  // See: https://redux-toolkit.js.org/usage/nextjs
  // The ref access during render is intentional and safe here
  if (storeRef.current === null) {
    storeRef.current = makeStore()
  }

  // ESLint disable: This ref access is safe and intentional (RTK official pattern)
  // eslint-disable-next-line react-hooks/refs
  return <Provider store={storeRef.current}>{children}</Provider>
}
