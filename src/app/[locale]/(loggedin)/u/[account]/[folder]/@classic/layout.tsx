'use client'

import { Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'

function EmptyState() {
  const t = useTranslations('MAILS_LIST')
  return (
    <div className="text-muted-foreground flex h-full w-full select-none flex-col items-center justify-center gap-4">
      <div className="bg-muted rounded-full p-6">
        <Mail className="h-10 w-10 opacity-40" />
      </div>
      <p className="text-sm font-medium opacity-50">{t('select_message.string')}</p>
    </div>
  )
}

export default function ClassicLayout({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  const pathname = usePathname()
  const { folder } = useParams()

  const decodedPathname = decodeURIComponent(pathname)
  const folderStr = Array.isArray(folder)
    ? folder.map(decodeURIComponent).join('/')
    : decodeURIComponent(folder ?? '')

  const folderIndex = decodedPathname.lastIndexOf(`/${folderStr}`)
  const afterFolder =
    folderIndex !== -1
      ? decodedPathname.slice(folderIndex + folderStr.length + 1)
      : ''
  const hasMailSelected = afterFolder.length > 0

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <div className="border-border flex h-full w-[38%] min-w-0 shrink-0 flex-col overflow-hidden border-r" style={{ minWidth: 'min(280px, 38%)' }}>
          {children}
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {hasMailSelected ? visualization : <EmptyState />}
        </div>
      </div>
    </div>
  )
}
