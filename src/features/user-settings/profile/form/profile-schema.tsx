'use client'

import { useTranslations } from 'next-intl'
import { z } from 'zod'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../../store/user-preferences-api-types'

export interface ProfileIdentityBaseline {
  mail?: string
  name?: string
  replyTo?: string
}

function rejectLockedChange(
  ctx: z.RefinementCtx,
  enabled: boolean,
  current: string,
  baseline: string | undefined,
  path: (string | number)[],
  message: string
) {
  if (enabled || baseline === undefined || current === baseline) return
  ctx.addIssue({ code: 'custom', path, message })
}

export const createProfileSchema = (
  t: ReturnType<typeof useTranslations>,
  t_commons: ReturnType<typeof useTranslations>,
  uiConfig?: Record<string, unknown>,
  initialIdentities?: ProfileIdentityBaseline[]
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
          mail: z.email({ message: t_commons('validation.email') }),
          name: z
            .string()
            .min(1, { message: t_commons('validation.required') }),
          replyTo: z.email({ message: t_commons('validation.email') }),
          isDefault: z.boolean().default(false),
          signatures: z.record(z.string(), z.string()).default({}),
        })
      )
      .min(1, { message: t_commons('validation.required') })
      .refine((identities) => identities.some((id) => id.isDefault), {
        message: t_commons('validation.identityAtLeastOneDefault'),
      })
      .superRefine((identities, ctx) => {
        identities.forEach((identity, index) => {
          const initial = initialIdentities?.[index]
          const message = t_commons('validation.required')
          rejectLockedChange(
            ctx,
            !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED,
            identity.mail,
            initial?.mail,
            [index, 'mail'],
            message
          )
          rejectLockedChange(
            ctx,
            !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED,
            identity.name,
            initial?.name,
            [index, 'name'],
            message
          )
          rejectLockedChange(
            ctx,
            !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED,
            identity.replyTo,
            initial?.replyTo,
            [index, 'replyTo'],
            message
          )
        })
      }),
  })

  return schema
}

export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>
