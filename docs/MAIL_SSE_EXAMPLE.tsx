/**
 * Example: Real-time Mail List with SSE Integration
 *
 * This component demonstrates how to use the useMailReceivedListener hook
 * to receive real-time mail updates via SSE and display them in a mail list.
 */

'use client'

import type { ImapMessagesList } from '@/features/mails/mails-types'
import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useMailReceivedListener } from '@/lib/redux/hooks/use-mail-received-listener'

interface MailListExampleProps {
  folder?: string
}

/**
 * Example component showing real-time mail list with SSE
 *
 * The useMailReceivedListener hook automatically:
 * 1. Subscribes to mail:received SSE events
 * 2. Updates the Redux cache with new mails
 * 3. Prepends new mails to the top of the list
 *
 * When a new mail arrives, it will appear at the top without
 * any additional manual cache management needed.
 */
export function MailListExample({ folder = 'INBOX' }: MailListExampleProps) {
  // Enable real-time mail updates via SSE
  // This hook subscribes to mail:received events and updates the cache
  useMailReceivedListener(folder)

  // Fetch the mail messages for the folder
  const {
    data: messagesData,
    isLoading,
    isFetching,
    error,
  } = useGetFolderMessagesQuery({
    folder,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading mails...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Error loading mails</p>
        <p className="text-sm">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  // Empty state
  if (!messagesData?.messages || messagesData.messages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No mails in {folder}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header with folder name and mail count */}
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold">
          {folder}
          {isFetching && (
            <span className="ml-2 text-xs text-gray-500">(syncing...)</span>
          )}
        </h2>
        <span className="text-sm text-gray-600">
          {messagesData.messages.length} of {messagesData.total} mails
        </span>
      </div>

      {/* Mail list */}
      <div className="divide-y overflow-hidden rounded-lg border">
        {messagesData.messages.map((mail) => (
          <MailItemExample key={mail.id} mail={mail} />
        ))}
      </div>

      {/* Pagination info */}
      {messagesData.hasNextPage && (
        <button className="w-full rounded px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
          Load more mails
        </button>
      )}
    </div>
  )
}

/**
 * Example mail item component
 */
interface MailItemExampleProps {
  mail: ImapMessagesList
}

function MailItemExample({ mail }: MailItemExampleProps) {
  return (
    <div className="cursor-pointer p-4 transition-colors hover:bg-gray-50">
      <div className="flex items-start gap-3">
        {/* Avatar or icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {mail.from.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Mail content */}
        <div className="min-w-0 flex-1">
          {/* Sender and date */}
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium text-gray-900">
              {mail.from.name || mail.from.email}
            </p>
            <p className="flex-shrink-0 text-xs text-gray-500">
              {new Date(mail.date).toLocaleDateString()}
            </p>
          </div>

          {/* Subject */}
          <p
            className={`text-sm ${mail.seen ? 'text-gray-600' : 'font-semibold text-gray-900'} truncate`}
          >
            {mail.subject}
          </p>

          {/* Preview and flags */}
          <div className="mt-1 flex items-center gap-2">
            <p className="flex-1 truncate text-xs text-gray-500">
              {mail.snippet}
            </p>

            {/* Flags */}
            {mail.flagged && <span className="text-yellow-500">★</span>}
            {mail.hasAttachment && <span className="text-gray-400">📎</span>}
            {!mail.seen && (
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: Multiple folders with real-time updates
 *
 * This shows how to use the same hook with different folders
 */
export function MailFoldersExample() {
  const folders = ['INBOX', 'Sent', 'Drafts', 'Archive']

  return (
    <div className="space-y-8">
      {folders.map((folder) => (
        <div key={folder}>
          <h3 className="mb-4 text-lg font-semibold">{folder}</h3>
          <MailListExample folder={folder} />
        </div>
      ))}
    </div>
  )
}
