'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InputWithTags from '@/components/ui/inputs/input-with-tags'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProfile } from '@/features/user-profile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { Paperclip, Video, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'
import {
  setPendingInsert,
  updateRecipients,
} from '../../store/mail-compose-slice'

interface ComposeHeaderProps {
  onClose?: () => void
}

type RecipientTag = { id: string; value: string }
type RecipientField = 'to' | 'cc' | 'bcc'

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const ComposeHeader: React.FC<ComposeHeaderProps> = ({ onClose }) => {
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const tCommons = useTranslations('COMMONS')
  const t = useTranslations('COMPOSE')

  const dispatch = useAppDispatch()
  const activeDraftId = useAppSelector(
    (state) => state.mailCompose.activeDraftId
  )

  const {
    mainAccount,
    externalAccounts,
    defaultIdentity,
    identitiesEnabled,
    customFromEnabled,
    user,
    jitsiLinkEnabled,
    jitsiBaseUrl,
    mailMaxRecipient,
  } = useProfile()

  const [toTags, setToTags] = React.useState<RecipientTag[]>([])
  const [ccTags, setCcTags] = React.useState<RecipientTag[]>([])
  const [bccTags, setBccTags] = React.useState<RecipientTag[]>([])

  const dispatchRecipients = useCallback(
    (field: RecipientField, tags: RecipientTag[]) => {
      if (!activeDraftId) return
      dispatch(
        updateRecipients({
          draftId: activeDraftId,
          field,
          recipients: tags.map((tag) => ({ email: tag.value })),
        })
      )
    },
    [activeDraftId, dispatch]
  )

  const makeHandlers = useCallback(
    (
      field: RecipientField,
      tags: RecipientTag[],
      setTags: React.Dispatch<React.SetStateAction<RecipientTag[]>>
    ) => ({
      handleAdd: (value: string) => {
        const trimmed = value.trim()
        if (!trimmed || !isValidEmail(trimmed)) return
        const newTags = [...tags, { id: crypto.randomUUID(), value: trimmed }]
        setTags(newTags)
        dispatchRecipients(field, newTags)
      },
      remove: (index: number) => {
        const newTags = tags.filter((_, i) => i !== index)
        setTags(newTags)
        dispatchRecipients(field, newTags)
      },
    }),
    [dispatchRecipients]
  )

  const toHandlers = makeHandlers('to', toTags, setToTags)
  const ccHandlers = makeHandlers('cc', ccTags, setCcTags)
  const bccHandlers = makeHandlers('bcc', bccTags, setBccTags)

  const totalRecipients = toTags.length + ccTags.length + bccTags.length
  const isOverLimit =
    mailMaxRecipient > 0 && totalRecipients >= mailMaxRecipient

  const handleInsertJitsi = useCallback(() => {
    const meetId = Math.random().toString(36).substring(2, 10)
    const link = `${jitsiBaseUrl}/${meetId}`
    dispatch(setPendingInsert(`<a href="${link}">${link}</a>`))
  }, [jitsiBaseUrl, dispatch])

  const allIdentities = [
    ...(mainAccount?.identities ?? []),
    ...externalAccounts.flatMap((acc) => acc.identities),
  ]

  const defaultFrom = defaultIdentity?.mail || user?.email || ''
  const [selectedFrom, setSelectedFrom] = React.useState(defaultFrom)

  React.useEffect(() => {
    if (defaultFrom) setSelectedFrom(defaultFrom)
  }, [defaultFrom])

  const renderFromField = () => {
    if (!identitiesEnabled || allIdentities.length <= 1) {
      return <Input value={defaultFrom} readOnly className="min-w-3xl" />
    }
    if (!customFromEnabled) {
      return (
        <Select value={defaultFrom} disabled>
          <SelectTrigger className="min-w-3xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={defaultFrom}>{defaultFrom}</SelectItem>
          </SelectContent>
        </Select>
      )
    }
    return (
      <Select value={selectedFrom} onValueChange={setSelectedFrom}>
        <SelectTrigger className="min-w-3xl">
          <SelectValue placeholder={t('from.string')} />
        </SelectTrigger>
        <SelectContent>
          {allIdentities.map((identity) => (
            <SelectItem key={identity.mail} value={identity.mail}>
              {identity.name
                ? `${identity.name} <${identity.mail}>`
                : identity.mail}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <>
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">{renderFromField()}</div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-4"
            onClick={onClose}
          >
            <X className="text-muted-foreground h-6 w-6" />
            <span className="sr-only">{tCommons('close.string')}</span>
          </Button>
        )}
      </div>

      <div className="mt-2 flex w-full items-center">
        <InputWithTags
          tags={toTags}
          remove={toHandlers.remove}
          handleAdd={toHandlers.handleAdd}
          name="to"
          placeholder={t('to.string')}
          disabled={isOverLimit}
          className="w-full"
        />
        <div className="flex items-center">
          <Button
            variant="outline"
            className={`rounded-none border-r-0 border-l-0 ${showCc ? 'bg-accent text-accent-foreground' : ''}`}
            size="sm"
            onClick={() => setShowCc((prev) => !prev)}
          >
            {t('cc.string')}
          </Button>
          <Button
            variant="outline"
            className={`rounded-tl-none rounded-bl-none ${showBcc ? 'bg-accent text-accent-foreground' : ''}`}
            size="sm"
            onClick={() => setShowBcc((prev) => !prev)}
          >
            {t('bcc.string')}
          </Button>
        </div>
      </div>

      {isOverLimit && (
        <p className="text-destructive mt-1 text-xs">
          {t('max_recipients_reached.string', { max: mailMaxRecipient })}
        </p>
      )}

      {showCc && (
        <div className="mt-2">
          <InputWithTags
            tags={ccTags}
            remove={ccHandlers.remove}
            handleAdd={ccHandlers.handleAdd}
            name="cc"
            placeholder={t('cc.string')}
            disabled={isOverLimit}
            className="w-full"
          />
        </div>
      )}

      {showBcc && (
        <div className="mt-2">
          <InputWithTags
            tags={bccTags}
            remove={bccHandlers.remove}
            handleAdd={bccHandlers.handleAdd}
            name="bcc"
            placeholder={t('bcc.string')}
            disabled={isOverLimit}
            className="w-full"
          />
        </div>
      )}

      <div className="mt-2 flex w-full items-center">
        <Input
          placeholder={t('subject.string')}
          className="w-full rounded-tr-none rounded-br-none border-r-0"
        />
        <div className="flex items-center">
          <Button
            variant="outline"
            className={`rounded-tl-none rounded-bl-none ${
              jitsiLinkEnabled && jitsiBaseUrl
                ? 'rounded-tr-none rounded-br-none'
                : ''
            }`}
            size="sm"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          {jitsiLinkEnabled && jitsiBaseUrl && (
            <Button
              variant="outline"
              size="sm"
              className="border-l-0 rounded-tl-none rounded-bl-none"
              onClick={handleInsertJitsi}
              title={t('jitsi.string')}
            >
              <Video className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default ComposeHeader
