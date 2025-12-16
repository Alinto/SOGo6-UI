'use client'

import { Input } from '@/components/ui/input'
import Tag from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { extractEmails, isValidEmail } from '@/lib/validations'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FieldErrors } from 'react-hook-form'

interface ForwardEmailInputProps {
  tags: { id: string; value: string }[]
  remove: (index: number) => void
  handleAdd: (value: string) => void
  errors?: FieldErrors
  name: string
  maxTags?: number
  disabled?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

function ForwardEmailInput({
  tags,
  remove,
  handleAdd,
  errors,
  name,
  maxTags = 10,
  disabled = false,
  value: propValue,
  onChange: propOnChange,
  placeholder,
}: ForwardEmailInputProps) {
  const t = useTranslations('US_MAIL_FORWARD')
  const [pendingValue, setPendingValue] = useState((propValue as string) || '')
  const [showBlurHint, setShowBlurHint] = useState(false)
  const [showInvalidError, setShowInvalidError] = useState(false)
  const [highlightedTag, setHighlightedTag] = useState<number | null>(null)
  const [selectedForDeletion, setSelectedForDeletion] = useState<number | null>(
    null
  )
  const [newTagIds, setNewTagIds] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const prevTagsLengthRef = useRef(tags.length)

  // Refs for timeout cleanup to prevent race conditions
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blurHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const errorTimeout = errorTimeoutRef.current
    const blurHintTimeout = blurHintTimeoutRef.current
    const highlightTimeout = highlightTimeoutRef.current
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout)
      if (blurHintTimeout) clearTimeout(blurHintTimeout)
      if (highlightTimeout) clearTimeout(highlightTimeout)
    }
  }, [])

  // Synchronize pendingValue with propValue (derived state pattern)
  const syncedValue = (propValue as string) || ''
  useEffect(() => {
    if (syncedValue !== pendingValue) {
      setPendingValue(syncedValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncedValue])

  // Check for duplicates - memoized
  const isDuplicate = useCallback(
    (email: string): number | null => {
      const normalizedEmail = email.toLowerCase().trim()
      const index = tags.findIndex(
        (tag) => tag.value.toLowerCase().trim() === normalizedEmail
      )
      return index >= 0 ? index : null
    },
    [tags]
  )

  // Set temporary error with cleanup
  const setTemporaryError = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<boolean>>,
      timeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
      duration = 3000
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setter(true)
      timeoutRef.current = setTimeout(() => {
        setter(false)
        timeoutRef.current = null
      }, duration)
    },
    []
  )

  // Add single email with validation - memoized
  const addEmail = useCallback(
    (email: string): boolean => {
      const trimmedEmail = email.trim()
      if (!trimmedEmail) return false

      if (!isValidEmail(trimmedEmail)) {
        setTemporaryError(setShowInvalidError, errorTimeoutRef)
        return false
      }

      // Check for duplicates
      const duplicateIndex = isDuplicate(trimmedEmail)
      if (duplicateIndex !== null) {
        // Highlight the duplicate tag
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        setHighlightedTag(duplicateIndex)
        highlightTimeoutRef.current = setTimeout(
          () => setHighlightedTag(null),
          2000
        )
        return false
      }

      // Check max tags limit
      if (tags.length >= maxTags) {
        return false
      }

      setShowInvalidError(false)
      setShowBlurHint(false)
      handleAdd(trimmedEmail)
      setPendingValue('')
      return true
    },
    [isDuplicate, tags.length, maxTags, handleAdd, setTemporaryError]
  )

  // Memoized remove handler
  const memoizedRemove = useCallback(
    (index: number) => {
      if (!disabled) remove(index)
    },
    [remove, disabled]
  )

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      const input = e.currentTarget
      const value = input.value

      // Backspace on empty input: first select, then delete
      if (e.key === 'Backspace' && !value && tags.length > 0) {
        e.preventDefault()
        const lastIndex = tags.length - 1

        if (selectedForDeletion === lastIndex) {
          // Second backspace: delete the selected tag
          memoizedRemove(lastIndex)
          setSelectedForDeletion(null)
        } else {
          // First backspace: select the last tag
          setSelectedForDeletion(lastIndex)
        }
        return
      }

      // Any other key resets the selection
      if (selectedForDeletion !== null && e.key !== 'Backspace') {
        setSelectedForDeletion(null)
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()

        if (value.length) {
          addEmail(value)
        }
        return
      }

      // Tab, Comma, Semicolon trigger add (only if value exists)
      if ((e.key === 'Tab' || e.key === ',' || e.key === ';') && value.length) {
        e.preventDefault()
        e.stopPropagation()

        // If comma or semicolon, add current and continue
        if (e.key === ',' || e.key === ';') {
          const beforeSeparator = value.substring(0, value.length - 1)
          if (beforeSeparator.trim()) {
            addEmail(beforeSeparator)
          }
          return
        }

        // Tab: add and clear
        addEmail(value)
      }
    },
    [disabled, tags.length, selectedForDeletion, memoizedRemove, addEmail]
  )

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return

      e.preventDefault()
      const pastedText = e.clipboardData.getData('text')
      const emails = extractEmails(pastedText)

      if (emails.length > 1) {
        // Multiple emails: add all valid ones
        emails.forEach((email) => {
          if (isValidEmail(email)) {
            const duplicateIndex = isDuplicate(email)
            if (duplicateIndex === null && tags.length < maxTags) {
              handleAdd(email)
            } else if (duplicateIndex !== null) {
              if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current)
              }
              setHighlightedTag(duplicateIndex)
              highlightTimeoutRef.current = setTimeout(
                () => setHighlightedTag(null),
                2000
              )
            }
          }
        })
        setPendingValue('')
      } else if (emails.length === 1) {
        // Single email: set as value
        setPendingValue(emails[0])
        inputRef.current?.focus()
      }
    },
    [disabled, isDuplicate, tags.length, maxTags, handleAdd]
  )

  // Handle blur - convert pending value to tag
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (disabled) return

      setSelectedForDeletion(null)
      const value = e.currentTarget.value.trim()
      if (value && isValidEmail(value)) {
        addEmail(value)
      } else if (value && !isValidEmail(value)) {
        setTemporaryError(setShowBlurHint, blurHintTimeoutRef)
      }
    },
    [disabled, addEmail, setTemporaryError]
  )

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      setPendingValue(value)
      setShowBlurHint(false)
      setShowInvalidError(false)
      setSelectedForDeletion(null)
      if (propOnChange) {
        propOnChange(e)
      }
    },
    [propOnChange]
  )

  // Track new tags when they're added
  useEffect(() => {
    if (tags.length > prevTagsLengthRef.current) {
      const newTag = tags[tags.length - 1]
      if (newTag) {
        setTimeout(() => {
          setNewTagIds((prev) => new Set([...prev, newTag.id]))
          setTimeout(() => {
            setNewTagIds((prev) => {
              const next = new Set(prev)
              next.delete(newTag.id)
              return next
            })
          }, 2000)
        }, 0)
      }
    }
    prevTagsLengthRef.current = tags.length
  }, [tags])

  // Generate error message IDs for aria-describedby
  const errorIds = [
    showInvalidError ? `${name}-invalid` : null,
    showBlurHint ? `${name}-hint` : null,
    tags.length >= maxTags ? `${name}-limit` : null,
    highlightedTag !== null ? `${name}-duplicate` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-2" data-testid="forward-email-input">
      {/* Screen reader announcement for tag count */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {t('aria.tags_count.string', { count: tags.length, max: maxTags })}
      </span>

      <div
        className="input-with-tag flex flex-wrap items-center gap-2 rounded-md border border-gray-300 px-2 py-2"
        role="group"
        aria-label={t('aria.email_input_group.string')}
        data-tags-count={tags.length}
        data-max-reached={tags.length >= maxTags}
      >
        <div role="list" className="contents">
          {tags.map((tag, i) => (
            <Tag
              key={tag.id}
              value={tag.value}
              icon={'trash-2'}
              action={() => memoizedRemove(i)}
              aria-label={t('aria.remove_email.string', { email: tag.value })}
              data-testid={`email-tag-${i}`}
              className={cn(
                highlightedTag === i &&
                  'animate-shake border-destructive ring-destructive/20 border-2 ring-2',
                newTagIds.has(tag.id) &&
                  'animate-fade-in bg-primary/10 dark:bg-primary/20 ring-primary/30 ring-2',
                selectedForDeletion === i &&
                  'ring-destructive/50 bg-destructive/10 ring-2'
              )}
            />
          ))}
        </div>
        <div className="min-w-48 flex-1">
          <Input
            ref={inputRef}
            type="email"
            autoComplete="email"
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
            onChange={handleChange}
            value={pendingValue}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={showInvalidError || !!errors?.[name]}
            aria-describedby={errorIds || undefined}
            data-testid="email-input-field"
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {/* Error messages with IDs for aria-describedby */}
      {showInvalidError && (
        <p
          id={`${name}-invalid`}
          role="alert"
          className="text-destructive text-xs"
        >
          {t('errors.email.invalid.string')}
        </p>
      )}
      {showBlurHint && !showInvalidError && (
        <p id={`${name}-hint`} className="text-muted-foreground text-xs">
          {t('hints.blur.string')}
        </p>
      )}
      {tags.length >= maxTags && (
        <p
          id={`${name}-limit`}
          role="alert"
          className="text-destructive text-xs"
        >
          {t('errors.max_reached.string', { max: maxTags })}
        </p>
      )}
      {highlightedTag !== null && !showInvalidError && (
        <p
          id={`${name}-duplicate`}
          role="alert"
          className="text-destructive text-xs"
        >
          {t('errors.email.duplicate.string')}
        </p>
      )}
    </div>
  )
}

export default ForwardEmailInput
