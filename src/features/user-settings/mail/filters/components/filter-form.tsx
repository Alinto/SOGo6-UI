import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { FieldArrayWithId } from 'react-hook-form'

interface FilterEditFormProps {
  filter?: FieldArrayWithId<{
    enabled: boolean
    id: string
    name: string
    operator: string
    rules: FieldArrayWithId<{
      id: string
      field: string
      field_value: string
      condition: string
      value: string
    }>[]
    actions: FieldArrayWithId<{
      id: string
      action: string
      value: string
    }>[]
  }>
}

// Lazy load the filter form component
const LazyFilterFormCore = lazy(() => import('./filter-form-core'))

const LazyFilterForm: React.FC<FilterEditFormProps> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyFilterFormCore {...props} />
  </LazyWrapper>
)

export default LazyFilterForm
