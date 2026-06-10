'use client'

import { FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ProfileAvatar } from '@/features/user-profile/components/profile-avatar'
import { useTranslations } from 'next-intl'
import { Controller, UseFormReturn } from 'react-hook-form'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../../store/user-preferences-api-types'
import { ProfileFormData } from '../form/profile-schema'

interface BasicInfoTabProps {
  form: UseFormReturn<ProfileFormData>
  profilePictureSource?: string
}

export function BasicInfoTab({ form }: BasicInfoTabProps) {
  const t = useTranslations('FORM_PROFILE')
  const { control, watch } = form

  const selectedPictureSource = watch('profilePictureSource') || PP_DEFAULT
  const userEmail = watch('mail')

  return (
    <div className="space-y-8">
      {/* Main Content: Basic Info (Left) + Profile Picture (Right) */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* LEFT*/}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {t('profilePictureSource.title')}
            </h3>

            {/* Profile Picture Preview */}
            <div className="mb-6 flex flex-col items-center space-y-4">
              <div className="bg-muted/45 flex items-center justify-center rounded-lg p-4">
                <ProfileAvatar
                  pictureSource={selectedPictureSource}
                  email={userEmail}
                  fallbackUsername={watch('cn') || 'U'}
                  useInitialsFallback={true}
                  size="lg"
                />
              </div>

              {/* Selected Source Display */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  {selectedPictureSource === PP_DEFAULT &&
                    t('profilePictureSource.useDefault')}
                  {selectedPictureSource === PP_GRAVATAR &&
                    t('profilePictureSource.useGravatar')}
                  {selectedPictureSource === PP_LIBRAVATAR &&
                    t('profilePictureSource.useLibravatar')}
                  {selectedPictureSource === PP_USERSOURCE &&
                    t('profilePictureSource.useCustom')}
                </p>
              </div>
            </div>

            {/* Picture Source Description */}
            <p className="text-muted-foreground mb-4 text-sm">
              {t('profilePictureSource.description')}
            </p>

            {/* Picture Source Selection */}
            <Controller
              name="profilePictureSource"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={PP_DEFAULT} id="pic-default" />
                          <Label
                            htmlFor="pic-default"
                            className="cursor-pointer font-normal"
                          >
                            {t('profilePictureSource.useDefault')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={PP_GRAVATAR}
                            id="pic-gravatar"
                          />
                          <Label
                            htmlFor="pic-gravatar"
                            className="cursor-pointer font-normal"
                          >
                            {t('profilePictureSource.useGravatar')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={PP_LIBRAVATAR}
                            id="pic-libravatar"
                          />
                          <Label
                            htmlFor="pic-libravatar"
                            className="cursor-pointer font-normal"
                          >
                            {t('profilePictureSource.useLibravatar')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={PP_USERSOURCE}
                            id="pic-upload"
                          />
                          <Label
                            htmlFor="pic-upload"
                            className="cursor-pointer font-normal"
                          >
                            {t('profilePictureSource.useCustom')}
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* RIGHT*/}
        <div className="space-y-6">
          <h3 className="mb-4 text-lg font-semibold">{t('basicInfo.title')}</h3>
          <div>
            <div className="grid gap-4">
              {/* UID */}
              <FormItem>
                <FormLabel>{t('basicInfo.uid')}</FormLabel>
                <div className="border-input bg-muted flex items-center rounded-md border px-3 py-2">
                  <span className="text-sm">{watch('uid') || '-'}</span>
                </div>
              </FormItem>

              {/* Email */}
              <FormItem>
                <FormLabel>{t('basicInfo.email')}</FormLabel>
                <div className="border-input bg-muted flex items-center rounded-md border px-3 py-2">
                  <span className="text-sm">{watch('mail') || '-'}</span>
                </div>
              </FormItem>

              {/* Full Name */}
              <FormItem>
                <FormLabel>{t('basicInfo.fullName')}</FormLabel>
                <div className="border-input bg-muted flex items-center rounded-md border px-3 py-2">
                  <span className="text-sm">{watch('cn') || '-'}</span>
                </div>
              </FormItem>
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold">
                  {t('extraInfo.title')}
                </h3>
                {/* Team */}
                <FormItem>
                  <FormLabel>{t('extraInfo.team')}</FormLabel>
                  <div className="border-input bg-muted flex items-center rounded-md border px-3 py-2">
                    <span className="text-sm">{watch('team') || '-'}</span>
                  </div>
                </FormItem>

                {/* Company */}
                <FormItem>
                  <FormLabel>{t('extraInfo.company')}</FormLabel>
                  <div className="border-input bg-muted flex items-center rounded-md border px-3 py-2">
                    <span className="text-sm">{watch('company') || '-'}</span>
                  </div>
                </FormItem>

                {/* Aliases List */}
                {watch('aliases') && watch('aliases').length > 0 && (
                  <FormItem>
                    <FormLabel>{t('basicInfo.aliases')}</FormLabel>
                    <div className="border-input bg-muted rounded-md border p-3">
                      <div className="space-y-1">
                        {watch('aliases').map((alias, index) => (
                          <div key={index} className="text-sm">
                            {alias}
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormItem>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
