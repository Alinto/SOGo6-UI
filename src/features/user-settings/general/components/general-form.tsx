import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'

// Import types
import type { GeneralSettings } from '../general-types'

interface Props {
  data: GeneralSettings | undefined
  update: (_data: GeneralSettings) => void
}

// Lazy load the general form component
const LazyGeneralFormCore = lazy(() => import('./general-form-core'))

const LazyGeneralForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyGeneralFormCore {...props} />
  </LazyWrapper>
)

export { LazyGeneralForm as GeneralSettingsForm }
export default LazyGeneralForm
