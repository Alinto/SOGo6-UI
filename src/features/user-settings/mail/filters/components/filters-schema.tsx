'use client'
import { z, ZodArray, ZodObject, ZodType } from 'zod'
import { MailFilter } from '../mail-filters-types'

type MailFiltersSchema = ZodObject<{
  filters: ZodArray<
    ZodObject<{
      [K in keyof Partial<MailFilter>]: K extends keyof MailFilter
        ? ZodType<MailFilter[K]>
        : never
    }>
  >
}>

const schema = z.object({
  filters: z.array(
    z.object({
      enabled: z.boolean(),
      id: z.string(),
      name: z.string(),
      operator: z.string(),
      rules: z.array(
        z.object({
          id: z.string(),
          field: z.string(),
          field_value: z.string(),
          condition: z.string(),
          value: z.string(),
        })
      ),
      actions: z.array(
        z.object({
          id: z.string(),
          action: z.string(),
          value: z.string(),
        })
      ),
    })
  ),
}) satisfies MailFiltersSchema

export { schema }
