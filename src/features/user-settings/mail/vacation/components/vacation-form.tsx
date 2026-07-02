import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import type React from 'react'
import { lazy } from 'react'
import type { MailVacation } from '../mail-vacation-types'
import type { useUpdateMailVacationSettingsMutation } from '../store/mail-vacation-settings-api'

interface Props {
  data: MailVacation | undefined
  accountId: string
  timezone?: string
  vacationAllowResponseAlways: boolean
  update: ReturnType<typeof useUpdateMailVacationSettingsMutation>[0]
}

const LazyVacationFormCore = lazy(() => import('./vacation-form-core'))

const MailVacationSettingsForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyVacationFormCore {...props} />
  </LazyWrapper>
)

export default MailVacationSettingsForm
