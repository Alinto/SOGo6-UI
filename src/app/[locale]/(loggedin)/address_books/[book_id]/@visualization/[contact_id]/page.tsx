'use client'

import VisualizationSkeleton from '@/features/address_books/components/skeletons/visualization-skeleton'
import Visualization from '@/features/address_books/components/visualization'
import { useGetVCardQuery } from '@/features/address_books/store/address-books-api'
import { useParams } from 'next/navigation'
import React from 'react'

const Page: React.FC = () => {
  const { contact_id, book_id } = useParams()
  const { data, isFetching } = useGetVCardQuery({
    id: contact_id as string,
    book_id: book_id as string,
  })
  if (isFetching) {
    return <VisualizationSkeleton />
  }
  if (!data || Array.isArray(data)) {
    // You can render an error, fallback, or null if data is not a single VCard
    return null
  }
  return <Visualization data={data} />
}

export default Page
