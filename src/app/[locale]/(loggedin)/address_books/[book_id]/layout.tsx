'use client'

import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

export default function Layout({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  const pathname = usePathname()
  const { push } = useRouter()
  const { book_id } = useParams()
  const t = useTranslations('CONTACT_FORM')

  // Check if a contact is selected (pathname contains a contact ID after book_id)
  const basePath = `/address_books/${book_id}`
  const isContactSelected =
    pathname !== basePath && pathname.startsWith(`${basePath}/`)

  const handleBack = () => {
    push(basePath)
  }

  return (
    <div className="flex min-h-full">
      {/* List Column - hidden on mobile when contact is selected */}
      <div
        className={`w-full md:w-1/2 md:rounded lg:w-2/5 ${
          isContactSelected ? 'hidden md:block' : 'block'
        }`}
      >
        {children}
      </div>

      {/* Desktop Visualization - side panel */}
      <div className="hidden md:flex md:w-1/2 md:rounded lg:w-3/5">
        {visualization}
      </div>

      {/* Mobile Visualization - full screen when contact is selected */}
      {isContactSelected && (
        <div className="bg-background fixed inset-0 z-50 flex flex-col md:hidden">
          <div className="flex items-center gap-2 border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label={t('back_to_list.string')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {t('contact_details.string')}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">{visualization}</div>
        </div>
      )}
    </div>
  )
}
