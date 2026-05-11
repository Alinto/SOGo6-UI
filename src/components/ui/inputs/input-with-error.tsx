'use client'

import { cn } from '@/lib/utils'
import { ErrorMessage } from '@hookform/error-message'
import { useTranslations } from 'next-intl'
import React from 'react'
import { FieldErrors } from 'react-hook-form'
import { Input } from '../input'

interface InputWithErrorProps {
  errors?: FieldErrors
  errorName: string
  className?: string
}

const InputWithError = React.forwardRef<
  HTMLInputElement,
  InputWithErrorProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ errors, errorName, className, ...props }, ref) => {
  const t = useTranslations()
  return (
    <>
      <Input
        ref={ref}
        className={cn(
          'flex',
          errors && errors[errorName] && 'border-destructive border',
          className
        )}
        {...props}
      />
      {errors && (
      <ErrorMessage
        errors={errors}
        name={errorName}
        render={({ message }) => (
          <div className="text-destructive text-sm">{t(message)}</div>
        )}
      />
      )}
    </>
  )
})
InputWithError.displayName = 'InputWithError'

export default InputWithError
