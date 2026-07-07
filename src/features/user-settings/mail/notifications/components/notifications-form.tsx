import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { MailNotification } from '../mail-notifications-type'
import type { useUpdateMailNotificationSettingsMutation } from '../store/mail-notifications-settings-api'

interface Props {
  data: MailNotification | undefined
  accountId: string
  update: ReturnType<typeof useUpdateMailNotificationSettingsMutation>[0]
}

const LazyNotificationsFormCore = lazy(
  () => import('./notifications-form-core')
)

const LazyNotificationsForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyNotificationsFormCore {...props} />
  </LazyWrapper>
)

export default LazyNotificationsForm
