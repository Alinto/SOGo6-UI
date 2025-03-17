'use client'

import { cn } from '@/lib/utils'
import { ErrorMessage } from '@hookform/error-message'
import { useTranslations } from 'next-intl'
import { FieldErrors } from 'react-hook-form'
import { Input } from '../input'

interface InputWithErrorProps {
  errors?: FieldErrors
  errorName: string
  className?: string
}

const InputWithError: React.FC<
  InputWithErrorProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({ errors, errorName, className, ...props }) => {
  const t = useTranslations('Form_Errors')
  return (
    <>
      <Input
        className={cn(
          'flex',
          errors && errors[errorName] && 'border border-destructive',
          className
        )}
        {...props}
      />
      <ErrorMessage
        errors={errors}
        name={errorName}
        render={({ message }) => (
          <div className="text-sm text-destructive">{t(message)}</div>
        )}
      />
    </>
  )
}

export default InputWithError
