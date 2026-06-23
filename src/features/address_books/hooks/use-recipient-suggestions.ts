'use client'

import { useSearchUsersQuery } from '@/features/calendars/store/calendars-api'
import { useMemo } from 'react'
import { useSearchContactsAutocompleteQuery } from '../store/address-books-api'

export type RecipientSuggestionItem = {
  email: string
  name?: string
  source: 'user' | 'contact' | 'list'
}

export function useRecipientSuggestions(query: string) {
  const trimmed = query.trim()
  const enabled = trimmed.length >= 2

  const { data: users = [], isFetching: usersLoading } = useSearchUsersQuery(
    { q: trimmed },
    { skip: !enabled }
  )

  const { data: contacts = [], isFetching: contactsLoading } =
    useSearchContactsAutocompleteQuery({ q: trimmed }, { skip: !enabled })

  const suggestions = useMemo(() => {
    const seen = new Set<string>()
    const merged: RecipientSuggestionItem[] = []

    const pushUnique = (item: RecipientSuggestionItem) => {
      const key = item.email.toLowerCase()
      if (!item.email || seen.has(key)) return
      seen.add(key)
      merged.push(item)
    }

    for (const user of users) {
      pushUnique({
        email: user.email,
        name: user.name,
        source: 'user',
      })
    }

    for (const suggestion of contacts) {
      if (suggestion.type === 'contact' && suggestion.email) {
        pushUnique({
          email: suggestion.email,
          name: suggestion.name,
          source: 'contact',
        })
        continue
      }

      if (suggestion.type === 'list' && suggestion.members?.length) {
        for (const member of suggestion.members) {
          if (!member.email) continue
          pushUnique({
            email: member.email,
            name: member.name ?? suggestion.name,
            source: 'list',
          })
        }
      }
    }

    return merged
  }, [users, contacts])

  return {
    suggestions,
    isFetching: usersLoading || contactsLoading,
  }
}
