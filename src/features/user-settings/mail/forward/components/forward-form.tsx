import type React from 'react'
import type { MailForward } from '../mail-forward-types'
import type { useUpdateMailForwardSettingsMutation } from '../store/mail-forward-settings-api'
import MailForwardSettingsForm from './forward-form-core'

interface Props {
  data: MailForward | undefined
  update: ReturnType<typeof useUpdateMailForwardSettingsMutation>[0]
}

// Direct export - no lazy loading needed for this component
const ForwardForm: React.FC<Props> = (props) => {
  return <MailForwardSettingsForm {...props} />
}

export default ForwardForm
