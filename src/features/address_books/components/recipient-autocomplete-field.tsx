'use client'

import InputWithTags from '@/components/ui/inputs/input-with-tags'
import {
  type RecipientSuggestionItem,
  useRecipientSuggestions,
} from '@/features/address_books/hooks/use-recipient-suggestions'
import { cn } from '@/lib/utils'
import { Loader2, UserPlus } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type RecipientTag = { id: string; value: string }

type RecipientAutocompleteFieldProps = {
  tags: RecipientTag[]
  remove: (index: number) => void
  // `suggestion` is set when the value was picked from the autocomplete list.
  handleAdd: (value: string, suggestion?: RecipientSuggestionItem) => void
  name: string
  placeholder: string
  disabled?: boolean
  loadingLabel: string
  getAddDirectLabel?: (email: string) => string
  // Called only when the "add as typed" row is clicked (not on Enter/blur),
  // e.g. to also save the typed address as a contact.
  onAddDirect?: (email: string) => void
  // When true, the "add as typed"/blur-to-add affordance accepts any
  // non-empty text instead of requiring a full email address — used by
  // search fields, which can filter on a partial address or name, but not
  // by compose, which only ever sends to real email addresses.
  allowFreeText?: boolean
  // When true, only entries returned by the contacts autocomplete API can be
  // added: no "add as typed" row, no blur-to-add, and Enter picks the first
  // suggestion — used by sharing dialogs.
  suggestionsOnly?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RecipientAutocompleteField: React.FC<RecipientAutocompleteFieldProps> = ({
  tags,
  remove,
  handleAdd,
  name,
  placeholder,
  disabled,
  loadingLabel,
  getAddDirectLabel,
  onAddDirect,
  allowFreeText = false,
  suggestionsOnly = false,
}) => {
  const [draft, setDraft] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(draft.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [draft])

  const { suggestions, isFetching } = useRecipientSuggestions(debouncedQ)

  const isAddableDraft = (value: string) =>
    !suggestionsOnly &&
    (allowFreeText ? value.length > 0 : EMAIL_RE.test(value))

  const filteredSuggestions = useMemo(
    () =>
      suggestions.filter(
        (suggestion) =>
          !tags.some(
            (tag) => tag.value.toLowerCase() === suggestion.email.toLowerCase()
          )
      ),
    [suggestions, tags]
  )

  const showPanel =
    open &&
    debouncedQ.length >= 2 &&
    (filteredSuggestions.length > 0 ||
      (isAddableDraft(debouncedQ) &&
        !tags.some(
          (tag) => tag.value.toLowerCase() === debouncedQ.toLowerCase()
        )))

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const pickSuggestion = (
    email: string,
    suggestion?: RecipientSuggestionItem
  ) => {
    handleAdd(email, suggestion)
    setDraft('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <InputWithTags
        tags={tags}
        remove={remove}
        handleAdd={(value) => {
          handleAdd(value)
          setDraft('')
          setOpen(false)
        }}
        {...(suggestionsOnly && {
          // Overrides InputWithTags' Enter handler so typed text is never
          // added as is.
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            event.stopPropagation()
            const first = showPanel ? filteredSuggestions[0] : undefined
            if (first) pickSuggestion(first.email, first)
          },
        })}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (draft.trim() && isAddableDraft(draft.trim())) {
            handleAdd(draft.trim())
            setDraft('')
          }
          setOpen(false)
        }}
      />

      {showPanel && (
        <div className="border-border bg-popover absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg">
          {isFetching && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingLabel}
            </div>
          )}
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.email}
              type="button"
              className={cn(
                'text-foreground hover:bg-muted/70 flex w-full items-center gap-3 px-3 py-2 text-left text-sm'
              )}
              onMouseDown={(event) => {
                event.preventDefault()
                pickSuggestion(suggestion.email, suggestion)
              }}
            >
              <UserPlus className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {suggestion.name ?? suggestion.email}
                </span>
                {suggestion.name && (
                  <span className="text-muted-foreground block truncate text-xs">
                    {suggestion.email}
                  </span>
                )}
              </span>
            </button>
          ))}
          {getAddDirectLabel &&
            isAddableDraft(debouncedQ) &&
            !filteredSuggestions.some(
              (suggestion) =>
                suggestion.email.toLowerCase() === debouncedQ.toLowerCase()
            ) && (
              <button
                type="button"
                className="border-border text-muted-foreground hover:bg-muted/70 flex w-full items-center gap-3 border-t px-3 py-2 text-left text-sm"
                onMouseDown={(event) => {
                  event.preventDefault()
                  pickSuggestion(debouncedQ)
                  onAddDirect?.(debouncedQ)
                }}
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                {getAddDirectLabel(debouncedQ)}
              </button>
            )}
        </div>
      )}
    </div>
  )
}

export default RecipientAutocompleteField
