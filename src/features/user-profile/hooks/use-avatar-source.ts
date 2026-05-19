import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../../user-settings/store/user-preferences-api-types'

type AvatarSource =
  | { type: 'image'; src: string; alt: string }
  | { type: 'fallback'; alt: string }

export interface AvatarSourceProps {
  pictureSource:
    | typeof PP_DEFAULT
    | typeof PP_GRAVATAR
    | typeof PP_LIBRAVATAR
    | typeof PP_USERSOURCE
  email?: string
  userSourceBase64?: string
}

/**
 * Generate avatar URL or data based on profile picture source
 * Handles gravatar, libravatar, custom upload, and default fallback
 */
export const useAvatarSource = ({
  pictureSource,
  email,
  userSourceBase64,
}: AvatarSourceProps): AvatarSource => {
  const [avatarSource, setAvatarSource] = useState<AvatarSource>({
    type: 'fallback',
    alt: 'Default Avatar',
  })
  const t = useTranslations('FORM_PROFILE')

  useEffect(() => {
    let cancelled = false

    const generateHash = async (str: string): Promise<string> => {
      try {
        const subtle = globalThis.crypto?.subtle
        if (!subtle?.digest) return ''
        const buf = await subtle.digest(
          'SHA-256',
          new TextEncoder().encode(str)
        )
        return Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      } catch {
        return ''
      }
    }

    const applyFallback = () => {
      setAvatarSource({
        type: 'fallback',
        alt: t('profilePictureSource.useDefault'),
      })
    }

    const resolve = async () => {
      const needsHash =
        pictureSource === PP_GRAVATAR || pictureSource === PP_LIBRAVATAR
      const emailHash =
        needsHash && email ? await generateHash(email.trim().toLowerCase()) : ''

      if (cancelled) return

      switch (pictureSource) {
        case PP_GRAVATAR:
          setAvatarSource({
            type: 'image',
            src: `https://www.gravatar.com/avatar/${emailHash}?d=mp&s=200`,
            alt: t('profilePictureSource.useGravatar'),
          })
          break
        case PP_LIBRAVATAR:
          setAvatarSource({
            type: 'image',
            src: `https://seccdn.libravatar.org/avatar/${emailHash}?d=mp&s=200`,
            alt: t('profilePictureSource.useLibravatar'),
          })
          break
        case PP_USERSOURCE:
          setAvatarSource({
            type: 'image',
            src: userSourceBase64 || '',
            alt: t('profilePictureSource.useCustom'),
          })
          break
        case PP_DEFAULT:
        default:
          applyFallback()
      }
    }

    resolve().catch(() => {
      if (!cancelled) applyFallback()
    })

    return () => {
      cancelled = true
    }
  }, [pictureSource, email, userSourceBase64])

  return avatarSource
}
