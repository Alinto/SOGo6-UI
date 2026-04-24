'use client'

import { useTranslations } from 'next-intl'
import { z } from 'zod'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../../store/user-preferences-api-types'

export const createProfileSchema = (
  t: ReturnType<typeof useTranslations>,
  t_commons: ReturnType<typeof useTranslations>,
  uiConfig?: Record<string, unknown>
) => {
  const schema = z.object({
    //Basic info
    uid: z.string().readonly().optional(),
    mail: z.string().email().readonly().optional(),
    cn: z.string().readonly().optional(),
    // Profile picture selection
    profilePictureSource: z.enum([
      PP_USERSOURCE,
      PP_GRAVATAR,
      PP_LIBRAVATAR,
      PP_DEFAULT,
    ]),
    //Extra Info
    company: z.string().optional(),
    team: z.string().optional(),
    aliases: z.array(z.string().email()).default([]),
    //Identities
    identities: z
      .array(
        z.object({
          mail: z.email({ message: t_commons('validation.email') }).refine(
            // It's allowed to change email only if SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED
            () => !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED || true,
            { message: t_commons('validation.required') }
          ),
          name: z
            .string()
            .min(1, { message: t_commons('validation.required') })
            .refine(
              // Name is editable if SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED
              () => !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED || true,
              { message: t_commons('validation.required') }
            ),
          replyTo: z.email({ message: t_commons('validation.email') }).refine(
            // ReplyTo is editable if SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED
            () => !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED || true,
            { message: t_commons('validation.required') }
          ),
          isDefault: z.boolean().default(false),
          signatures: z.record(z.string(), z.string()).default({}),
        })
      )
      .min(1, { message: t_commons('validation.required') })
      .refine((identities) => identities.some((id) => id.isDefault), {
        message: t_commons('validation.identityAtLeastOneDefault'),
      }),
  })

  return schema
}

export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>
