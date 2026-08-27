'use client'

import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { filterOwnedAddressBooks } from '@/features/user-settings/access/utils/owned-items'
import { useGetAddressBooksQuery } from '@/features/address_books/store/address-books-api'
import { useProfile } from '@/features/user-profile'
import { Contact } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import AddressBookAccessListRow from './components/address-book-access-list-row'
import AddressBookAccessSkeleton from './components/address-book-access-skeleton'

const AddressBooksAccessSettings: React.FC = () => {
  const t = useTranslations('US_ADDRESS_BOOKS_ACCESS')
  const { folderSharingDisabled } = useProfile()

  const { data, error, isLoading } = useGetAddressBooksQuery()
  const addressBooks = React.useMemo(
    () => (data ? filterOwnedAddressBooks(data) : []),
    [data]
  )
  const isDisabled = folderSharingDisabled.includes('contact')

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<AddressBookAccessSkeleton />}
    >
      {isDisabled ? (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {t('disabled.string')}
        </div>
      ) : addressBooks.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          <Contact className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">{t('empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addressBooks.map((addressBook) => (
            <AddressBookAccessListRow
              key={addressBook.id}
              addressBook={addressBook}
            />
          ))}
        </div>
      )}
    </SettingsAsyncPage>
  )
}

export default AddressBooksAccessSettings
