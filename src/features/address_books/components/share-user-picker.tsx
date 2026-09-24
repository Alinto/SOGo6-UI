'use client'

import RecipientAutocompleteField from '@/features/address_books/components/recipient-autocomplete-field'
import type { RecipientSuggestionItem } from '@/features/address_books/hooks/use-recipient-suggestions'
import React, { memo, useState } from 'react'

export type SharePickedUser = { uid: string; email: string }

type ShareUserPickerProps = {
  label: string
  placeholder: string
  loadingLabel: string
  duplicateError: string
  isDuplicate: (user: SharePickedUser) => boolean
  onAdd: (user: SharePickedUser) => void
}

/**
 * "Add a user" field of the sharing dialogs: a user picked from the contacts
 * autocomplete API is granted access right away.
 */
const ShareUserPicker: React.FC<ShareUserPickerProps> = ({
  label,
  placeholder,
  loadingLabel,
  duplicateError,
  isDuplicate,
  onAdd,
}) => {
  const [error, setError] = useState<string | null>(null)

  const handleSelect = (
    _value: string,
    suggestion?: RecipientSuggestionItem
  ) => {
    if (!suggestion) return
    const user = { uid: suggestion.email, email: suggestion.email }
    if (isDuplicate(user)) {
      setError(duplicateError)
      return
    }
    onAdd(user)
    setError(null)
  }

  return (
    <div className="shrink-0 space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <RecipientAutocompleteField
        tags={[]}
        remove={() => {}}
        handleAdd={handleSelect}
        name="share-add-user"
        placeholder={placeholder}
        loadingLabel={loadingLabel}
        suggestionsOnly
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

export default memo(ShareUserPicker)
