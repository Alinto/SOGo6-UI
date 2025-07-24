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
        'h-14 w-full px-6 py-4 text-xl font-bold break-words',
        className
      )}
    >
      {subject}
    </h1>
  )
}

export default MailSubject
