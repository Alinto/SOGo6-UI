'use client'

import { useDragControls, useMotionValue } from 'framer-motion'
import React from 'react'

interface UseComposeFloatingWindowStateOptions {
  isMobile: boolean
  isActive: boolean
}

export function useComposeFloatingWindowState({
  isMobile,
  isActive,
}: UseComposeFloatingWindowStateOptions) {
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const dragControls = useDragControls()
  const x = useMotionValue(0)

  React.useEffect(() => {
    if (isMobile) {
      setIsMaximized(true)
      setIsMinimized(false)
    } else {
      setIsMaximized(false)
    }
  }, [isMobile])

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsMaximized(false)
    x.set(0)
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsMaximized(false)
    x.set(0)
  }

  const handleMaximize = () => {
    setIsMaximized(true)
    setIsMinimized(false)
    x.set(0)
  }

  const containerClasses = React.useMemo(() => {
    const zClass = isActive
      ? 'z-50 shadow-2xl'
      : 'z-40 shadow-md opacity-95 hover:opacity-100'
    if (isMobile) {
      return `fixed inset-0 h-full w-full max-w-full rounded-none border-0 ${zClass}`
    }
    if (isMinimized) return `h-12 w-80 ${zClass}`
    if (isMaximized) {
      return `fixed inset-0 !m-auto h-[calc(100vh-2rem)] w-[calc(100vw-8rem)] max-w-[calc(100vw-8rem)] rounded-lg ${zClass}`
    }
    return `h-[550px] w-[540px] max-w-[calc(100vw-2rem)] ${zClass}`
  }, [isActive, isMinimized, isMaximized, isMobile])

  const showMinimized = isMinimized && !isMobile
  const isDraggable = !isMobile && !isMinimized && !isMaximized

  return {
    isMinimized,
    isMaximized,
    dragControls,
    x,
    handleMinimize,
    handleRestore,
    handleMaximize,
    containerClasses,
    showMinimized,
    isDraggable,
  }
}
