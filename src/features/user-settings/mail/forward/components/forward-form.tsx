import type React from 'react'
import type { MailForward } from '../mail-forward-types'
import type { useUpdateMailForwardSettingsMutation } from '../store/mail-forward-settings-api'
import MailForwardSettingsForm from './forward-form-core'

interface Props {
  data: MailForward | undefined
  accountId: string
  update: ReturnType<typeof useUpdateMailForwardSettingsMutation>[0]
}

const MailForwardSettingsFormWrapper: React.FC<Props> = (props) => (
  <MailForwardSettingsForm {...props} />
)

export default MailForwardSettingsFormWrapper
