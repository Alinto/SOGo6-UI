import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import {
  UserContactPreferences,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import type React from 'react'
import { lazy } from 'react'

// Import types

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserContactPreferences) => void
}

// Lazy load the address books form component
const LazyAddressBooksFormCore = lazy(() => import('./address-books-form-core'))

const LazyAddressBooksForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyAddressBooksFormCore {...props} />
  </LazyWrapper>
)

export default LazyAddressBooksForm
