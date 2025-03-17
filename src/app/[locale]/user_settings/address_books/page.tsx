import { useTranslations } from 'next-intl'
import React from 'react'
import AddressBooksForm from './_form/address-books-form'

const AddressBooksPage: React.FC = () => {
  const t = useTranslations('Address_Books_Settings')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title')}</h2>
      <AddressBooksForm />
    </div>
  )
}

export default AddressBooksPage
