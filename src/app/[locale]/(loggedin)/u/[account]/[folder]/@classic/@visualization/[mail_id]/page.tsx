'use client'

import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

interface PageProps {
  params: {
    locale: string
    account: string
    folder: string
    mail_id: string
  }
}

const MailPage: React.FC<PageProps> = () => {
  const { mail_id } = useParams()
  const { push } = useRouter()
  const pathname = usePathname()
  return (
    <div className={`${mail_id ? 'flex' : 'hidden'} w-full xl:w-1/2 2xl:w-2/3`}>
      <ArrowLeft
        className="hover:text-primary/80 mb-2 block cursor-pointer lg:hidden"
        onClick={() => {
          // Remove the last part of the pathname and push to the url
          const path = pathname
          const newPath = path.substring(0, path.lastIndexOf('/'))
          push(newPath)
        }}
      />
      <h1>Mail Detail @classic</h1>
      <ul>
        <li>Mail ID: {mail_id}</li>
      </ul>
    </div>
  )
}

export default MailPage
