'use client'
import React, { ReactNode, useRef } from 'react'
import { Provider } from 'react-redux'
import { AppStore, makeStore } from './store'

interface StoreProviderProps {
  children: ReactNode
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const storeRef = useRef<AppStore | undefined>(undefined)
  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }
  // eslint-disable-next-line react-hooks/refs
  const store = storeRef.current

  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
