import { redirect } from 'next/navigation'
import React from 'react'

const AddressBooksPage: React.FC = () => {
  return redirect('/address_books/work')
}

export default AddressBooksPage
