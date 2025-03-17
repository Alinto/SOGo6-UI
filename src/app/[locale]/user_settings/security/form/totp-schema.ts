'use client'
import { z } from 'zod'

const schema = z.object({
  totp: z.boolean(),
})

const defaultValues = {
  totp: false,
}

export { defaultValues, schema }
