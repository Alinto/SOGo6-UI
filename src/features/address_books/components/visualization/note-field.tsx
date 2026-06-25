import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useUpdateVCardMutation } from '../../store/address-books-api'
import { getContactApiErrorMessageKey } from '../../utils/map-contact-api-error'

interface NoteFieldProps {
  note?: string
  contactId: string
  bookId: string
  readOnly?: boolean
}

export function NoteField({
  note = '',
  contactId,
  bookId,
  readOnly = false,
}: NoteFieldProps) {
  const [isEditing, setIsEditing] = useState(!note)
  const [editedNote, setEditedNote] = useState(note)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [updateVCard, { isLoading }] = useUpdateVCardMutation()
  const t = useTranslations('CONTACT_FORM')
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')

  const handleSave = async () => {
    setSubmitError(null)
    try {
      const result = await updateVCard({
        id: contactId,
        book_id: bookId,
        note: editedNote,
      }).unwrap()
      setIsEditing(false)
      setEditedNote(result.note || '')
    } catch (error) {
      setSubmitError(tErrors(getContactApiErrorMessageKey(error, 'contact_form')))
    }
  }

  const handleCancel = () => {
    setEditedNote(note)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedNote(note)
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <div className="bg-muted/50 space-y-3 rounded-md p-4">
        {submitError && (
          <p className="text-destructive text-sm">{submitError}</p>
        )}
        <Textarea
          value={editedNote}
          onChange={(e) => setEditedNote(e.target.value)}
          className="min-h-[100px] resize-none"
          placeholder={t('notes.string')}
          disabled={isLoading}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t('cancel.string')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
          >
            {t('save.string')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-muted/50 relative rounded-md p-4">
      {note ? (
        <p className="text-foreground text-sm whitespace-pre-wrap sm:text-base">
          {note}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm italic sm:text-base">
          {t('no_notes.string')}
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={handleEdit}
        disabled={readOnly}
        aria-label={t('edit_note.string')}
      >
        {note ? t('edit.string') : t('add_note.string')}
      </Button>
    </div>
  )
}
