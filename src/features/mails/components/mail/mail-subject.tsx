import { cn } from '@/lib/utils'
import React from 'react'
import { MailSubjectProps } from './types'

const MailSubject: React.FC<MailSubjectProps & { className?: string }> = ({
  subject,
  labels,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center gap-x-2 gap-y-2 px-2 py-3 sm:px-6 sm:py-4',
        className
      )}
    >
      <h1 className="text-lg font-bold whitespace-normal sm:text-xl">
        {subject}
      </h1>
      {labels}
    </div>
  )
}

export default MailSubject
