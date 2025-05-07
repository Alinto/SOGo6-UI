import { Copy } from 'lucide-react'
import React from 'react'

interface EmailItemProps {
  name: string
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
          className="cursor-pointer ml-4"
          color="#000"
        />
      </div>
      <div className="w-1/5 flex justify-end"></div>
    </div>
  )
}

export default EmailItem
