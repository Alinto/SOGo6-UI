'use client'
import { z } from 'zod'

const schema = z.object({
  enabled: z.boolean(),
  emails: z.array(z.object({ value: z.string().email() })),
  message: z.string().nonempty({ message: 'required.common' }),
  email: z
    .string()
    .min(0)
    .email({
      message: 'invalid.email',
    })
    .or(z.literal('')),
})

const defaultValues = {
  enabled: false,
  emails: [{ value: 'henry@fafenback.org' }],
  email: '',
  message: 'New message received on your account',
}

export { defaultValues, schema }
