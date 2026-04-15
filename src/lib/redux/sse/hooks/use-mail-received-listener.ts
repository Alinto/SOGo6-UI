/**
 * Mail Received Event Listener Hook
 *
 * Hook to listen for mail:received SSE events and update Redux cache.
 * This is separated into its own module to avoid importing client code
 * into the main hooks.ts file.
 */

'use client'

import { useEffect } from 'react'
// This import ensures the mails endpoints are registered
import type { ImapMessagesList } from '@/features/mails/mails-types'
import '@/features/mails/store/mails-api'
import { apiSlice } from '../../api/api-slice'
import { useAppDispatch } from '../../hooks'
import type { AppDispatch } from '../../store'
import { getSSEServiceInstance } from '../sse-api'

/**
 * Hook to listen for mail:received SSE events and update cache
 *
 * @param folder - The folder to update when new mail arrives (defaults to 'INBOX')
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useMailReceivedListener('INBOX');
 *   // ... rest of component
 * }
 * ```
 */
export function useMailReceivedListener(
  folder: string = 'INBOX',
  params?: Record<string, string | number | boolean>
) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log('Setting up mail:received listener for folder:', folder)

    // Retry interval for waiting on SSE service
    let retryCount = 0
    const maxRetries = 3 // Wait up to 30 seconds (3 * 10s)
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let unsubscribe: (() => void) | null = null

    const setupListener = () => {
      const sseService = getSSEServiceInstance()

      if (!sseService) {
        retryCount++
        if (retryCount < maxRetries) {
          console.log(
            `SSE service not ready yet, retrying... (${retryCount}/${maxRetries})`
          )
          timeoutId = setTimeout(setupListener, 10000)
        } else {
          console.warn('SSE service failed to initialize after retries')
        }
        return
      }

      console.log('SSE service ready, subscribing to mail:received')

      // Subscribe directly to SSE service
      unsubscribe = sseService.subscribe('mail:received', (message) => {
        if (message.type === 'mail:received' && message.data) {
          const mailData = message.data as Record<string, unknown>
          updateMailsCache(dispatch, folder, params, mailData)
        }
      })
    }

    // Start trying to set up listener
    setupListener()

    // Cleanup subscription on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [dispatch, folder, params])
}

/**
 * Update the mails cache by prepending new mail
 *
 * This function takes the latest SSE event data and prepends it to
 * the cached messages list for the specified folder.
 */
function updateMailsCache(
  dispatch: AppDispatch,
  folder: string,
  params: Record<string, string | number | boolean> | undefined,
  mailData: Record<string, unknown>
) {
  // Create a new mail object from SSE data
  const newMail: ImapMessagesList = {
    id: (mailData.id as string) || `mail-${Date.now()}`,
    subject: (mailData.subject as string) || 'New Message',
    from: {
      name:
        ((mailData.from as Record<string, unknown>)?.name as string) ||
        'Unknown',
      email:
        ((mailData.from as Record<string, unknown>)?.email as string) || '',
    },
    to: [],
    date: (mailData.receivedAt as string) || new Date().toISOString(),
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: (mailData.preview as string) || '',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  }
  console.log('Creating new mail object:', newMail)

  try {
    console.log(
      'Attempting to update cache for folder:',
      folder,
      'params:',
      params
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateAction = (apiSlice.util.updateQueryData as any)(
      'getFolderMessages',
      { folder, params },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (draft: any) => {
        console.log('updateQueryData callback triggered!')
        console.log('Draft object:', draft)
        if (!draft || !draft.messages) {
          console.log('No draft or messages, skipping')
          return
        }

        console.log('Before unshift - messages count:', draft.messages.length)
        draft.messages.unshift(newMail)
        console.log('After unshift - messages count:', draft.messages.length)

        if (typeof draft.total === 'number') {
          draft.total += 1
        }
      }
    )

    dispatch(updateAction)
    console.log('Action dispatched successfully')
  } catch (error) {
    console.error('Error updating mails cache:', error)
  }
}
