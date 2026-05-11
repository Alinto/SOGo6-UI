'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import AddressBooksSettingsForm from './components/address-books-form'
import LabelsFormSkeleton from './components/skeleton'

import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesContactMutation,
} from '@/features/user-settings/store/user-preferences-api'

const AddressBooksSettings: React.FC = () => {
  const t = useTranslations('US_ADDRESS_BOOKS')
  const { data, error, isFetching } = useGetUserPreferencesQuery()
  const [updateAddressBooks] = useUpdateUserPreferencesContactMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        <LabelsFormSkeleton />
      ) : (
        <AddressBooksSettingsForm
          data={data?.data}
          update={updateAddressBooks}
        />
      )}
    </div>
  )
}

export default AddressBooksSettings
