'use client'

import { Toaster } from 'sonner'

export const NotificationToaster = () => {
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
