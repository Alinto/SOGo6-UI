'use client'

import { Input } from '@/components/ui/input'
import Tag from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { extractEmails, isValidEmail } from '@/lib/validations'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FieldErrors } from 'react-hook-form'

interface TaggedEmailInputProps {
  translationNamespace: string
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
  testId?: string
}

function TaggedEmailInput({
  translationNamespace,
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
  testId = 'tagged-email-input',
}: TaggedEmailInputProps) {
  const t = useTranslations(translationNamespace)
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

  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blurHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const syncedValue = (propValue as string) || ''
  useEffect(() => {
    if (syncedValue !== pendingValue) {
      setPendingValue(syncedValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncedValue])

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

  const addEmail = useCallback(
    (email: string): boolean => {
      const trimmedEmail = email.trim()
      if (!trimmedEmail) return false

      if (!isValidEmail(trimmedEmail)) {
        setTemporaryError(setShowInvalidError, errorTimeoutRef)
        return false
      }

      const duplicateIndex = isDuplicate(trimmedEmail)
      if (duplicateIndex !== null) {
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

  const memoizedRemove = useCallback(
    (index: number) => {
      if (!disabled) remove(index)
    },
    [remove, disabled]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      const input = e.currentTarget
      const value = input.value

      if (e.key === 'Backspace' && !value && tags.length > 0) {
        e.preventDefault()
        const lastIndex = tags.length - 1

        if (selectedForDeletion === lastIndex) {
          memoizedRemove(lastIndex)
          setSelectedForDeletion(null)
        } else {
          setSelectedForDeletion(lastIndex)
        }
        return
      }

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

      if ((e.key === 'Tab' || e.key === ',' || e.key === ';') && value.length) {
        e.preventDefault()
        e.stopPropagation()

        if (e.key === ',' || e.key === ';') {
          const beforeSeparator = value.substring(0, value.length - 1)
          if (beforeSeparator.trim()) {
            addEmail(beforeSeparator)
          }
          return
        }

        addEmail(value)
      }
    },
    [disabled, tags.length, selectedForDeletion, memoizedRemove, addEmail]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return

      e.preventDefault()
      const pastedText = e.clipboardData.getData('text')
      const emails = extractEmails(pastedText)

      if (emails.length > 1) {
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
        setPendingValue(emails[0])
        inputRef.current?.focus()
      }
    },
    [disabled, isDuplicate, tags.length, maxTags, handleAdd]
  )

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

  const errorIds = [
    showInvalidError ? `${name}-invalid` : null,
    showBlurHint ? `${name}-hint` : null,
    tags.length >= maxTags ? `${name}-limit` : null,
    highlightedTag !== null ? `${name}-duplicate` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-2" data-testid={testId}>
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
                  'animate-fade-in bg-primary/10 ring-primary/30 ring-2',
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

export default TaggedEmailInput
