import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import {
  UserPreferences,
  UserSecurity,
} from '@/features/user-settings/store/user-preferences-api-types'
import type React from 'react'
import { lazy } from 'react'

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserSecurity) => void
}

// Lazy load the totp form component
const LazyTotpFormCore = lazy(() => import('./totp-form-core'))

const LazyTotpForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyTotpFormCore {...props} />
  </LazyWrapper>
)

export { LazyTotpForm as TotpSettingsForm }
export default LazyTotpForm
