import type {
  ImapFolder,
  ImapMessages,
  ImapMessagesAPIResponse,
} from '../mails-types'
import { mailsApiEndpoints } from './mails-api'

// Selectors for mails API cached data
export const selectFoldersResult =
  mailsApiEndpoints.endpoints.getFolders.select()

export const selectFolderMessagesResult = (
  folder: string,
  params?: Record<string, string | number | boolean>
) => mailsApiEndpoints.endpoints.getFolderMessages.select({ folder, params })

export const selectMailResult = (folder: string, mailId: string) =>
  mailsApiEndpoints.endpoints.getMail.select({ folder, mailId })

// Derived selectors for common use cases
export const selectFolders = (state: unknown) => {
  const result = selectFoldersResult(
    state as Parameters<typeof selectFoldersResult>[0]
  )
  return result.data as ImapFolder[] | undefined
}

export const selectFolderMessages =
  (folder: string, params?: Record<string, string | number | boolean>) =>
  (state: unknown) => {
    const result = selectFolderMessagesResult(
      folder,
      params
    )(state as Parameters<ReturnType<typeof selectFolderMessagesResult>>[0])
    return result.data as ImapMessagesAPIResponse | undefined
  }

export const selectMail =
  (folder: string, mailId: string) => (state: unknown) => {
    const result = selectMailResult(
      folder,
      mailId
    )(state as Parameters<ReturnType<typeof selectMailResult>>[0])
    return result.data as ImapMessages | undefined
  }

// Loading state selectors
export const selectFoldersLoading = (state: unknown) => {
  const result = selectFoldersResult(
    state as Parameters<typeof selectFoldersResult>[0]
  )
  return result.isLoading
}

export const selectFolderMessagesLoading =
  (folder: string, params?: Record<string, string | number | boolean>) =>
  (state: unknown) => {
    const result = selectFolderMessagesResult(
      folder,
      params
    )(state as Parameters<ReturnType<typeof selectFolderMessagesResult>>[0])
    return result.isLoading
  }

export const selectMailLoading =
  (folder: string, mailId: string) => (state: unknown) => {
    const result = selectMailResult(
      folder,
      mailId
    )(state as Parameters<ReturnType<typeof selectMailResult>>[0])
    return result.isLoading
  }

// Error selectors
export const selectFoldersError = (state: unknown) => {
  const result = selectFoldersResult(
    state as Parameters<typeof selectFoldersResult>[0]
  )
  return result.error
}

export const selectFolderMessagesError =
  (folder: string, params?: Record<string, string | number | boolean>) =>
  (state: unknown) => {
    const result = selectFolderMessagesResult(
      folder,
      params
    )(state as Parameters<ReturnType<typeof selectFolderMessagesResult>>[0])
    return result.error
  }

export const selectMailError =
  (folder: string, mailId: string) => (state: unknown) => {
    const result = selectMailResult(
      folder,
      mailId
    )(state as Parameters<ReturnType<typeof selectMailResult>>[0])
    return result.error
  }
