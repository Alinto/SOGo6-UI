'use client'

import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'
import { useSearchAllContactsQuery } from '../store/address-books-api'
import { getContactPhotoSrc } from '../utils/contact-photo'
import { getContactEmails } from '../utils/recipient-card-changes'

const PHOTO_LOOKUP_PAGE_SIZE = 50

// The autocomplete API returns no photos: look the same query up in the
// contacts once (cached) and map each email to its contact's photo.
export function useRecipientPhotos(query: string, skip = false) {
  const trimmed = query.trim()
  const { data } = useSearchAllContactsQuery(
    !skip && trimmed.length >= 2
      ? {
          params: {
            search: trimmed,
            page: 1,
            page_size: PHOTO_LOOKUP_PAGE_SIZE,
          },
        }
      : skipToken
  )

  return useMemo(() => {
    const photos = new Map<string, string>()
    for (const contact of data?.items ?? []) {
      const photo = getContactPhotoSrc(contact)
      if (!photo) continue
      for (const email of getContactEmails(contact)) {
        if (!photos.has(email.toLowerCase())) {
          photos.set(email.toLowerCase(), photo)
        }
      }
    }
    return photos
  }, [data])
}
