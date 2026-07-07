'use client'

import TaggedEmailInput from '@/features/user-settings/components/tagged-email-input'
import React from 'react'
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

function ForwardEmailInput(props: ForwardEmailInputProps) {
  return (
    <TaggedEmailInput
      {...props}
      translationNamespace="US_MAIL_FORWARD"
      testId="forward-email-input"
    />
  )
}

export default ForwardEmailInput
