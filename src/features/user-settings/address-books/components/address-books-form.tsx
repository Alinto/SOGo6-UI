import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'

// Import types
import type { AddressBook } from '../address-books-types'
import type { useUpdateAddressBooksSettingsMutation } from '../store/address-books-api'

interface Props {
  data: AddressBook[] | undefined
  update: ReturnType<typeof useUpdateAddressBooksSettingsMutation>[0]
}

// Lazy load the address books form component
const LazyAddressBooksFormCore = lazy(() => import('./address-books-form-core'))

const LazyAddressBooksForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyAddressBooksFormCore {...props} />
  </LazyWrapper>
)

export default LazyAddressBooksForm
