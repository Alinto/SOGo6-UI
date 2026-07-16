'use client'

import { addNotification } from '@/features/notifications'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useCallback, useState } from 'react'

export type DownloadFileErrorCopy = {
  title: string
  message: string
}

export function useDownloadFile() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadFile = useCallback(
    async (url: string, filename: string, errorCopy: DownloadFileErrorCopy) => {
      if (isDownloading) return

      setIsDownloading(true)
      try {
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!response.ok) {
          throw new Error(`Download failed (${response.status})`)
        }

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = objectUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()

        URL.revokeObjectURL(objectUrl)
      } catch {
        dispatch(
          addNotification({
            type: 'error',
            title: errorCopy.title,
            message: errorCopy.message,
          })
        )
      } finally {
        setIsDownloading(false)
      }
    },
    [isDownloading, token, dispatch]
  )

  return { downloadFile, isDownloading }
}
