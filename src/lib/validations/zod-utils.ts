import { HOSTNAME_RE } from '@/lib/validations/regex'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Reusable server address refinement
// Accepts: a valid hostname (e.g. imap.example.com) OR an IPv4/IPv6 address.
// ---------------------------------------------------------------------------
export const serverAddress = (
  t: ReturnType<typeof useTranslations>,
  t_commons: ReturnType<typeof useTranslations>
) =>
  z
    .string()
    .min(1, t_commons('validation.required'))
    .refine(
      (val) => {
        // If it looks like an IP pattern, validate strictly as IP
        const looksLikeIp = /^[\d.]+$/.test(val)
        if (looksLikeIp) return z.ipv4().safeParse(val).success

        return HOSTNAME_RE.test(val) || z.ipv6().safeParse(val).success
      },
      { message: t('validation.server-invalid') }
    )
