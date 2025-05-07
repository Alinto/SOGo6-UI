import { Copy } from 'lucide-react'
import React from 'react'

interface EmailItemProps {
  email: string
}

const EmailItem: React.FC<EmailItemProps> = ({ email }) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <a href={`mailto:${email}`}>{email}</a>
        <Copy
          onClick={() => {
            navigator.clipboard.writeText(email)
          }}
          className="ml-4 cursor-pointer"
          color="#000"
        />
      </div>
      <div className="flex w-1/5 justify-end"></div>
    </div>
  )
}

export default EmailItem
