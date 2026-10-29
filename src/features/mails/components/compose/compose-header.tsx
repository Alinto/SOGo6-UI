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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RecipientAutocompleteField from '@/features/address_books/components/recipient-autocomplete-field'
import type { RecipientSuggestionItem } from '@/features/address_books/hooks/use-recipient-suggestions'
import { useSaveRecipientAsContact } from '@/features/address_books/hooks/use-save-recipient-as-contact'
import { useOfflineIdentities } from '@/features/offline/hooks/use-offline-identities'
import { useProfile } from '@/features/user-profile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { Check, PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useRef } from 'react'
import { selectDraftData } from '../../store/mail-compose-selectors'
import {
  MailComposeRecipient,
  updateIdentity,
  updateRecipients,
  updateSelectedSignatureKey,
  updateSubject,
} from '../../store/mail-compose-slice'

interface ComposeHeaderProps {
  draftId: string
}

type RecipientTag = { id: string; value: string; name?: string }
type RecipientField = 'to' | 'cc' | 'bcc'

// Fields are separated by lines instead of being boxed.
const ROW_CLASS = 'flex min-h-10 items-center gap-2 border-b px-3'
const PLAIN_FIELD_CLASS =
  'rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// A field never holds the same address twice, so it is a stable tag id.
const toRecipientTags = (
  recipients: MailComposeRecipient[] | undefined
): RecipientTag[] =>
  (recipients ?? []).map((recipient) => ({
    id: recipient.email.toLowerCase(),
    value: recipient.email,
    name: recipient.name,
  }))

