'use client'

import InputWithTags from '@/components/ui/inputs/input-with-tags'
import { useRecipientSuggestions } from '@/features/address_books/hooks/use-recipient-suggestions'
import { cn } from '@/lib/utils'
import { Loader2, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type RecipientTag = { id: string; value: string }

type ComposeRecipientFieldProps = {
  tags: RecipientTag[]
  remove: (index: number) => void
  handleAdd: (value: string) => void
  name: string
  placeholder: string
  disabled?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ComposeRecipientField: React.FC<ComposeRecipientFieldProps> = ({
  tags,
  remove,
  handleAdd,
  name,
  placeholder,
  disabled,
}) => {
  const t = useTranslations('COMPOSE')
  const [draft, setDraft] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(draft.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [draft])

  const { suggestions, isFetching } = useRecipientSuggestions(debouncedQ)

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
      (EMAIL_RE.test(debouncedQ) &&
        !tags.some((tag) => tag.value.toLowerCase() === debouncedQ.toLowerCase())))

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

  const pickSuggestion = (email: string) => {
    handleAdd(email)
    setDraft('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <InputWithTags
        tags={tags}
        remove={remove}
        handleAdd={handleAdd}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />

      {showPanel && (
        <div className="border-border bg-popover absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg">
          {isFetching && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('recipient_search.loading.string')}
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
                pickSuggestion(suggestion.email)
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
          {EMAIL_RE.test(debouncedQ) &&
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
                }}
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                {t('recipient_search.add_direct.string', { email: debouncedQ })}
              </button>
            )}
        </div>
      )}
    </div>
  )
}

export default ComposeRecipientField
