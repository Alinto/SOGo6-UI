import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { MailFilter } from '../mail-filters-types'
import type { useUpdateMailFiltersSettingsMutation } from '../store/mail-filters-settings-api'

interface Props {
  data: MailFilter[] | undefined
  accountId: string
  update: ReturnType<typeof useUpdateMailFiltersSettingsMutation>[0]
}

const LazyFiltersFormCore = lazy(() => import('./filters-form-core'))

const LazyFiltersForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyFiltersFormCore {...props} />
  </LazyWrapper>
)

export default LazyFiltersForm