const ComposeHeader: React.FC<ComposeHeaderProps> = ({ draftId }) => {
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const t = useTranslations('COMPOSE')

  const dispatch = useAppDispatch()
  const { saveAsContact } = useSaveRecipientAsContact()
  const subject = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.subject ?? ''
  )
  const selectedSignatureKey = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.selectedSignatureKey ?? null
  )
  const draftIdentityMail = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.selectedIdentity?.mail ?? null
  )
  const sourceOutboxId = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.sourceOutboxId ?? null
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

  // The draft's recipients are the single source of truth: tags are derived
  // from them, so changes made elsewhere (e.g. a renamed contact) show up.
  const toTags = React.useMemo(
    () => toRecipientTags(toRecipients),
    [toRecipients]
  )
  const ccTags = React.useMemo(
    () => toRecipientTags(ccRecipients),
    [ccRecipients]
  )
  const bccTags = React.useMemo(
    () => toRecipientTags(bccRecipients),
    [bccRecipients]
  )

  // Open the Cc/Bcc rows once when the draft arrives with such recipients
  // (reply all, restored draft); the user can still toggle them afterwards.
  const hasShownExistingRecipients = React.useRef(false)
  React.useEffect(() => {
    if (hasShownExistingRecipients.current) return
    if (!toTags.length && !ccTags.length && !bccTags.length) return
    hasShownExistingRecipients.current = true
    if (ccTags.length > 0) setShowCc(true)
    if (bccTags.length > 0) setShowBcc(true)
  }, [toTags.length, ccTags.length, bccTags.length])

  const makeHandlers = useCallback(
    (field: RecipientField, recipients: MailComposeRecipient[] | undefined) => {
      const current = recipients ?? []
      const save = (next: MailComposeRecipient[]) =>
        dispatch(updateRecipients({ draftId, field, recipients: next }))
      return {
        handleAdd: (value: string, suggestion?: RecipientSuggestionItem) => {
          const trimmed = value.trim()
          if (!trimmed || !isValidEmail(trimmed)) return
          if (
            current.some(
              (recipient) =>
                recipient.email.toLowerCase() === trimmed.toLowerCase()
            )
          )
            return
          save([
            ...current,
            {
              email: trimmed,
              ...(suggestion?.name ? { name: suggestion.name } : {}),
            },
          ])
        },
        remove: (index: number) => save(current.filter((_, i) => i !== index)),
      }
    },
    [draftId, dispatch]
  )

  const toHandlers = makeHandlers('to', toRecipients)
  const ccHandlers = makeHandlers('cc', ccRecipients)
  const bccHandlers = makeHandlers('bcc', bccRecipients)

  const totalRecipients = toTags.length + ccTags.length + bccTags.length
  const isOverLimit =
    mailMaxRecipient > 0 && totalRecipients >= mailMaxRecipient

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(updateSubject({ draftId, subject: e.target.value }))
    },
    [draftId, dispatch]
  )

  const profileIdentities = React.useMemo(
    () => [
      ...(mainAccount?.identities ?? []),
      ...externalAccounts.flatMap((acc) => acc.identities),
    ],
    [mainAccount?.identities, externalAccounts]
  )

  // Offline cold start: profile query has no data — fall back to the
  // identities cached in IndexedDB so compose/send keeps working.
  const offlineIdentities = useOfflineIdentities(profileIdentities.length > 0)
  const memoizedIdentities = React.useMemo(
    () =>
      profileIdentities.length > 0
        ? profileIdentities
        : (offlineIdentities ?? []),
    [profileIdentities, offlineIdentities]
  )

  // Only when the profile is unavailable (offline) do we derive a default
  // identity from the cached list; online behaviour is unchanged.
  const offlineDefaultIdentity = React.useMemo(() => {
    if (defaultIdentity || profileIdentities.length > 0) return null
    return (
      offlineIdentities?.find((id) => id.isDefault) ??
      offlineIdentities?.[0] ??
      null
    )
  }, [defaultIdentity, profileIdentities, offlineIdentities])

  const defaultFrom =
    defaultIdentity?.mail || offlineDefaultIdentity?.mail || user?.email || ''
  const [selectedFrom, setSelectedFrom] = React.useState(
    draftIdentityMail || defaultFrom
  )
  const restoredFromRef = useRef(Boolean(draftIdentityMail))

  React.useEffect(() => {
    if (draftIdentityMail) {
      if (!restoredFromRef.current) {
        restoredFromRef.current = true
        setSelectedFrom(draftIdentityMail)
      }
      return
    }
    if (defaultFrom && !restoredFromRef.current) {
      setSelectedFrom(defaultFrom)
    }
  }, [draftIdentityMail, defaultFrom])

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
      const isFirstBind = prevSelectedFromRef.current === null
      prevSelectedFromRef.current = selectedFrom
      // Restored Outbox drafts already have the queued From/signature.
      // Do not replace them with the identity's first signature on mount.
      if (isFirstBind && (sourceOutboxId || selectedSignatureKey)) {
        return
      }
      const keys = Object.keys(
        (selectedIdentity.signatures as Record<string, string>) ?? {}
      )
      if (keys.length > 0) {
        dispatch(updateSelectedSignatureKey({ draftId, key: keys[0] }))
      }
    }
  }, [
    selectedFrom,
    draftId,
    memoizedIdentities,
    dispatch,
    sourceOutboxId,
    selectedSignatureKey,
  ])

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
        <DropdownMenuContent align="start" className="min-w-[160px]">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => handleSignatureSelect(null)}
              className={selectedSignatureKey === null ? 'font-medium' : ''}
            >
              {selectedSignatureKey === null && (
                <Check className="mr-2 h-3.5 w-3.5" aria-hidden />
              )}
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
                  <Check className="mr-2 h-3.5 w-3.5" aria-hidden />
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
    const displayedFrom = selectedFrom || defaultFrom
    if (!identitiesEnabled || memoizedIdentities.length <= 1) {
      return (
        <Input value={displayedFrom} readOnly className={PLAIN_FIELD_CLASS} />
      )
    }
    if (!customFromEnabled) {
      return (
        <Select value={displayedFrom} disabled>
          <SelectTrigger className={PLAIN_FIELD_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={displayedFrom}>{displayedFrom}</SelectItem>
          </SelectContent>
        </Select>
      )
    }
    return (
      <Select value={selectedFrom} onValueChange={setSelectedFrom}>
        <SelectTrigger className={PLAIN_FIELD_CLASS}>
          <SelectValue placeholder={t('from.string')} />
        </SelectTrigger>
        <SelectContent>
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

  const renderRecipientField = (
    field: RecipientField,
    tags: RecipientTag[],
    handlers: ReturnType<typeof makeHandlers>
  ) => (
    <RecipientAutocompleteField
      tags={tags}
      remove={handlers.remove}
      handleAdd={handlers.handleAdd}
      name={field}
      placeholder={t(`${field}.string`)}
      disabled={isOverLimit}
      loadingLabel={t('recipient_search.loading.string')}
      getAddDirectLabel={(email) =>
        t('recipient_search.add_direct.string', { email })
      }
      onAddDirect={saveAsContact}
      variant="plain"
      showContactCard
    />
  )

  return (
    <>
      <div className={ROW_CLASS}>
        <div className="min-w-0 flex-1">{renderFromField()}</div>
        <div className="flex-shrink-0">{renderSignatureButton()}</div>
      </div>

      {isOverLimit && (
        <p className="text-destructive border-b px-6 py-1 text-xs">
          {t('max_recipients_reached.string', { max: mailMaxRecipient })}
        </p>
      )}
      <div className={ROW_CLASS}>
        <div className="-ml-2 min-w-0 flex-1">
          {renderRecipientField('to', toTags, toHandlers)}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-expanded={showCc}
            onClick={() => setShowCc((prev) => !prev)}
            className={`cursor-pointer text-sm select-none ${showCc ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            {t('cc.string')}
          </button>
          <button
            type="button"
            aria-expanded={showBcc}
            onClick={() => setShowBcc((prev) => !prev)}
            className={`cursor-pointer text-sm select-none ${showBcc ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            {t('bcc.string')}
          </button>
        </div>
      </div>

      {showCc && (
        <div className={ROW_CLASS}>
          <div className="-ml-2 min-w-0 flex-1">
            {renderRecipientField('cc', ccTags, ccHandlers)}
          </div>
        </div>
      )}

      {showBcc && (
        <div className={ROW_CLASS}>
          <div className="-ml-2 min-w-0 flex-1">
            {renderRecipientField('bcc', bccTags, bccHandlers)}
          </div>
        </div>
      )}

      <div className={ROW_CLASS}>
        <Input
          value={subject}
          onChange={handleSubjectChange}
          placeholder={t('subject.string')}
          className={PLAIN_FIELD_CLASS}
        />
      </div>
    </>
  )
}

export default ComposeHeader
