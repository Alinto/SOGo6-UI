'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

export type FastAccessModuleId =
  | 'address-book'
  | 'calendar'
  | 'tasks'
  | 'notes'

type FastAccessState = {
  isOpen: boolean
  activeModule: FastAccessModuleId | null
  openModule: (id: FastAccessModuleId) => void
  closeModule: () => void
  toggleModule: (id: FastAccessModuleId) => void
}

const FastAccessContext = createContext<FastAccessState | null>(null)

export function FastAccessProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeModule, setActiveModule] =
    useState<FastAccessModuleId | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openModule = useCallback((id: FastAccessModuleId) => {
    setActiveModule(id)
    setIsOpen(true)
  }, [])

  const closeModule = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleModule = useCallback(
    (id: FastAccessModuleId) => {
      if (activeModule === id && isOpen) {
        setIsOpen(false)
      } else {
        setActiveModule(id)
        setIsOpen(true)
      }
    },
    [activeModule, isOpen]
  )

  return (
    <FastAccessContext.Provider
      value={{ isOpen, activeModule, openModule, closeModule, toggleModule }}
    >
      {children}
    </FastAccessContext.Provider>
  )
}

export function useFastAccess() {
  return useContext(FastAccessContext)
}

export function useFastAccessRequired() {
  const ctx = useContext(FastAccessContext)
  if (!ctx) {
    throw new Error('useFastAccessRequired must be used within FastAccessProvider')
  }
  return ctx
}
