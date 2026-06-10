import { Badge } from '@/components/ui/badge'
import { cn, tagDismissButtonClassName } from '@/lib/utils'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import React from 'react'

import { isValidEmail } from '@/lib/validations'

interface EmailsTagInput {
  placeholder?: string
  value?: string[]
  onChange: (e: string[]) => void
  maxEmails?: number
  className?: string
  disabled?: boolean
}

export function EmailsTagInput({
  placeholder,
  value = [],
  onChange,
  maxEmails,
  className = '',
  disabled = false,
}: EmailsTagInput) {
  const t = useTranslations('FORM_COMMONS')

  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const emails = value

  const addEmail = (raw: string) => {
    const email = raw.trim().toLowerCase()
    if (!email) return

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (emails.includes(email)) {
      setError('This email has already been added.')
      return
    }
    if (maxEmails && emails.length >= maxEmails) {
      setError(`You can only add up to ${maxEmails} emails.`)
      return
    }

    onChange([...emails, email])
    setInputValue('')
    setError('')
  }

  const removeEmail = (email: string) => {
    onChange(emails.filter((e) => e !== email))
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault()
      addEmail(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      removeEmail(emails[emails.length - 1])
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const parts = pasted.split(/[\s,;]+/).filter(Boolean)
    const newEmails: string[] = []
    let lastError = ''

    for (const part of parts) {
      const email = part.trim().toLowerCase()
      if (!isValidEmail(email)) {
        lastError = `"${email}" is not a valid email and was skipped.`
        continue
      }
      if (emails.includes(email) || newEmails.includes(email)) {
        lastError = `"${email}" is a duplicate and was skipped.`
        continue
      }
      if (maxEmails && emails.length + newEmails.length >= maxEmails) {
        lastError = `Maximum of ${maxEmails} emails reached.`
        break
      }
      newEmails.push(email)
    }

    if (newEmails.length > 0) onChange([...emails, ...newEmails])
    if (lastError) setError(lastError)
  }

  return (
    <div
      className={cn(
        'space-y-2',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className
      )}
    >
      <div
        className={cn(
          'bg-background ring-offset-background min-h-[2.75rem] w-full cursor-text rounded-md border px-3 py-2 text-sm transition-colors',
          'flex flex-wrap items-start gap-1.5',
          focused
            ? 'ring-ring border-ring ring-2 ring-offset-2 outline-none'
            : 'border-input',
          error && 'border-destructive ring-destructive'
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {emails.map((email) => (
          <Badge
            key={email}
            variant="secondary"
            className="flex max-w-[220px] shrink-0 items-center gap-1 pr-1"
          >
            <span className="truncate text-xs">{email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeEmail(email)
              }}
              className={tagDismissButtonClassName('ml-0.5 p-0.5')}
              aria-label={`Remove ${email}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}

        <input
          ref={inputRef}
          type="email"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (inputValue) addEmail(inputValue)
          }}
          placeholder={
            emails.length === 0 ? placeholder : t('emails.placeholder')
          }
          className="placeholder:text-muted-foreground min-w-[160px] flex-1 bg-transparent text-sm outline-none"
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
          disabled={!!(maxEmails && emails.length >= maxEmails) || disabled}
        />
      </div>

      {error && (
        <p id="email-error" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  )
}
