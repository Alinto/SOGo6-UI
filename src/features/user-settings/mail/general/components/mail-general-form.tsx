import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'

// Import types
import type { MailGeneralSettings } from '../mail-general-types'
import type { useUpdateMailGeneralSettingsMutation } from '../store/mail-general-settings-api'

interface Props {
  data: MailGeneralSettings | undefined
  update: ReturnType<typeof useUpdateMailGeneralSettingsMutation>[0]
}

// Lazy load the mail general form component
const LazyMailGeneralFormCore = lazy(() => import('./mail-general-form-core'))

const LazyMailGeneralForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyMailGeneralFormCore {...props} />
  </LazyWrapper>
)

export default LazyMailGeneralForm
