'use client'
import { z, ZodArray, ZodObject, ZodType } from 'zod'
import { MailLabel } from '../mail-labels-types'

type MailLabelsBookSchema = ZodObject<{
  labels: ZodArray<
    ZodObject<{
      [K in keyof Partial<MailLabel>]: K extends keyof MailLabel
        ? ZodType<MailLabel[K]>
        : never
    }>
  >
}>

const schema = z.object({
  labels: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      IMAPLabel: z.string(),
      color: z.string(),
    })
  ),
}) satisfies MailLabelsBookSchema

export { schema }
