import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { MailFilter } from '../mail-filters-types'

interface FilterEditDialogProps {
  open: boolean
  filter?: MailFilter
  accountId: string
  onOpenChange: (open: boolean) => void
  onSave: (filter: MailFilter) => void
}

const LazyFilterEditDialog = lazy(() => import('./filter-form-core'))

const FilterEditDialog: React.FC<FilterEditDialogProps> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyFilterEditDialog {...props} />
  </LazyWrapper>
)

export default FilterEditDialog
