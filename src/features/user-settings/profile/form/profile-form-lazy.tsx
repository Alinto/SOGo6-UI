'use client'

import { createLazyImport, FormLoader } from '@/components/lazy-components'

// Lazy load the profile form component
const LazyProfileForm = createLazyImport(
  () => import('./profile-form-core'),
  <FormLoader />
)

export default LazyProfileForm
