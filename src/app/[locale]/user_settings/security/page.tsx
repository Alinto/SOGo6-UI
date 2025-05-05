import PasswordForm from './form/password-form'
import TotpForm from './form/totp-form'

const ProfilePage = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">Security</h2>
      <PasswordForm />
      <TotpForm />
    </div>
  )
}

export default ProfilePage
