import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'

import type { UserMailGeneral } from '@/features/user-settings/store/user-preferences-api-types'
import { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'

// Import types

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserMailGeneral) => void
}

// Lazy load the mail general form component
const LazyMailGeneralFormCore = lazy(() => import('./mail-general-form-core'))

const LazyMailGeneralForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyMailGeneralFormCore {...props} />
  </LazyWrapper>
)

export { LazyMailGeneralForm as GeneralSettingsForm }
export default LazyMailGeneralForm
