import React from 'react'

interface MailSubjectProps {
  subject: string
}

const MailSubject: React.FC<MailSubjectProps> = ({ subject }) => {
  return (
    <h1 className="h-14 w-full px-6 py-4 text-xl font-bold break-words">
      {subject}
    </h1>
  )
}

export default MailSubject
