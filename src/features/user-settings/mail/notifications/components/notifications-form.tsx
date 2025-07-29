import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { MailNotifications } from '../mail-notifications-type'
import type { useUpdateMailNotificationsSettingsMutation } from '../store/mail-notifications-settings-api'

interface Props {
  data: MailNotifications | undefined
  update: ReturnType<typeof useUpdateMailNotificationsSettingsMutation>[0]
}

// Lazy load the notifications form component
const LazyNotificationsFormCore = lazy(
  () => import('./notifications-form-core')
)

const LazyNotificationsForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyNotificationsFormCore {...props} />
  </LazyWrapper>
)

export default LazyNotificationsForm
