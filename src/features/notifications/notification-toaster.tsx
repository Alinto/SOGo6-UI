'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { createPortal } from 'react-dom'
import { Toaster } from 'sonner'

export const NotificationToaster = () => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return createPortal(
      <Toaster
        position="bottom-center"
        richColors
        closeButton
        expand
        duration={5000}
      />,
      document.body
    )
  }
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      duration={5000}
    />
  )
}
