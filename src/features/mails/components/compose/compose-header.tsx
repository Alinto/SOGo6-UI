'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useRef } from 'react'
import {
  MailComposeRecipient,
  updateIdentity,
  updateRecipients,
  updateSelectedSignatureKey,
  updateSubject,
} from '../../store/mail-compose-slice'
import { selectDraftData } from '../../store/mail-compose-selectors'

interface ComposeHeaderProps {
  draftId: string
}

type RecipientTag = { id: string; value: string }
type RecipientField = 'to' | 'cc' | 'bcc'

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const ComposeHeader: React.FC<ComposeHeaderProps> = ({ draftId }) => {
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const t = useTranslations('COMPOSE')

  const dispatch = useAppDispatch()
  const subject = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.subject ?? ''
  )
  const selectedSignatureKey = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.selectedSignatureKey ?? null
  )

  const {
    mainAccount,
    externalAccounts,
    defaultIdentity,
    identitiesEnabled,
    customFromEnabled,
    user,
    mailMaxRecipient,
  } = useProfile()

  const { toRecipients, ccRecipients, bccRecipients } =
    useAppSelector(selectDraftData(draftId)) ?? {}

  const [toTags, setToTags] = React.useState<RecipientTag[]>([])
  const [ccTags, setCcTags] = React.useState<RecipientTag[]>([])
  const [bccTags, setBccTags] = React.useState<RecipientTag[]>([])

  const hasInitializedRecipients = React.useRef(false)

  React.useEffect(() => {
    if (hasInitializedRecipients.current) return
    if (!toRecipients?.length && !ccRecipients?.length && !bccRecipients?.length)
      return
    hasInitializedRecipients.current = true
    setToTags(
      toRecipients?.map((r: MailComposeRecipient) => ({ id: crypto.randomUUID(), value: r.email }))
    )
    setCcTags(
      ccRecipients?.map((r: MailComposeRecipient) => ({ id: crypto.randomUUID(), value: r.email }))
    )
    setBccTags(
      bccRecipients?.map((r: MailComposeRecipient) => ({ id: crypto.randomUUID(), value: r.email }))
    )
    if (ccRecipients?.length > 0) setShowCc(true)
    if (bccRecipients?.length > 0) setShowBcc(true)
  }, [toRecipients, ccRecipients, bccRecipients])

  const dispatchRecipients = useCallback(
    (field: RecipientField, tags: RecipientTag[]) => {
      dispatch(
        updateRecipients({
          draftId,
          field,
          recipients: tags.map((tag) => ({ email: tag.value })),
        })
      )
    },
    [draftId, dispatch]
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

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(updateSubject({ draftId, subject: e.target.value }))
    },
    [draftId, dispatch]
  )

  const defaultFrom = defaultIdentity?.mail || user?.email || ''
  const [selectedFrom, setSelectedFrom] = React.useState(defaultFrom)

  React.useEffect(() => {
    if (defaultFrom) setSelectedFrom(defaultFrom)
  }, [defaultFrom])

  const memoizedIdentities = React.useMemo(
    () => [
      ...(mainAccount?.identities ?? []),
      ...externalAccounts.flatMap((acc) => acc.identities),
    ],
    [mainAccount?.identities, externalAccounts]
  )

  const currentIdentity = React.useMemo(
    () => memoizedIdentities.find((id) => id.mail === selectedFrom) ?? null,
    [memoizedIdentities, selectedFrom]
  )

  const availableSignatures = React.useMemo<Record<string, string>>(
    () => (currentIdentity?.signatures as Record<string, string>) ?? {},
    [currentIdentity]
  )

  //  Track previous selectedFrom to detect real identity switches
  const prevSelectedFromRef = useRef<string | null>(null)

  React.useEffect(() => {
    if (!draftId || !selectedFrom) return

    const selectedIdentity = memoizedIdentities.find(
      (id) => id.mail === selectedFrom
    )
    if (!selectedIdentity) return

    dispatch(updateIdentity({ draftId, identity: selectedIdentity }))

    //  Only reset signature key when the identity actually changes,
    // not on every render triggered by memoizedIdentities reference change
    if (prevSelectedFromRef.current !== selectedFrom) {
      prevSelectedFromRef.current = selectedFrom
      const keys = Object.keys(
        (selectedIdentity.signatures as Record<string, string>) ?? {}
      )
      if (keys.length > 0) {
        dispatch(updateSelectedSignatureKey({ draftId, key: keys[0] }))
      }
    }
  }, [selectedFrom, draftId, memoizedIdentities, dispatch])

  const handleSignatureSelect = useCallback(
    (key: string | null) => {
      dispatch(updateSelectedSignatureKey({ draftId, key }))
    },
    [draftId, dispatch]
  )

  const signatureKeys = Object.keys(availableSignatures)
  const hasSignatures = signatureKeys.length > 0

  const renderSignatureButton = () => {
    if (!hasSignatures) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            title={t('signature.string')}
          >
            <PenLine className="h-3.5 w-3.5 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="z-[9999] min-w-[160px]">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => handleSignatureSelect(null)}
              className={selectedSignatureKey === null ? 'font-medium' : ''}
            >
              {selectedSignatureKey === null && <span className="mr-2">✓</span>}
              {t('no_signature.string')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {signatureKeys.map((key) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => handleSignatureSelect(key)}
                className={selectedSignatureKey === key ? 'font-medium' : ''}
              >
                {selectedSignatureKey === key && (
                  <span className="mr-2">✓</span>
                )}
                {key}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const renderFromField = () => {
    if (!identitiesEnabled || memoizedIdentities.length <= 1) {
      return <Input value={defaultFrom} readOnly className="min-w-3xl" />
    }
    if (!customFromEnabled) {
      return (
        <Select value={defaultFrom} disabled>
          <SelectTrigger className="min-w-3xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
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
        <SelectContent className="z-[9999]">
          {memoizedIdentities.map((identity) => (
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">{renderFromField()}</div>
          <div className="flex-shrink-0">{renderSignatureButton()}</div>
        </div>
      </div>

      <div className="mt-2 flex w-full items-stretch">
        <div className="flex-1 min-w-0">
          <InputWithTags
            tags={toTags}
            remove={toHandlers.remove}
            handleAdd={toHandlers.handleAdd}
            name="to"
            placeholder={t('to.string')}
            disabled={isOverLimit}
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <span
            role="button"
            tabIndex={0}
            onClick={() => setShowCc((prev) => !prev)}
            onKeyDown={(e) => e.key === 'Enter' && setShowCc((prev) => !prev)}
            className={`cursor-pointer select-none text-sm ${showCc ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            {t('cc.string')}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setShowBcc((prev) => !prev)}
            onKeyDown={(e) => e.key === 'Enter' && setShowBcc((prev) => !prev)}
            className={`cursor-pointer select-none text-sm ${showBcc ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            {t('bcc.string')}
          </span>
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
          />
        </div>
      )}

      <div className="mt-2 flex w-full items-center">
        <Input
          value={subject}
          onChange={handleSubjectChange}
          placeholder={t('subject.string')}
          className="w-full rounded-tr-none rounded-br-none border-r-0"
        />
      </div>
    </>
  )
}

export default ComposeHeader
