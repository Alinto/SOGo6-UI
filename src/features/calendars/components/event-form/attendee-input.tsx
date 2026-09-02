'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRecipientSuggestions } from '@/features/address_books/hooks/use-recipient-suggestions'
import { cn, tagDismissButtonClassName } from '@/lib/utils'
import { Loader2, Search, UserPlus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import type { AttendeeInputItem } from '../../calendars-types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = (email: string) => EMAIL_RE.test(email)

const STATUS_STYLES: Record<string, string> = {
  accepted: 'bg-success',
  declined: 'bg-destructive',
  tentative: 'bg-warning',
  'needs-action': 'bg-muted-foreground',
}

interface AttendeeInputProps {
  value: AttendeeInputItem[]
  onChange: (attendees: AttendeeInputItem[]) => void
  className?: string
  disabled?: boolean
  maxAttendees?: number
}

export default function AttendeeInput({
  value,
  onChange,
  className,
  disabled,
  maxAttendees = 50,
}: AttendeeInputProps) {
  const t = useTranslations('CALENDARS')

  const [inputValue, setInputValue] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [panelDismissed, setPanelDismissed] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(inputValue.trim())
      setPanelDismissed(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { suggestions = [], isFetching } = useRecipientSuggestions(debouncedQ)

  const filteredSuggestions = useMemo(
    () =>
      suggestions
        .filter(
          (s) =>
            !value.some((a) => a.email.toLowerCase() === s.email.toLowerCase())
        )
        .map((suggestion, index) => ({
          uid: `${suggestion.email}-${index}`,
          email: suggestion.email,
          name: suggestion.name ?? suggestion.email,
        })),
    [suggestions, value]
  )

  const trimmedDebounced = debouncedQ.trim()
  const showDirectAdd = useMemo(
    () =>
      trimmedDebounced.length >= 2 &&
      isValidEmail(trimmedDebounced) &&
      !filteredSuggestions.some(
        (s) => s.email.toLowerCase() === trimmedDebounced.toLowerCase()
      ),
    [trimmedDebounced, filteredSuggestions]
  )

  const menuAvailable = useMemo(
    () =>
      debouncedQ.length >= 2 &&
      (filteredSuggestions.length > 0 || showDirectAdd),
    [debouncedQ, filteredSuggestions.length, showDirectAdd]
  )

  const isOpen = menuAvailable && !panelDismissed

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPanelDismissed(true)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addAttendee = useCallback(
    (item: AttendeeInputItem) => {
      if (maxAttendees && value.length >= maxAttendees) {
        setError(
          t('eventForm.attendees.max_reached.string', { max: maxAttendees })
        )
        return
      }
      if (
        value.some((a) => a.email.toLowerCase() === item.email.toLowerCase())
      ) {
        setError(t('eventForm.attendees.already_added.string'))
        return
      }
      onChange([...value, item])
      setInputValue('')
      setDebouncedQ('')
      setPanelDismissed(true)
      setError(null)
      inputRef.current?.focus()
    },
    [value, onChange, maxAttendees, t]
  )

  const handleAddRaw = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (!isValidEmail(trimmed)) {
      setError(t('eventForm.attendees.invalid_email.string'))
      return
    }
    addAttendee({ email: trimmed })
  }, [inputValue, addAttendee, t])

  const handleRemove = useCallback(
    (email: string) => onChange(value.filter((a) => a.email !== email)),
    [value, onChange]
  )

  const suggestionCount = filteredSuggestions.length
  const hasDirectRow = showDirectAdd && isOpen
  const listLength = isOpen ? suggestionCount + (hasDirectRow ? 1 : 0) : 0

  const effectiveHighlight = useMemo(() => {
    if (listLength === 0) return 0
    return Math.min(highlighted, listLength - 1)
  }, [highlighted, listLength])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        if (listLength === 0) return
        e.preventDefault()
        setHighlighted((h) => Math.min(h + 1, listLength - 1))
      } else if (e.key === 'ArrowUp') {
        if (listLength === 0) return
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
      } else if (e.key === 'Escape') {
        setPanelDismissed(true)
      } else if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        if (
          isOpen &&
          effectiveHighlight < suggestionCount &&
          filteredSuggestions[effectiveHighlight]
        ) {
          const s = filteredSuggestions[effectiveHighlight]
          addAttendee({ email: s.email, name: s.name })
        } else {
          handleAddRaw()
        }
      } else if (
        e.key === 'Tab' &&
        isOpen &&
        effectiveHighlight < suggestionCount &&
        filteredSuggestions[effectiveHighlight]
      ) {
        e.preventDefault()
        const s = filteredSuggestions[effectiveHighlight]
        addAttendee({ email: s.email, name: s.name })
      }
    },
    [
      isOpen,
      effectiveHighlight,
      filteredSuggestions,
      addAttendee,
      handleAddRaw,
      listLength,
      suggestionCount,
    ]
  )

  return (
    <div ref={containerRef} className={cn('flex flex-col gap-2', className)}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((attendee) => (
            <Badge
              key={attendee.email}
              variant="secondary"
              className="flex items-center gap-1.5 pr-1 pl-2"
            >
              {attendee.status && (
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    STATUS_STYLES[attendee.status] ?? 'bg-muted-foreground'
                  )}
                />
              )}
              <span className="max-w-[140px] truncate text-xs">
                {attendee.name ?? attendee.email}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(attendee.email)}
                  className={tagDismissButtonClassName(
                    'ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus-visible:ring-2'
                  )}
                  aria-label={t('eventForm.attendees.remove.string', {
                    email: attendee.email,
                  })}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="relative">
          <div className="relative flex items-center">
            {isFetching ? (
              <Loader2 className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 animate-spin" />
            ) : (
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
            )}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setHighlighted(0)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setPanelDismissed(false)
              }}
              placeholder={t('eventForm.attendees.search_placeholder.string')}
              className={cn(
                'pl-8',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
            />
          </div>

          {isOpen && (filteredSuggestions.length > 0 || hasDirectRow) && (
            <div
              className="border-border bg-popover absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
              role="listbox"
            >
              {filteredSuggestions.map((user, idx) => (
                <button
                  key={user.uid}
                  type="button"
                  role="option"
                  aria-selected={idx === effectiveHighlight}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addAttendee({ email: user.email, name: user.name })
                  }}
                  className={cn(
                    'text-foreground flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    idx === effectiveHighlight
                      ? 'bg-muted'
                      : 'hover:bg-muted/70'
                  )}
                >
                  <div
                    className={cn(
                      'border-border bg-secondary text-secondary-foreground',
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold'
                    )}
                  >
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {user.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </p>
                  </div>
                  {user.department && (
                    <span
                      className={cn(
                        'border-border bg-muted/80 text-foreground',
                        'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium'
                      )}
                    >
                      {user.department}
                    </span>
                  )}
                  <UserPlus className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-80" />
                </button>
              ))}

              {hasDirectRow && (
                <button
                  type="button"
                  role="option"
                  aria-selected={effectiveHighlight === suggestionCount}
                  onMouseEnter={() => setHighlighted(suggestionCount)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleAddRaw()
                  }}
                  className={cn(
                    'border-border text-muted-foreground flex w-full cursor-pointer items-center gap-3 border-t px-3 py-2 text-left text-sm transition-colors',
                    effectiveHighlight === suggestionCount
                      ? 'bg-muted text-foreground'
                      : 'hover:bg-muted/70'
                  )}
                >
                  <UserPlus className="h-4 w-4 shrink-0" />
                  {t('eventForm.attendees.add_email_direct', {
                    email: trimmedDebounced,
                  })}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
