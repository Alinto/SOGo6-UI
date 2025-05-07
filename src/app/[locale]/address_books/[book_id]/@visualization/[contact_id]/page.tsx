'use client'

import Visualization from '@/features/address_books/components/visualization'
import { useGetVCardQuery } from '@/features/address_books/store/address-books-api'
import { useParams } from 'next/navigation'
import React from 'react'

const Page: React.FC = () => {
  const { contact_id, book_id } = useParams()
  const { data, isLoading } = useGetVCardQuery({
    id: contact_id as string,
    book_id: book_id as string,
  })
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div>
      <Visualization data={data} />
    </div>
  )
}

export default Page
