import { cn } from '@/lib/utils'
import React from 'react'
import { MailSubjectProps } from './types'

const MailSubject: React.FC<MailSubjectProps & { className?: string }> = ({
  subject,
  className,
}) => {
  return (
    <h1
      className={cn(
        'w-full px-2 py-3 text-lg font-bold whitespace-normal sm:px-6 sm:py-4 sm:text-xl',
        className
      )}
    >
      {subject}
    </h1>
  )
}

export default MailSubject
