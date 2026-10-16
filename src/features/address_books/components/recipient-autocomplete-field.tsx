'use client'

import InputWithTags from '@/components/ui/inputs/input-with-tags'
import { useRecipientPhotos } from '@/features/address_books/hooks/use-recipient-photos'
import {
  type RecipientSuggestionItem,
  useRecipientSuggestions,
} from '@/features/address_books/hooks/use-recipient-suggestions'
import { useShareUserSuggestions } from '@/features/address_books/hooks/use-share-user-suggestions'
import { cn } from '@/lib/utils'
import { Loader2, UserPlus } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import RecipientAvatar from './recipient-avatar'
import RecipientContactCard from './recipient-contact-card'

type RecipientTag = { id: string; value: string; name?: string }

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
  // Called only when the "add as typed" row is picked (not on Enter/blur),
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
  // Sharing dialogs place the field at the bottom of an overflow-hidden
  // dialog, so the list has to open upward to stay visible.
  panelSide?: 'top' | 'bottom'
  // `gab` searches directory accounts (sharing). `recipients` searches
  // personal contacts, lists and the directory (compose and mail search).
  suggestionSource?: 'recipients' | 'gab'
  // `plain` drops the field border, for layouts that separate fields with
  // lines (compose).
  variant?: 'bordered' | 'plain'
  // Shows a contact card (avatar, name, email, phone) on hover/click of a
  // tag instead of a plain email tooltip.
  showContactCard?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formatSuggestionName = (name: string) => `<${name}>`

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
  panelSide = 'bottom',
  suggestionSource = 'recipients',
  variant = 'bordered',
  showContactCard = false,
}) => {
  const [draft, setDraft] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [open, setOpen] = useState(false)
  // The highlighted row is tied to the query/panel it was picked in, so it
  // resets whenever the list changes.
  const [active, setActive] = useState({ key: '', index: -1 })
  const containerRef = useRef<HTMLDivElement>(null)
  const useGab = suggestionSource === 'gab'

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(draft.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [draft])

  const { suggestions: recipientSuggestions, isFetching: recipientFetching } =
    useRecipientSuggestions(debouncedQ, useGab)
  const { suggestions: shareSuggestions, isFetching: shareFetching } =
    useShareUserSuggestions(debouncedQ, !useGab)

  const suggestions = useMemo<RecipientSuggestionItem[]>(
    () =>
      useGab
        ? shareSuggestions.map((item) => ({
            email: item.email,
            name: item.name,
            source: 'contact' as const,
            uid: item.uid,
          }))
        : recipientSuggestions,
    [recipientSuggestions, shareSuggestions, useGab]
  )
  const isFetching = useGab ? shareFetching : recipientFetching
  // Directory accounts (sharing) are not contacts: no photos to look up.
  const photos = useRecipientPhotos(debouncedQ, !open || useGab)

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

  const labelledTags = useMemo(
    () =>
      tags.map((tag) => ({
        ...tag,
        // Show the name when known; the email stays available on hover/tap.
        label: tag.name || undefined,
        ...(showContactCard
          ? {
              details: (
                <RecipientContactCard email={tag.value} name={tag.name} />
              ),
            }
          : { tooltip: tag.name ? tag.value : undefined }),
      })),
    [tags, showContactCard]
  )

  const showAddDirect =
    !!getAddDirectLabel &&
    isAddableDraft(debouncedQ) &&
    !filteredSuggestions.some(
      (suggestion) =>
        suggestion.email.toLowerCase() === debouncedQ.toLowerCase()
    ) &&
    !tags.some((tag) => tag.value.toLowerCase() === debouncedQ.toLowerCase())

  const showPanel =
    open &&
    debouncedQ.length >= 2 &&
    (filteredSuggestions.length > 0 || showAddDirect)

  // Keyboard-navigable rows: the suggestions, then the "add as typed" row.
  const optionCount = showPanel
    ? filteredSuggestions.length + (showAddDirect ? 1 : 0)
    : 0
  const listboxId = `${name}-listbox`
  const optionId = (index: number) => `${name}-option-${index}`

  const listKey = `${showPanel}:${debouncedQ}`
  const activeIndex = active.key === listKey ? active.index : -1
  const setActiveIndex = (update: number | ((prev: number) => number)) =>
    setActive({
      key: listKey,
      index: typeof update === 'function' ? update(activeIndex) : update,
    })

  useEffect(() => {
    if (activeIndex < 0) return
    document
      .getElementById(`${name}-option-${activeIndex}`)
      ?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, name])

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

  const pickAddDirect = () => {
    pickSuggestion(debouncedQ)
    onAddDirect?.(debouncedQ)
  }

  const pickOption = (index: number) => {
    const suggestion = filteredSuggestions[index]
    if (suggestion) pickSuggestion(suggestion.email, suggestion)
    else if (showAddDirect) pickAddDirect()
  }

  // Replaces InputWithTags' own Enter handler.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!showPanel) {
        setOpen(true)
        return
      }
      if (optionCount === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((prev) =>
        prev < 0 && step < 0
          ? optionCount - 1
          : (prev + step + optionCount) % optionCount
      )
      return
    }

    if (event.key === 'Escape') {
      if (!showPanel) return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      return
    }

    if (event.key !== 'Enter') return

    if (activeIndex >= 0 && activeIndex < optionCount) {
      event.preventDefault()
      event.stopPropagation()
      pickOption(activeIndex)
      return
    }
    if (suggestionsOnly) {
      // Typed text is never added as is.
      event.preventDefault()
      event.stopPropagation()
      const first = showPanel ? filteredSuggestions[0] : undefined
      if (first) pickSuggestion(first.email, first)
      return
    }
    const value = event.currentTarget.value
    if (value.length) {
      event.preventDefault()
      event.stopPropagation()
      handleAdd(value)
      setDraft('')
      setOpen(false)
    }
  }

  const optionClassName = (index: number) =>
    cn(
      'hover:bg-muted-foreground/15 flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm',
      activeIndex === index && 'bg-muted-foreground/15'
    )

  const addDirectIndex = filteredSuggestions.length

  return (
    <div ref={containerRef} className="relative">
      <InputWithTags
        tags={labelledTags}
        remove={remove}
        handleAdd={(value) => {
          handleAdd(value)
          setDraft('')
          setOpen(false)
        }}
        onKeyDown={handleKeyDown}
        containerClassName={
          variant === 'plain'
            ? 'rounded-none border-0 has-[.tag]:py-1.5'
            : undefined
        }
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listboxId : undefined}
        aria-activedescendant={
          activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
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
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            'border-border bg-popover absolute z-50 max-h-60 w-full overflow-y-auto rounded-lg border shadow-lg',
            panelSide === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
          onMouseDown={(event) => event.preventDefault()}
        >
          {isFetching && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingLabel}
            </div>
          )}
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.uid ?? suggestion.source}:${suggestion.email}:${index}`}
              id={optionId(index)}
              role="option"
              aria-selected={activeIndex === index}
              type="button"
              tabIndex={-1}
              className={cn('text-foreground', optionClassName(index))}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault()
                pickSuggestion(suggestion.email, suggestion)
              }}
            >
              <RecipientAvatar
                email={suggestion.email}
                name={suggestion.name}
                photo={photos.get(suggestion.email.toLowerCase())}
                size="sm"
              />
              <span className="flex min-w-0 flex-1 items-baseline gap-1">
                <span className="truncate font-medium">{suggestion.email}</span>
                {suggestion.name && (
                  <span className="text-muted-foreground truncate">
                    {formatSuggestionName(suggestion.name)}
                  </span>
                )}
              </span>
            </button>
          ))}
          {showAddDirect && getAddDirectLabel && (
            <button
              id={optionId(addDirectIndex)}
              role="option"
              aria-selected={activeIndex === addDirectIndex}
              type="button"
              tabIndex={-1}
              className={cn(
                'border-border text-muted-foreground border-t',
                optionClassName(addDirectIndex)
              )}
              onMouseEnter={() => setActiveIndex(addDirectIndex)}
              onMouseDown={(event) => {
                event.preventDefault()
                pickAddDirect()
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
