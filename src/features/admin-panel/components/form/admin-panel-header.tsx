'use client'

import { Textarea } from '@/components/ui/textarea'
import { useEffect, useRef, useState } from 'react'
import type { AdminPanelHeaderProps } from '../../types/form'

type Props = AdminPanelHeaderProps & {
  editableDescription?: boolean
  onSaveDescription?: (desc: string) => Promise<any> | any
}

/**
 * AdminPanelHeader:
 * - When editableDescription is false: behave as before (plain text).
 * - When editableDescription is true: show plain-looking text until user clicks (or focuses) it,
 *   then replace with the Textarea component for editing. Save on blur or Ctrl/Cmd+Enter.
 */
export default function AdminPanelHeader({
  title = 'Default',
  description,
  editableDescription = false,
  onSaveDescription,
}: Props) {
  const [value, setValue] = useState<string>(description ?? '')
  const [lastSaved, setLastSaved] = useState<string>(description ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // keep local value in sync when prop changes externally
    setValue(description ?? '')
    setLastSaved(description ?? '')
  }, [description])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // move caret to end
      const len = textareaRef.current.value?.length ?? 0
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [isEditing])

  async function saveIfChanged() {
    if (!onSaveDescription) return
    if (value === lastSaved) return
    try {
      setIsSaving(true)
      await onSaveDescription(value)
      setLastSaved(value)
    } catch (err) {
      console.error('Error saving domain description:', err)
      // keep editing mode so the user can correct
      return
    } finally {
      setIsSaving(false)
    }
  }

  function enterEditMode() {
    // initialize editing value to current lastSaved (props might have changed)
    setValue(lastSaved ?? '')
    setIsEditing(true)
  }

  function exitEditMode() {
    setIsEditing(false)
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 flex items-center gap-4 text-2xl font-bold">
        <span>{title}</span>
      </h1>

      {editableDescription ? (
        <div className="max-w-2xl">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) =>
                setValue((e.target as HTMLTextAreaElement).value)
              }
              onBlur={async () => {
                // save then exit edit mode (unless save failed)
                await saveIfChanged()
                exitEditMode()
              }}
              onKeyDown={async (e) => {
                // Save on Ctrl+Enter / Cmd+Enter
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  await saveIfChanged()
                  // blur to trigger onBlur behavior and close edit mode if save ok
                  textareaRef.current?.blur()
                } else if (e.key === 'Escape') {
                  // cancel edits on Escape
                  setValue(lastSaved ?? '')
                  exitEditMode()
                }
                // Note: plain Enter inserts newline in textarea
              }}
              placeholder="Enter domain description"
              disabled={isSaving}
              aria-label="Domain description"
              className="min-h-[80px]" // ensure visible editing area
            />
          ) : (
            // Plain text appearance until clicked/focused
            <div
              role="button"
              tabIndex={0}
              onClick={() => enterEditMode()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  enterEditMode()
                }
              }}
              className="cursor-text"
              aria-label="Edit domain description"
            >
              {lastSaved ? (
                <p className="text-base whitespace-pre-wrap">{lastSaved}</p>
              ) : (
                <p className="text-muted-foreground text-base">
                  Click to add a domain description
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        description && (
          <p className="text-muted-foreground text-base whitespace-pre-wrap">
            {description}
          </p>
        )
      )}
    </div>
  )
}
