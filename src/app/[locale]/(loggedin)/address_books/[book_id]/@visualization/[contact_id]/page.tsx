'use client'

import VisualizationSkeleton from '@/features/address_books/components/skeletons/visualization-skeleton'
import Visualization from '@/features/address_books/components/visualization'
import { useGetVCardQuery } from '@/features/address_books/store/address-books-api'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

const Page: React.FC = () => {
  const { contact_id, book_id } = useParams()
  const { data, isLoading, isError } = useGetVCardQuery({
    id: contact_id as string,
    book_id: book_id as string,
  })

  if (isLoading) {
    return <VisualizationSkeleton />
  }

  if (isError || !data || Array.isArray(data)) {
    return (
      <div className="text-destructive flex h-full items-center justify-center p-8 text-sm">
        <ContactLoadError />
      </div>
    )
  }

  return <Visualization data={data} />
}

function ContactLoadError() {
  const t = useTranslations('CONTACT_FORM')
  return <p>{t('load_error.title.string')}</p>
}

export default Page
