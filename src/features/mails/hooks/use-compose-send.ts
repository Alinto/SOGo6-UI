'use client'

import { useAppDispatch } from '@/lib/redux/hooks'
import React from 'react'
import { closeDraft } from '../store'
import { useSendMailMutation } from '../store/mail-api'
import {
  buildComposeMailPayload,
  type ComposeMailFields,
} from '../utils/build-compose-mail-payload'

export type EmptyContentAlert = 'subject' | 'body' | 'both'

interface UseComposeSendOptions extends ComposeMailFields {
  draftId: string
  accountId: string
  mailKey: string | null
}

export function useComposeSend({
  draftId,
  accountId,
  mailKey,
  toRecipients,
  subject,
  body,
  ...mailFields
}: UseComposeSendOptions) {
  const dispatch = useAppDispatch()
  const [sendMail, { isLoading: isSending }] = useSendMailMutation()

  const [showNoRecipientAlert, setShowNoRecipientAlert] = React.useState(false)
  const [emptyContentAlert, setEmptyContentAlert] =
    React.useState<EmptyContentAlert | null>(null)

  const performSend = async () => {
    if (!mailFields.selectedIdentity?.mail) return

    const result = await sendMail({
      accountId,
      mailKey,
      mail: buildComposeMailPayload({
        toRecipients,
        subject,
        body,
        ...mailFields,
      }),
    })

    if (!('error' in result)) {
      dispatch(closeDraft({ draftId }))
    }
  }

  const handleSend = async () => {
    if (!mailFields.selectedIdentity?.mail) return

    if (toRecipients.length === 0) {
      setShowNoRecipientAlert(true)
      return
    }

    const isSubjectEmpty = subject.trim().length === 0
    const isBodyEmpty = body.trim().length === 0

    if (isSubjectEmpty && isBodyEmpty) {
      setEmptyContentAlert('both')
      return
    }
    if (isSubjectEmpty) {
      setEmptyContentAlert('subject')
      return
    }
    if (isBodyEmpty) {
      setEmptyContentAlert('body')
      return
    }

    await performSend()
  }

  const handleConfirmSendAnyway = async () => {
    setEmptyContentAlert(null)
    await performSend()
  }

  return {
    isSending,
    handleSend,
    handleConfirmSendAnyway,
    showNoRecipientAlert,
    setShowNoRecipientAlert,
    emptyContentAlert,
    setEmptyContentAlert,
  }
}
