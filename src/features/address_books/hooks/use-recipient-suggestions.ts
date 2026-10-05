'use client'

import { useMemo } from 'react'
import { useSearchContactsAutocompleteQuery } from '../store/address-books-api'

export type RecipientSuggestionItem = {
  email: string
  name?: string
  source: 'contact' | 'list'
  uid?: string
}

export function useRecipientSuggestions(query: string, skip = false) {
  const trimmed = query.trim()
  const enabled = !skip && trimmed.length >= 2

  const { data: contacts = [], isFetching } =
    useSearchContactsAutocompleteQuery({ q: trimmed }, { skip: !enabled })

  const suggestions = useMemo(() => {
    const seen = new Set<string>()
    const merged: RecipientSuggestionItem[] = []

    const pushUnique = (item: RecipientSuggestionItem) => {
      if (!item.email) return
      // Same card repeated with the same address collapses. Distinct cards
      // that share an address each stay visible.
      if (item.uid) {
        const key = `${item.uid.toLowerCase()}\0${item.email.toLowerCase()}`
        if (seen.has(key)) return
        seen.add(key)
      }
      merged.push(item)
    }

    for (const suggestion of contacts) {
      if (suggestion.type === 'contact' && suggestion.email) {
        pushUnique({
          email: suggestion.email,
          name: suggestion.name,
          source: 'contact',
          ...(suggestion.contactKey ? { uid: suggestion.contactKey } : {}),
        })
        continue
      }

      if (suggestion.type === 'list' && suggestion.members?.length) {
        for (const member of suggestion.members) {
          if (!member.email) continue
          pushUnique({
            email: member.email,
            name: member.name ?? suggestion.name ?? undefined,
            source: 'list',
            ...(member.contact_key ? { uid: member.contact_key } : {}),
          })
        }
      }
    }

    return merged
  }, [contacts])

  return { suggestions, isFetching }
}
