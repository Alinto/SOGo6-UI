'use client'

import { Badge } from '@/components/ui/badge'
import { cn, tagDismissButtonClassName } from '@/lib/utils'
import { XCircle } from 'lucide-react'
import * as React from 'react'

export interface MultiSelectInputProps {
  value?: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  disabled?: boolean
  name?: string
  id?: string
  /**
   * If true, prevent duplicate values (defaults to false)
   */
  dedupe?: boolean
  /**
   * Optional transform function to normalize/purge values before adding
   */
  normalize?: (v: string) => string
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  value = [],
  onChange,
  placeholder,
  disabled = false,
  name = 'multiselect',
  id,
  dedupe = false,
  normalize,
}) => {
  const [input, setInput] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const elementId = id ?? `multi-select-input-${name}`

  const addTag = (tag: string) => {
    const raw = String(tag ?? '')
    const candidate = normalize ? normalize(raw) : raw.trim()
    if (!candidate) return
    // optional dedupe
    if (dedupe && value.includes(candidate)) {
      setInput('')
      return
    }
    onChange([...value, candidate])
    setInput('')
    // focus back to input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const removeTagAt = (index: number) => {
    const next = [...value]
    next.splice(index, 1)
    onChange(next)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length) {
      // remove last tag
      e.preventDefault()
      removeTagAt(value.length - 1)
    }
  }

  const onBlur = () => {
    if (input.trim()) addTag(input)
  }

  return (
    <div
      className={cn(
        'flex min-h-[36px] w-full flex-wrap items-center gap-2 rounded border px-2 py-1',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      onClick={() => {
        if (!disabled) inputRef.current?.focus()
      }}
      aria-disabled={disabled}
      role="group"
      aria-label={placeholder ?? 'Multi value input'}
    >
      {Array.isArray(value) &&
        value.map((v, idx) => (
          <Badge
            key={`${v}-${idx}`}
            className="flex items-center gap-2 px-2 py-0.5 text-sm"
          >
            <span className="max-w-[160px] truncate">{v}</span>
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={(e) => {
                e.stopPropagation()
                if (disabled) return
                removeTagAt(idx)
              }}
              className={tagDismissButtonClassName(
                '-mr-1 ml-1 h-4 w-4 rounded hover:bg-white/10'
              )}
            >
              <XCircle className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      <input
        id={elementId}
        ref={inputRef}
        className="flex min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
        placeholder={placeholder ?? 'Add value and press Enter'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        disabled={disabled}
        aria-label={placeholder ?? 'Add value'}
      />
    </div>
  )
}

export default MultiSelectInput
