'use client'
import { z } from 'zod'

const schema = z.object({
  password: z.string(),
  newPassword: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    ),
  confirmPassword: z.string().min(8),
})

const defaultValues = {
  password: '',
  newPassword: '',
  confirmPassword: '',
}

export { defaultValues, schema }
