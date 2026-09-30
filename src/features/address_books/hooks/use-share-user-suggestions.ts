'use client'

import { useProfile } from '@/features/user-profile'
import { useMemo } from 'react'
import { useSearchGabAutocompleteQuery } from '../store/address-books-api'

export type ShareUserSuggestion = {
  uid: string
  email: string
  name?: string
}

export function useShareUserSuggestions(query: string, skip = false) {
  const trimmed = query.trim()
  const enabled = !skip && trimmed.length >= 2
  const { user, allMailboxes } = useProfile()
  const identityMails = allMailboxes
    .flatMap((mailbox) => mailbox.identities.map((identity) => identity.mail))
    .join('\0')

  const { data: contacts = [], isFetching } = useSearchGabAutocompleteQuery(
    { q: trimmed },
    { skip: !enabled }
  )

  const suggestions = useMemo(() => {
    const self = new Set(
      [user?.uid, user?.email, ...identityMails.split('\0')]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase())
    )
    const seen = new Set<string>()
    const merged: ShareUserSuggestion[] = []

    for (const suggestion of contacts) {
      if (
        suggestion.type !== 'contact' ||
        !suggestion.email ||
        !suggestion.contactKey
      ) {
        continue
      }

      const uidKey = suggestion.contactKey.toLowerCase()
      const emailKey = suggestion.email.toLowerCase()
      if (seen.has(uidKey) || self.has(uidKey) || self.has(emailKey)) continue

      seen.add(uidKey)
      merged.push({
        uid: suggestion.contactKey,
        email: suggestion.email,
        name: suggestion.name,
      })
    }

    return merged
  }, [contacts, identityMails, user?.email, user?.uid])

  return { suggestions, isFetching: enabled && isFetching }
}
