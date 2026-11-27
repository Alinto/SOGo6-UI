'use client'

import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { useMemo } from 'react'
import { useGetMailboxTagsQuery } from '../store/mails-api'
import {
  mergeLabelOptions,
  toSearchableMailTags,
  type MailboxTag,
} from '../utils/searchable-mail-tags'

/**
 * Labels a mail list can be filtered on: the user's mail categories, then
 * the tags found on the mails of the mailbox (`GET mailboxes/{id}/tags`).
 */
export function useMailLabelOptions(accountId: string, enabled = true) {
  const { data: preferences, isFetching: isFetchingPreferences } =
    useGetUserPreferencesQuery(undefined, { skip: !enabled })
  const { data: mailboxTags, isFetching: isFetchingTags } =
    useGetMailboxTagsQuery({ accountId }, { skip: !enabled || !accountId })

  const labels = useMemo<MailboxTag[]>(
    () =>
      mergeLabelOptions(
        preferences?.data.USER_MAIL_CATEGORY_SETTINGS?.SOGO_U_MAIL_CATEGORIES ??
          [],
        toSearchableMailTags(mailboxTags)
      ),
    [preferences, mailboxTags]
  )

  return { labels, isFetching: isFetchingPreferences || isFetchingTags }
}
