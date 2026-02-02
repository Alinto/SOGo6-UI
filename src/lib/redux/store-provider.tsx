'use client'
import React, { useMemo } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './store'

interface StoreProviderProps {
  children: React.ReactNode
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const store = useMemo(() => makeStore(), [])

  return <Provider store={store}>{children}</Provider>
}

export default StoreProvider
