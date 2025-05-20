'use client'

import ProfileForm from '@/features/user-settings/profile/form/profile-form'

const ProfilePage = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">Profile</h2>
      <ProfileForm />
    </div>
  )
}

export default ProfilePage
