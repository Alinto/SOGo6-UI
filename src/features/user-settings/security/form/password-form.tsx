import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import { lazy } from 'react'

// Lazy load the password form component
const LazyPasswordFormCore = lazy(() => import('./password-form-core'))

const LazyPasswordForm = () => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyPasswordFormCore />
  </LazyWrapper>
)

export default LazyPasswordForm
