import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import { CalendarInvitations } from '../calendars-invitations-types'

interface Props {
  data: CalendarInvitations | undefined
  update: (_data: CalendarInvitations) => void
}

// Lazy load the invitations form component
const LazyInvitationsFormCore = lazy(() => import('./invitations-form-core'))

const LazyInvitationsForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyInvitationsFormCore {...props} />
  </LazyWrapper>
)

export default LazyInvitationsForm
