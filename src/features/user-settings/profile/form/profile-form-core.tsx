'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Separator } from '@/components/ui/separator'
import { useProfile } from '@/features/user-profile/hooks/use-profile'
import { useUpdateUserMailboxProfileMutation } from '@/features/user-settings/mail/external-accounts/store/mailboxes-api'
import { useUpdateUserPreferencesProfileMutation } from '@/features/user-settings/store/user-preferences-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { PP_DEFAULT } from '../../store/user-preferences-api-types'
import { BasicInfoTab } from '../components/basic-info-tab'
import { IdentitiesTab } from '../components/identities-tab'
import { createProfileSchema, ProfileFormData } from './profile-schema'

const ProfileFormCore = () => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('FORM_PROFILE')
  const {
    profile,
    user,
    isLoading,
    isError,
    mainAccount,
    uiSettings,
    preferences,
  } = useProfile()
  const [updateMailboxProfile, { isLoading: isUpdatingMailboxProfile }] =
    useUpdateUserMailboxProfileMutation()
  const [updatePreferences, { isLoading: isUpdatingPreferences }] =
    useUpdateUserPreferencesProfileMutation()

  // Create schema with UI config from API
  const uiConfig = uiSettings
  const schema = createProfileSchema(t, formT, uiConfig)

  // Default values from API
  // TODO get data (uid,mail,cn...) from API when available
  const defaultValues: ProfileFormData = {
    uid: user?.uid,
    mail: user?.email,
    cn: user?.cn,
    profilePictureSource:
      preferences?.USER_GENERAL?.SOGO_U_PROFILE_PICTURE || PP_DEFAULT,
    company: profile?.company || '',
    team: profile?.team || '',
    aliases: profile?.aliases || [],
    identities: mainAccount?.identities || [
      {
        mail: '',
        name: '',
        replyTo: '',
        isDefault: true,
        signatures: {},
      },
    ],
  }

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  // Update form when API data changes
  useEffect(() => {
    if (profile) {
      form.reset(defaultValues, {
        keepValues: false,
        keepDirty: false,
        keepDefaultValues: false,
      })
    }
  }, [profile, form])

  const { isDirty, isSubmitting } = form.formState

  async function onSubmit(values: ProfileFormData) {
    try {
      // Patch identities using updateUserMailbox with id 0
      await updateMailboxProfile({
        id: '0',
        identities: values.identities,
        _skipNotification: true,
      }).unwrap()

      // Patch profile picture using updateUserPreferencesGeneral
      await updatePreferences({
        SOGO_U_PROFILE_PICTURE: values.profilePictureSource,
      }).unwrap()
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-6 text-center">
            <p className="text-muted-foreground">{t('api.loading.string')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            {t('api.load_failed.string')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-30">
          <CardHeader>
            <div>
              <CardDescription>{t('description')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <BasicInfoTab
                form={form}
                profilePictureSource={defaultValues.profilePictureSource}
              />
            </div>
            <Separator />

            {/* Identities Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {t('sections.identities')}
                </h3>
              </div>
              <IdentitiesTab form={form} uiConfig={uiConfig} />
            </div>
          </CardContent>
        </Card>

        <FixedFormButtonGroup
          onReset={() => form.reset()}
          disableReset={
            !isDirty ||
            isSubmitting ||
            isUpdatingMailboxProfile ||
            isUpdatingPreferences
          }
          disableSubmit={
            !isDirty ||
            isSubmitting ||
            isUpdatingMailboxProfile ||
            isUpdatingPreferences
          }
          errors={form.formState.errors}
        />
      </form>
    </Form>
  )
}

export default ProfileFormCore
