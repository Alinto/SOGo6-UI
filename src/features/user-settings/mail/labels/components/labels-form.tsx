import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { MailLabel } from '../mail-labels-types'
import type { useUpdateMailLabelsSettingsMutation } from '../store/mail-labels-settings-api'

interface Props {
  data: MailLabel[] | undefined
  update: ReturnType<typeof useUpdateMailLabelsSettingsMutation>[0]
}

// Lazy load the labels form component
const LazyLabelsFormCore = lazy(() => import('./labels-form-core'))

const LazyLabelsForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyLabelsFormCore {...props} />
  </LazyWrapper>
)

export default LazyLabelsForm
